const Bank = require('../models/bank.model')
const bcrypt=require("bcrypt-nodejs");
const jwt=require('../services/jwt');


function getBanks(req, res) {
    Bank.find().populate({path: 'Company', model: 'Company'})
    .then(bank => {
        if(!bank){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({bank})
        }
    });
}

function createBank(req, res){
    
   const bank = new Bank()

   const {Name, Phone, Address, Company} = req.body

   bank.Name = Name;
   bank.Phone = Phone,
   bank.Address = Address;
   bank.Company = Company;

   console.log(bank);
        bank.save((err, bankStored)=>{
            if(err){
                res.status(500).send({message: err});
            }else{
                if(!bankStored){
                    res.status(500).send({message: "Error"});
                }else{
                    res.status(200).send({bank: bankStored})
                }
            }
        });

    
}


function updateBank(req, res){
    let BankData = req.body;
    const params = req.params;

    Bank.findByIdAndUpdate({_id: params.id}, BankData, (err, BankUpdate)=>{
        if(err){
            res.status(500).sen({message: "Error del Servidor."});
        } else {
            if(!BankUpdate){
                res.status(404).sen({message: "No hay"});
            }else{
                res.status(200).send({message: "Banca Actualizado"})
            }
        }
    })
}

function deleteBank(req, res){
    const { id } = req.params;
  
    Bank.findByIdAndRemove(id, (err, BankDeleted) => {
      if (err) {
        res.status(500).send({ message: "Error del servidor." });
      } else {
        if (!BankDeleted) {
          res.status(404).send({ message: "Banca no encontrado." });
        } else {
          res
            .status(200)
            .send({ message: "La Banca ha sido eliminada correctamente." });
        }
      }
    });
}

function getBankId (req, res){
    let company = req.params.id
    Bank.find({Company: company}).populate({path: 'Company', model: 'Company'})
    .then(bank => {
        if(!bank){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({bank})
        }
    });
}


module.exports={
    getBanks,
    createBank,
    updateBank,
    deleteBank,
    getBankId

}
