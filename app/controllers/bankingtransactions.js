const bankingTransaction= require('../models/bankingtransaction.model');

function createBankingTransaction(req, res){
    const BankingTransaction = new bankingTransaction();

    const {SourceDocument, TransactionDate, Concept, OperationNumber,User,Reference,Deposit,Withdrawal} = req.body

    BankingTransaction.SourceDocument= SourceDocument
    BankingTransaction.TransactionDate= TransactionDate;
    BankingTransaction.Concept= Concept;
    BankingTransaction.OperationNumber=OperationNumber;
    BankingTransaction.User= User;
    BankingTransaction.Reference= Reference;
    BankingTransaction.Deposit= Deposit;
    BankingTransaction.Withdrawal= Withdrawal;

    console.log(BankingTransaction);
    BankingTransaction.save((err, BankingTransactionStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!BankingTransactionStored){
                res.status(500).send({message: "Error"});
            }else{
                res.status(200).send({BankingTransaction: BankingTransactionStored})
            }
        }
    });
}


function getBankingTransaction(req, res){
    // Buscamos informacion para llenar el modelo de 
    let doc=req.params.doc;
    let companyId=req.params.company;
    try{
        bankingTransaction.find().populate({path:'User', model: 'User', match:{Company: companyId}})
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

module.exports={
    getBankingTransaction,
    createBankingTransaction
}