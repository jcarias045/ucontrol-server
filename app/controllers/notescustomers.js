const noteCostumer = require('../models/notecustomer.model')
const fs =require("fs");
const path=require("path");
const moment=require("moment");
const jwt= require('../services/jwt');

function getNotesCustomer(req, res) {
    noteCostumer.find().populate({path: 'User', model: 'User'}).
    populate({path: 'Costumer', model: 'Costumer'})
    .then(noteCostumer => {
        if(!noteCostumer){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({noteCostumer})
        }
    });
}

function createNoteCustomer(req,res){
    /*let note = {};
    let date = moment().format('L');
    let CreationDate = moment().format('LT');*/

    const NoteCostumer = new noteCostumer();

    const {Subject, Text, CreationDate, User, Costumer} = req.body

    NoteCostumer.Subject= Subject
    NoteCostumer.Text= Text;
    NoteCostumer.CreationDate= CreationDate;
    NoteCostumer.User=User;
    NoteCostumer.Costumer=Costumer;
    
    console.log(NoteCostumer);
    NoteCostumer.save((err, NoteCostumerStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!NoteCostumerStored){
                res.status(500).send({message: "Error"});
            }else{
                res.status(200).send({NoteCostumer: NoteCostumerStored})
            }
        }
    });
}

async function updateNote(req, res){
    let noteCostumerData = req.body;
    const params = req.params;

    noteCostumer.findByIdAndUpdate({_id: params.id}, noteCostumerData, (err, noteCostumerUpdate)=>{
        if(err){
            res.status(500).sen({message: "Error del Servidor."});
        } else {
            if(!noteCostumerUpdate){
                res.status(404).sen({message: "No hay"});
            }else{
                res.status(200).send({message: "Nota Actualizada"})
            }
        }
    })
}

async function deleteNote(req, res){
    const { id } = req.params;
  
    noteCostumer.findByIdAndRemove(id, (err, noteCostumerDeleted) => {
      if (err) {
        res.status(500).send({ message: "Error del servidor." });
      } else {
        if (!noteCostumerDeleted) {
          res.status(404).send({ message: "Nota no encontrada." });
        } else {
          res
            .status(200)
            .send({ message: "La Nota ha sido eliminada correctamente." });
        }
      }
    });
}




module.exports={
    getNotesCustomer,
    createNoteCustomer,
    updateNote,
    deleteNote
}