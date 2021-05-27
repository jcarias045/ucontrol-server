const cashRegister = require('../models/cashregister.model')
const bcrypt=require("bcrypt-nodejs");
const jwt=require('../services/jwt');


function getCashRegisters(req, res) {
    cashRegister.find({Company: req.params.id})
    .then(CashRegister => {
        if(!CashRegister){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({CashRegister})
        }
    });
}

function createCashRegister(req, res){
    
   const CashRegister = new cashRegister()

   const {Name, Company} = req.body

   CashRegister.Name = Name;
   CashRegister.Company = Company;
   CashRegister.State = true;

   console.log(CashRegister);
        CashRegister.save((err, CashRegisterStored)=>{
            if(err){
                res.status(500).send({message: err});
            }else{
                if(!CashRegisterStored){
                    res.status(500).send({message: "Error"});
                }else{
                    res.status(200).send({CashRegister: CashRegisterStored})
                }
            }
        });

    
}

function updateCashRegister(req, res){
    let CashRegisterData = req.body;
    const params = req.params;

    cashRegister.findByIdAndUpdate({_id: params.id}, CashRegisterData, (err, CashRegisterUpdate)=>{
        if(err){
            res.status(500).sen({message: "Error del Servidor."});
        } else {
            if(!CashRegisterUpdate){
                res.status(404).sen({message: "No hay"});
            }else{
                res.status(200).send({caja: CashRegisterUpdate})
            }
        }
    })
}

function deleteCashRegister(req, res){
    const { id } = req.params;
    console.log("anulando caja");
    cashRegister.findByIdAndUpdate({_id: id}, {State:false}, (err, CashRegisterUpdate)=>{
        if(err){
            res.status(500).sen({message: "Error del Servidor."});
        } else {
            if(!CashRegisterUpdate){
                res.status(404).sen({message: "No existe registro"});
            }else{
                res.status(200).send({caja: CashRegisterUpdate})
            }
        }
    })
}

function getCashRegisterId (req, res){
    let company = req.params.id
    cashRegister.find({Company: company}).populate({path: 'Company', model: 'Company'})
    .then(CashRegister => {
        if(!CashRegister){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({CashRegister})
        }
    });
}


module.exports={
    getCashRegisters,
    createCashRegister,
    updateCashRegister,
    deleteCashRegister,
    getCashRegisterId

}
