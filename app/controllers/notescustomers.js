const noteCostumer = require('../models/notecustomer.model')
const fs =require("fs");
const path=require("path");
const moment=require("moment");
const jwt= require('../services/jwt');
const notecustomerModel = require('../models/notecustomer.model');

function getNotesCustomer(req, res) {
    console.log(req.params.id);
    console.log(req.params.customer);
    noteCostumer.find({User: req.params.id, Customer: req.params.customer}).populate({path: 'User', model: 'User'}).
    populate({path: 'Customer', model: 'Customer'})
    .then(noteCostumer => {
        if(!noteCostumer){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({noteCostumer})
        }
    });
}

function createNoteCustomer(req,res){
    // /*let note = {};
    let date = moment().format('L');
    let CreationDate = moment().format('LT');
    console.log(date);
    console.log(CreationDate);
    const NoteCostumer = new noteCostumer();

    const {Subject, Text,  User, Customer} = req.body

    NoteCostumer.Subject= Subject
    NoteCostumer.Text= Text;
    NoteCostumer.CreationDate = CreationDate;
    NoteCostumer.date = date;
    NoteCostumer.User= User;
    NoteCostumer.Customer= Customer;
    
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
    console.log(req.body);
    let noteCostumerData = req.body;
    const params = req.params;
    noteCostumerData.date = moment().format('L');
    noteCostumerData.CreationDate = moment().format('LT');
    
    noteCostumer.findByIdAndUpdate({_id: params.id}, noteCostumerData, (err, noteCostumerUpdate)=>{
        if(err){
            res.status(500).send({message: "Error del Servidor."});
        } else {
            if(!noteCostumerUpdate){
                res.status(404).send({message: "No hay"});
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