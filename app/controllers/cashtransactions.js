const cashTransaction= require('../models/cashtransaction.model');
const cashAccount= require('../models/cashaccounts.model');
const bankTranfers= require('../models/logbanktransfer.model');


function createCashTransaction(req, res){
    const CashTransaction = new cashTransaction();
    

    const {Type, TransactionDate, Concepto, OperationNumber,User,DocumentNumber,Deposit,Withdrawal,BankMovement, 
        BankMovementName, ConceptName,DestinationAccount,BankId,CurrentAccount,NumberAccount,BankOrigin} = req.body

    console.log(req.body);
    CashTransaction.TransactionDate= TransactionDate;
    CashTransaction.Concept= Concepto;  
    CashTransaction.User= User; 
    CashTransaction.Deposit= Deposit?Deposit:0;
    CashTransaction.Withdrawal= Withdrawal? Withdrawal:0;
    CashTransaction.CashMovement= BankMovement;
    CashTransaction.CashAccount= CurrentAccount;
   

    console.log(CashTransaction);
    CashTransaction.save(async (err, CashTransactionStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!CashTransactionStored){
                res.status(500).send({message: "Error"});
            }else{
                let saldoCurrentAccount=await cashAccount.findOne({_id:CurrentAccount},'Saldo').then(result=>{return result.Saldo});
                if(BankMovementName==="Apertura" || BankMovementName==="Ingreso"){
                    cashAccount.findByIdAndUpdate({_id:CurrentAccount},
                        {Saldo: parseFloat(parseFloat(saldoCurrentAccount) + parseFloat(Deposit)).toFixed(2)},
                        (err,updateDeuda)=>{
                        if(err){
                            console.log(err);
                        }
                    });

                }
                if(BankMovementName==="Egreso"){
                    cashAccount.findByIdAndUpdate({_id:CurrentAccount},
                        {Saldo: parseFloat(parseFloat(saldoCurrentAccount) - parseFloat(Withdrawal)).toFixed(2)},
                        (err,updateDeuda)=>{
                        if(err){
                            console.log(err);
                        }
                    });

                }
                res.status(200).send({CashTransaction: CashTransactionStored})
            }
        }
    });
}


function getCashTransaction(req, res){
    // Buscamos informacion para llenar el modelo de 
    let id=req.params.id;
    let companyId=req.params.company;
    try{
        cashTransaction.find({CashAccount: id})
        .populate({path:'User', model: 'User'})
        .populate({path:'CashMovement', model: 'CashMovement'})
        .then(CashTransaction => {
            res.status(200).send({CashTransaction});
          
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

async function updateCashTransaction(req,res){
    
    const params = req.params;
    console.log("loq ue se obyirnr", req.body);
    const {Type, TransactionDate, Concepto, OperationNumber,User,DocumentNumber,Deposit,Withdrawal,CashMovement, 
        BankMovementName, ConceptName,DestinationAccount,BankId,CurrentAccount,NumberAccount,BankOrigin,
        MontoAnterior,BankMovementini,ConceptNameini,_id} = req.body
    let update={
        Type:Type,
        TransactionDate:TransactionDate,
        Concept:Concepto,
        OperationNumber:OperationNumber,
        User:User,
        DocumentNumber:DocumentNumber,
        Deposit:Deposit?Deposit:0,
        Withdrawal:Withdrawal? Withdrawal:0,
        CashMovement:CashMovement,
        Account:CurrentAccount,
    }
     cashTransaction.findByIdAndUpdate({_id:_id}, update, async (err, transactionUpdate)=>{
        if(err){
            res.status(500).send({message: "Error del Servidor."});
        } else {
            if(!transactionUpdate){
                res.status(404).send({message: "No hay"});
            }else{
                
                
                if(BankMovementName==="Apertura" || BankMovementName==="Ingreso"){
                    let saldo=await cashAccount.findOne({_id:CurrentAccount},'Saldo').then(result=>{return result.Saldo});
               
                cashAccount.findByIdAndUpdate({_id:CurrentAccount},
                    {Saldo: parseFloat(parseFloat(saldo) - parseFloat(MontoAnterior)).toFixed(2)},
                    (err,updateDeuda)=>{
                    if(err){
                        console.log(err);
                    }else{
                        console.log(updateDeuda);
                    }
                });

                let saldoCurrentAccount=await cashAccount.findOne({_id:CurrentAccount},'Saldo').then(result=>{return result.Saldo});
                    console.log("ACTULIZANDO",saldoCurrentAccount);
                    cashAccount.findByIdAndUpdate({_id:CurrentAccount},
                        {Saldo: parseFloat(parseFloat(saldoCurrentAccount) + parseFloat(Deposit)).toFixed(2)},
                        (err,updateDeuda)=>{
                        if(err){
                            console.log(err);
                        }
                    });

                }
                if(BankMovementName==="Egreso"){
                    let saldo=await cashAccount.findOne({_id:CurrentAccount},'Saldo').then(result=>{return result.Saldo});
               
                cashAccount.findByIdAndUpdate({_id:CurrentAccount},
                    {Saldo: parseFloat(parseFloat(saldo) + parseFloat(MontoAnterior)).toFixed(2)},
                    (err,updateDeuda)=>{
                    if(err){
                        console.log(err);
                    }
                });

                let saldoCurrentAccount=await cashAccount.findOne({_id:CurrentAccount},'Saldo').then(result=>{return result.Saldo});
                    cashAccount.findByIdAndUpdate({_id:CurrentAccount},
                        {Saldo: parseFloat(parseFloat(saldoCurrentAccount) - parseFloat(Withdrawal)).toFixed(2)},
                        (err,updateDeuda)=>{
                        if(err){
                            console.log(err);
                        }
                    });

                }

  
                res.status(200).send({act:transactionUpdate })
            }
        }
    })
}

module.exports={
    getCashTransaction,
    createCashTransaction,
    updateCashTransaction
}