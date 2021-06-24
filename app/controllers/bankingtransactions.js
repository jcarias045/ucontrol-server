const bankingTransaction= require('../models/bankingtransaction.model');
const bankAccount= require('../models/bankaccount.model');
const bankTranfers= require('../models/logbanktransfer.model');

//PARA EMITIR CHEQUES
const writeCheck= require('../models/writecheck.model');
const checkbook= require('../models/checkbook.model');


function createBankingTransaction(req, res){
    const BankingTransaction = new bankingTransaction();
    const BankingTransaction2 = new bankingTransaction();
    const logTransferencia = new bankTranfers();
    const docwriteCheck = new writeCheck();
    let now= new Date();
    let creacion=now.toISOString().substring(0, 10);
    const {Type, TransactionDate, Concepto, OperationNumber,User,DocumentNumber,Deposit,Withdrawal,BankMovement, 
        BankMovementName, ConceptName,DestinationAccount,BankId,CurrentAccount,NumberAccount,BankOrigin,ChequeraId,
        NoChequeAct,Receiver,NoCheque} = req.body

    BankingTransaction.Type= Type
    BankingTransaction.TransactionDate= TransactionDate;
    BankingTransaction.Concept= Concepto;
    BankingTransaction.OperationNumber=OperationNumber;
    BankingTransaction.User= User;
    BankingTransaction.DocumentNumber=ConceptName==="Cheque" && BankMovementName==="Retiro"?NoCheque: DocumentNumber;
    BankingTransaction.Deposit= Deposit?Deposit:0;
    BankingTransaction.Withdrawal= Withdrawal? Withdrawal:0;
    BankingTransaction.BankMovement= BankMovement;
    BankingTransaction.Account= CurrentAccount;

    console.log(BankMovementName);
    BankingTransaction.save(async (err, BankingTransactionStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!BankingTransactionStored){
                res.status(500).send({message: "Error"});
            }else{
                 //consultar saldo de la cuenta origen
                 let transaccionId=BankingTransactionStored._id;
                 let saldoCurrentAccount=await bankAccount.findOne({_id:CurrentAccount},'Saldo').then(result=>{return result.Saldo});
                 console.log("SALDO DE LA CUENTA ACTUAL", saldoCurrentAccount);
                if(BankMovementName==="Transferencias"){
                  
                    if(ConceptName==="Transferencia interna"){
                        console.log("TRANSFERENCIA INTERNAAA");
                        //saldo de la cuenta destino
                        let saldoDestinationAccount=await bankAccount.findOne({_id:DestinationAccount},'Saldo').then(result=>{return result.Saldo});
                        console.log("SALDO DE LA CUENTA ACTUAL", saldoDestinationAccount);
                        let band=parseFloat(saldoCurrentAccount).toFixed(2)-parseFloat(Withdrawal).toFixed(2);
                        if(band<=0){
                            res.status(500).send({message: "Saldo Insuficiente"});
                        }else{
                            bankAccount.findByIdAndUpdate({_id:CurrentAccount},
                                {Saldo: parseFloat(parseFloat(saldoCurrentAccount) - parseFloat(Withdrawal)).toFixed(2)},
                                (err,updateDeuda)=>{
                                if(err){
                                    console.log(err);
                                }
                            });
                            BankingTransaction2.Type= Type;
                            BankingTransaction2.TransactionDate= TransactionDate;
                            BankingTransaction2.Concept= "Transferencia Interna desde la cuenta:  "+ NumberAccount;
                            BankingTransaction2.OperationNumber=OperationNumber;
                            BankingTransaction2.User= User;
                            BankingTransaction2.DocumentNumber= DocumentNumber;
                            BankingTransaction2.Deposit=  parseFloat(Withdrawal).toFixed(2);
                            BankingTransaction2.Withdrawal= 0;
                            BankingTransaction2.BankMovement= BankMovement;
                            BankingTransaction2.Account= DestinationAccount;
                            BankingTransaction2.save(async (err, BankingTransactionStored)=>{
                                if(err){
                                    
                                }else{
                                     bankAccount.findByIdAndUpdate({_id:DestinationAccount},
                                        {Saldo: parseFloat(parseFloat(saldoDestinationAccount)+ parseFloat(Withdrawal)).toFixed(2)},
                                        (err,updateDeuda)=>{
                                        if(err){
                                            console.log(err);
                                        }
                                    });

                                   
                                    logTransferencia.TransactionDate= TransactionDate;
                                    logTransferencia.Concept= Concepto;
                                    logTransferencia.OperationNumber=OperationNumber;
                                    logTransferencia.User= User;
                                    logTransferencia.DocumentNumber= DocumentNumber;
                                    logTransferencia.Deposit=  parseFloat(Withdrawal).toFixed(2);
                                    logTransferencia.Withdrawal= 0;
                                    logTransferencia.AccountOrigin= CurrentAccount;
                                    logTransferencia.AccountDestination=DestinationAccount;
                                    logTransferencia.BankOrigin= BankOrigin;
                                    logTransferencia.BankDestination=BankId;
                                    logTransferencia.BankDestination=BankId;
                                    logTransferencia.Document=transaccionId;
                                    logTransferencia.save(async (err, BankingTransactionStored)=>{
                                        if(err){
                                            console.log(err);
                                        }else{}
                                    });
                                    
                                }
                            });
                           
                        }
                    }
                    if(ConceptName==="Transferencia a Terceros"){
                        let band=parseFloat(saldoCurrentAccount).toFixed(2)-parseFloat(Withdrawal).toFixed(2);
                        if(band<=0){
                            res.status(500).send({message: "Saldo Insuficiente"});
                        }else{
                            bankAccount.findByIdAndUpdate({_id:CurrentAccount},
                                {Saldo:parseFloat(parseFloat(saldoCurrentAccount) - parseFloat(Withdrawal)) },
                                (err,updateDeuda)=>{
                                if(err){
                                    console.log(err);
                                }
                            });
                        }
                    }
                }
                if(BankMovementName==="Abono" ){
                    bankAccount.findByIdAndUpdate({_id:CurrentAccount},
                        {Saldo: parseFloat(parseFloat(saldoCurrentAccount) + parseFloat(Deposit)).toFixed(2)},
                        (err,updateDeuda)=>{
                        if(err){
                            console.log(err);
                        }
                    });
                }
                if(BankMovementName==="Retiro" ){
                    bankAccount.findByIdAndUpdate({_id:CurrentAccount},
                        {Saldo: parseFloat(parseFloat(saldoCurrentAccount) - parseFloat(Withdrawal)).toFixed(2)},
                        (err,updateDeuda)=>{
                        if(err){
                            console.log(err);
                        }
                    });
                      //en caso de cheque 
                      if(ConceptName==="Cheque"){
                        docwriteCheck.Checkbook= ChequeraId;
                        docwriteCheck.Bank= BankId;
                        docwriteCheck.User= User;
                        docwriteCheck.State="Aplicado";
                        docwriteCheck.CreationDate=creacion;
                        docwriteCheck.Receiver=Receiver;
                        docwriteCheck.Amount=Withdrawal;
                        docwriteCheck.CheckNumber=NoCheque;
                        docwriteCheck.Comment="Generado en transaccion bancaria";
                        docwriteCheck.Active=true;
                        docwriteCheck.save((err, docwriteCheckStored)=>{
                            if(err){
                                console.log(err);
                                res.status(500).send({message: "Error en el servidor"});
                            }else{
                                if(!docwriteCheckStored){
                                    res.status(500).send({message: "Error"});
                                }else{
                                    let salto=parseInt(NoChequeAct)+1;
                                    checkbook.findByIdAndUpdate({_id:ChequeraId},{CurrentNumber:salto},(err,CheckbookUpdate)=>{
                                        if(err){
                                            console.log(err);
                                        }else{
                                           
                                        }
                                    })
                                   
                                }
                            }
                        });
                       
                    }
                }

                res.status(200).send({BankingTransaction: BankingTransactionStored})
            }
        }
    });
}


function getBankingTransaction(req, res){
    // Buscamos informacion para llenar el modelo de 
    let id=req.params.id;
    let companyId=req.params.company;
    try{
        bankingTransaction.find({Account: id})
        .populate({path:'User', model: 'User', match:{Company: companyId}})
        .populate({path:'BankMovement', model: 'BankMovement'})
        .populate({path:'Type', model: 'Concept'})
        .then(BankingTransaction => {
            res.status(200).send({BankingTransaction});
          
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

async function updateBankingTransaction(req,res){
    
    const params = req.params;
    console.log("loq ue se obyirnr", req.body);
    const {Type, TransactionDate, Concepto, OperationNumber,User,DocumentNumber,Deposit,Withdrawal,BankMovement, 
        BankMovementName, ConceptName,DestinationAccount,BankId,CurrentAccount,NumberAccount,BankOrigin,
        MontoAnterior,BankMovementini,ConceptNameini} = req.body
    let update={
        Type:Type,
        TransactionDate:TransactionDate,
        Concept:Concepto,
        OperationNumber:OperationNumber,
        User:User,
        DocumentNumber:DocumentNumber,
        Deposit:Deposit?Deposit:0,
        Withdrawal:Withdrawal? Withdrawal:0,
        BankMovement:BankMovement,
        Account:CurrentAccount,
    }
     bankingTransaction.findByIdAndUpdate({_id: params.id}, update, async (err, transactionUpdate)=>{
        if(err){
            res.status(500).send({message: "Error del Servidor."});
        } else {
            if(!transactionUpdate){
                res.status(404).send({message: "No hay"});
            }else{

                 //consultar saldo de la cuenta origen
                 let transaccionId=transactionUpdate._id;
                
                
                if(BankMovementName==="Transferencias"){
                    let saldo=await bankAccount.findOne({_id:CurrentAccount},'Saldo').then(result=>{return result.Saldo});
               
                    bankAccount.findByIdAndUpdate({_id:CurrentAccount},
                       {Saldo: parseFloat(parseFloat(saldo) + parseFloat(MontoAnterior)).toFixed(2)},
                       (err,updateDeuda)=>{
                       if(err){
                           console.log(err);
                       }
                   });
                   let saldoCurrentAccount=await bankAccount.findOne({_id:CurrentAccount},'Saldo').then(result=>{return result.Saldo});
                  
                    if(ConceptName==="Transferencia interna"){
                        console.log("TRANSFERENCIA INTERNAAA");
                        //saldo de la cuenta destino
                        let saldoDestinationAccount=await bankAccount.findOne({_id:DestinationAccount},'Saldo').then(result=>{return result.Saldo});
                        console.log("SALDO DE LA CUENTA ACTUAL", saldoDestinationAccount);
                        let band=parseFloat(saldoCurrentAccount).toFixed(2)-parseFloat(Withdrawal).toFixed(2);
                        if(band<=0){
                            res.status(500).send({message: "Saldo Insuficiente"});
                        }else{
                            bankAccount.findByIdAndUpdate({_id:CurrentAccount},
                                {Saldo: parseFloat(parseFloat(saldoCurrentAccount) - parseFloat(Withdrawal)).toFixed(2)},
                                (err,updateDeuda)=>{
                                if(err){
                                    console.log(err);
                                }
                            });
                            BankingTransaction2.Type= Type;
                            BankingTransaction2.TransactionDate= TransactionDate;
                            BankingTransaction2.Concept= "Transferencia Interna desde la cuenta:  "+ NumberAccount;
                            BankingTransaction2.OperationNumber=OperationNumber;
                            BankingTransaction2.User= User;
                            BankingTransaction2.DocumentNumber= DocumentNumber;
                            BankingTransaction2.Deposit=  parseFloat(Withdrawal).toFixed(2);
                            BankingTransaction2.Withdrawal= 0;
                            BankingTransaction2.BankMovement= BankMovement;
                            BankingTransaction2.Account= DestinationAccount;
                            BankingTransaction2.save(async (err, BankingTransactionStored)=>{
                                if(err){
                                    
                                }else{
                                     bankAccount.findByIdAndUpdate({_id:DestinationAccount},
                                        {Saldo: parseFloat(parseFloat(saldoDestinationAccount)+ parseFloat(Withdrawal)).toFixed(2)},
                                        (err,updateDeuda)=>{
                                        if(err){
                                            console.log(err);
                                        }
                                    });

                                   
                                    logTransferencia.TransactionDate= TransactionDate;
                                    logTransferencia.Concept= Concepto;
                                    logTransferencia.OperationNumber=OperationNumber;
                                    logTransferencia.User= User;
                                    logTransferencia.DocumentNumber= DocumentNumber;
                                    logTransferencia.Deposit=  parseFloat(Withdrawal).toFixed(2);
                                    logTransferencia.Withdrawal= 0;
                                    logTransferencia.AccountOrigin= CurrentAccount;
                                    logTransferencia.AccountDestination=DestinationAccount;
                                    logTransferencia.BankOrigin= BankOrigin;
                                    logTransferencia.BankDestination=BankId;
                                    logTransferencia.BankDestination=BankId;
                                    logTransferencia.Document=transaccionId;
                                    logTransferencia.save(async (err, BankingTransactionStored)=>{
                                        if(err){
                                            console.log(err);
                                        }else{}
                                    });
                                    
                                }
                            });
                           
                        }
                    }
                    if(ConceptName==="Transferencia a Terceros"){
                        let band=parseFloat(saldoCurrentAccount).toFixed(2)-parseFloat(Withdrawal).toFixed(2);
                        if(band<=0){
                            res.status(500).send({message: "Saldo Insuficiente"});
                        }else{
                            bankAccount.findByIdAndUpdate({_id:CurrentAccount},
                                {Saldo:parseFloat(parseFloat(saldoCurrentAccount) - parseFloat(Withdrawal)) },
                                (err,updateDeuda)=>{
                                if(err){
                                    console.log(err);
                                }
                            });
                        }
                    }
                }
                if(BankMovementName==="Abono" ){
                    let saldo=await bankAccount.findOne({_id:CurrentAccount},'Saldo').then(result=>{return result.Saldo});
               
                    bankAccount.findByIdAndUpdate({_id:CurrentAccount},
                       {Saldo: parseFloat(parseFloat(saldo) - parseFloat(MontoAnterior)).toFixed(2)},
                       (err,updateDeuda)=>{
                       if(err){
                           console.log(err);
                       }
                   });
                   let saldoCurrentAccount=await bankAccount.findOne({_id:CurrentAccount},'Saldo').then(result=>{return result.Saldo});
                    bankAccount.findByIdAndUpdate({_id:CurrentAccount},
                        {Saldo: parseFloat(parseFloat(saldoCurrentAccount) + parseFloat(Deposit)).toFixed(2)},
                        (err,updateDeuda)=>{
                        if(err){
                            console.log(err);
                        }
                    });
                }
                if(BankMovementName==="Retiro" ){
                    let saldo=await bankAccount.findOne({_id:CurrentAccount},'Saldo').then(result=>{return result.Saldo});
               
                    bankAccount.findByIdAndUpdate({_id:CurrentAccount},
                       {Saldo: parseFloat(parseFloat(saldo) + parseFloat(MontoAnterior)).toFixed(2)},
                       (err,updateDeuda)=>{
                       if(err){
                           console.log(err);
                       }
                   });
                   let saldoCurrentAccount=await bankAccount.findOne({_id:CurrentAccount},'Saldo').then(result=>{return result.Saldo});
                    bankAccount.findByIdAndUpdate({_id:CurrentAccount},
                        {Saldo: parseFloat(parseFloat(saldoCurrentAccount) - parseFloat(Deposit)).toFixed(2)},
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
    getBankingTransaction,
    createBankingTransaction,
    updateBankingTransaction
}