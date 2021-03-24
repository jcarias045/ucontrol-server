const BankAccount = require('../models/bankaccount.model')

function CreatBankAccounts(req,res){

    const bankAccount = new BankAccount();

    const {NumberAccount,Company, Bank} = req.body

    bankAccount.NumberAccount = NumberAccount;
    bankAccount.Bank = Bank;
    bankAccount.Company = Company;
    bankAccount.Active = true;

    bankAccount.save((err, bankAccountStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!bankAccountStored){
                res.status(500).send({message: "Error"});
            }else{
                res.status(200).send({bankAccount: bankAccountStored})
            }
        }
    });

}

function GetBankAccount(req,res){

    BankAccount.find({Company: req.params.id, Bank: req.params.bankid})
    .populate({path: 'Company', model: 'Company'})
    .populate({path: 'Bank', model: 'Bank'})
    .then(bankAccount => {
        if(!bankAccount){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({bankAccount})
        }
    });
}

function updateBankAccount(req, res){
    let BankAccountData = req.body;
    const params = req.params;

    Bank.findByIdAndUpdate({_id: params.id}, BankAccountData, (err, BankAccountUpdate)=>{
        if(err){
            res.status(500).sen({message: "Error del Servidor."});
        } else {
            if(!BankAccountUpdate){
                res.status(404).sen({message: "No hay"});
            }else{
                res.status(200).send({message: "Banca Actualizado"})
            }
        }
    })
}

module.exports = {
    CreatBankAccounts,
    GetBankAccount,
    updateBankAccount
}
