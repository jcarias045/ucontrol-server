const noteProduct = require('../models/noteproduct.model')
const fs =require("fs");
const path=require("path");
const moment=require("moment");
const jwt= require('../services/jwt');

function getNotesProduct(req, res) {
    noteProduct.find({User: req.params.id, Product: req.params.product})
    .populate({path: 'User', model: 'User'})
    .populate({path: 'Product', model: 'Product'})
    .then(noteProduct => {
        if(!noteProduct){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({noteProduct})
        }
    });
}

function createNoteProduct(req,res){
    const NoteProduct = new noteProduct();
    let date = moment().format('L');
    let CreationDate = moment().format('LT');
    console.log(date);
    console.log(CreationDate);
    const {Subject, Text, User, Product} = req.body

    NoteProduct.Subject= Subject
    NoteProduct.Text= Text;
    NoteProduct.CreationDate= CreationDate;
    NoteProduct.date = date;
    NoteProduct.User=User;
    NoteProduct.Product=Product;
    
    console.log(NoteProduct);
    NoteProduct.save((err, NoteProductStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!NoteProductStored){
                res.status(500).send({message: "Error"});
            }else{
                res.status(200).send({NoteProduct: NoteProductStored})
            }
        }
    });
}

async function updateNote(req, res){
    let noteProductData = req.body;
    noteProductData.date = moment().format('L');
    noteProductData.CreationDate = moment().format('LT')
    const params = req.params;

    noteProduct.findByIdAndUpdate({_id: params.id}, noteProductData, (err, noteProductUpdate)=>{
        if(err){
            res.status(500).send({message: "Error del Servidor."});
        } else {
            if(!noteProductUpdate){
                res.status(404).send({message: "No hay"});
            }else{
                res.status(200).send({message: "Nota Actualizada"})
            }
        }
    })
}

async function deleteNote(req, res){
    const { id } = req.params;
  
    noteProduct.findByIdAndRemove(id, (err, noteProductDeleted) => {
      if (err) {
        res.status(500).send({ message: "Error del servidor." });
      } else {
        if (!noteProductDeleted) {
          res.status(404).send({ message: "Nota no encontrada." });
        } else {
          res
            .status(200)
            .send({ message: "La Nota ha sido eliminada correctamente." });
        }
      }
    });
}

module.exports = {
    createNoteProduct,
    getNotesProduct,
    updateNote,
    deleteNote
}