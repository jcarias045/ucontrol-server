const cashAccount = require('../models/cashaccounts.model')

function creatCashAccounts(req,res){

    const CashAccount = new cashAccount();

    const {Alias,Company,CashRegister } = req.body

    CashAccount.Alias = Alias;
    CashAccount.Company = Company;
    CashAccount.State = true;
    CashAccount.Saldo = 0;
    CashAccount.CashRegister=CashRegister;
    CashAccount.Account="Efectivo"

 

    CashAccount.save((err, CashAccountStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!CashAccountStored){
                res.status(500).send({message: "Error"});
            }else{
                res.status(200).send({CashAccount: CashAccountStored})
            }
        }
    });

}

function getCashAccount(req,res){

    cashAccount.find({CashRegister: req.params.id})
    .populate({path: 'BaCashRegisternk', model: 'CashRegister'})
    .then(CashAccount => {
        if(!CashAccount){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({CashAccount})
        }
    });
}

async function updateCashAccount(req, res){
    let CashAccountData = req.body;
    const params = req.params;
    cashAccount.findByIdAndUpdate({_id: params.id}, CashAccountData, (err, CashAccountUpdate)=>{
        if(err){
            res.status(500).sen({message: "Error del Servidor."});
        } else {
            if(!CashAccountUpdate){
                res.status(404).sen({message: "No hay"});
            }else{
                res.status(200).send({cuenta: CashAccountUpdate})
            }
        }
    })
}

async function desactivateBanksAccounts(req, res) {
    
    let CashAccountId = req.params.id;
    console.log("hla",req.params.id); 
    console.log(req.body);
    const {State} = req.body;  //
    
    try{
        
         cashAccount.findByIdAndUpdate(CashAccountId, {State}, (CashAccountStored) => {
            if (!CashAccountStored) {
                res.status(404).send({ message: "No se ha encontrado la plaza." });
            }
            else {
                console.log("edito",CashAccountStored);
                res.status(200).send({ cuenta:CashAccountStored  });
            }
        })
        
    } catch(error){
        res.status(500).json({
            message: "Error -> No se puede actualizar el usuario con ID = " + req.params.id,
            error: error.message
        });
    }
    
}



function getCashAccountCompany(req,res){

    cashAccount.find({Company: req.params.id})
    .populate({path: 'CashRegister', model: 'CashRegister'})
    .then(CashAccount => {
        if(!CashAccount){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({CashAccount})
        }
    });
}

module.exports = {
    creatCashAccounts,
    getCashAccount,
    updateCashAccount,
    desactivateBanksAccounts,
    getCashAccountCompany
}
