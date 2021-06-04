const writeCheck= require('../models/writecheck.model');
const checkbook= require('../models/checkbook.model');
//registro de movimientos bancarios
const bankingTransaction= require('../models/bankingtransaction.model');
const bankAccount= require('../models/bankaccount.model');
const bankMovement= require('../models/bankmovement.model');
const movementType= require('../models/concepts.model'); 


async function createWriteCheck(req, res){
    const docwriteCheck = new writeCheck();

    const { Checkbook, Bank,User,CreationDate,Receiver,Amount,CheckNumber,CurrentNumber,Comment} = req.body
    let fecha=new Date(CreationDate);
    let creacion=fecha.toISOString().substring(0, 10);
    docwriteCheck.Checkbook= Checkbook;
    docwriteCheck.Bank= Bank;
    docwriteCheck.User= User;
    docwriteCheck.State="Creado";
    docwriteCheck.CreationDate=creacion;
    docwriteCheck.Receiver=Receiver;
    docwriteCheck.Amount=Amount;
    docwriteCheck.CheckNumber=CheckNumber;
    docwriteCheck.Comment=Comment;
    docwriteCheck.Active=true;

        docwriteCheck.save((err, docwriteCheckStored)=>{
        if(err){
            console.log(err);
            res.status(500).send({message: "Error en el servidor"});
        }else{
            if(!docwriteCheckStored){
                res.status(500).send({message: "Error"});
            }else{
                let salto=parseInt(CurrentNumber)+1;
                checkbook.findByIdAndUpdate({_id:Checkbook},{CurrentNumber:salto},(err,CheckbookUpdate)=>{
                    if(err){
                        console.log(err);
                    }else{
                        if(!CheckbookUpdate){
                            res.status(404).send({message: "No hay"});
                        }else{
                             res.status(200).send({docwriteCheck: docwriteCheckStored})
                        }
                    }
                })
               
            }
        }
    });
   
    

   
}


function getWriteCheck(req, res){
    // Buscamos informacion para llenar el modelo de 
    let doc=req.params.doc;
    let id=req.params.id;
    try{
        writeCheck.find({Checkbook:id}).populate({path:'Checkbook' , model: 'Checkbook'}).populate({path:'Bank', model: 'Bank'})
        .then(docwriteCheck => {
            res.status(200).send({docwriteCheck});
          
        })
    }catch(error) {
        // imprimimos a consola
        console.log(error);

        res.status(500).json({
            message: "Error en query!",
            error: error
        });
    }
}



function desactivateWriteCheck(req,res){
    
    const params = req.params;
    
    writeCheck.findByIdAndUpdate({_id:params.id},{Active:false},(err,writeCheckUpdate)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!writeCheckUpdate){
                res.status(404).send({message: "No se actualizo registro"});
            }else{
                
                res.status(200).send({correlativo: writeCheckUpdate})
            }
        }
    });
}

async function checkCashed(req, res){   //para colocar que el cheque fue cobrado
    const BankingTransaction = new bankingTransaction();

    const {companyId,Comment,User,CheckNumber, Amount, Checkbook,_id}=req.body;
    let now= new Date();
    let fechaAct=now.toISOString().substring(0, 10);
    ///////********OBTENIENDO CODIGOS DE MOVIMIENTOS Y TIPOS ******** */
    let saldoCurrentAccount=await bankAccount.findOne({_id:Checkbook.BankAccount},'Saldo').then(result=>{return result.Saldo});
    let idMovimiento;
    let idTipoMovimiento;     
  
  
    idMovimiento=await bankMovement.findOne({Name:'Retiro', Company:companyId},['_id'])
    .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

    idTipoMovimiento=await movementType.findOne({Name:'Cheque', Company:companyId},['_id'])
    .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});


    ///////********OBTENIENDO CODIGOS DE MOVIMIENTOS Y TIPOS fin ******** */

    BankingTransaction.Type= idTipoMovimiento
    BankingTransaction.TransactionDate= fechaAct;
    BankingTransaction.Concept= Comment;
    BankingTransaction.OperationNumber=0;
    BankingTransaction.User= User;
    BankingTransaction.DocumentNumber= CheckNumber;
    BankingTransaction.Deposit= 0;
    BankingTransaction.Withdrawal= Amount;
    BankingTransaction.BankMovement= idMovimiento;
    BankingTransaction.Account= Checkbook.BankAccount;

    
    if(parseFloat(saldoCurrentAccount)>=parseFloat(Amount)){
        console.log("tiene fondo");
        BankingTransaction.save(async (err, BankingTransactionStored)=>{
        if(err){
            console.log(err);
            res.status(500).send({message: "Error en el servidor"});
        }else{
            if(!BankingTransactionStored){
                res.status(500).send({message: "Error"});
            }else{
                
                bankAccount.findByIdAndUpdate({_id:Checkbook.BankAccount},
                    {Saldo: parseFloat(parseFloat(saldoCurrentAccount) - parseFloat(Amount)).toFixed(2)},
                    (err,updateDeuda)=>{
                    if(err){
                        console.log(err);
                    }
                });

                writeCheck.findByIdAndUpdate({_id:_id},{State:"Aplicado"},(err,writeCheckUpdate)=>{
                    if(err){
                        console.log(err);
                        res.status(500).send({message: "Error en el servidor"});
                    }else{
                        if(!writeCheckUpdate){
                            res.status(404).send({message: "No se actualizo registro"});
                        }else{
                           
                            res.status(200).send({correlativo: writeCheckUpdate})
                        }
                    }
                });

            }
        }
    });
    }else{
        console.log("no tiene");
        res.status(500).send({message: "Sin Fondos"});
    }
    
}

function updateWriteCheck(req, res){
    let BankAccountData = req.body;
    const params = req.params;

    writeCheck.findByIdAndUpdate({_id: params.id}, BankAccountData, (err, BankAccountUpdate)=>{
        if(err){
            console.log(err);
            res.status(500).send({message: "Error del Servidor."});
        } else {
            if(!BankAccountUpdate){
                res.status(404).send({message: "No se edito registro"});
            }else{
                res.status(200).send({banco: BankAccountUpdate})
            }
        }
    })
}


module.exports={
    getWriteCheck,
    createWriteCheck,
    checkCashed,
    updateWriteCheck,
    desactivateWriteCheck
}