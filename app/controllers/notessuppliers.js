const noteSupplier = require('../models/notesupplier.model')
const fs =require("fs");
const path=require("path");
const moment=require("moment");
const jwt= require('../services/jwt');

function getNotesSupplier(req, res) {
    noteSupplier.find({User: req.params.id, Supplier: req.params.supplier}).populate({path: 'User', model: 'User'}).
    populate({path: 'Supplier', model: 'Supplier'})
    .then(noteSupplier => {
        if(!noteSupplier){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({noteSupplier})
        }
    })
}

function createNoteSupplier(req,res){
    let date = moment().format('L');
    let CreationDate = moment().format('LT');
    console.log(date);
    console.log(CreationDate);
    const NoteSupplier = new noteSupplier();

    const {Subject, Text, User, Supplier} = req.body

    NoteSupplier.Subject= Subject
    NoteSupplier.Text= Text;
    NoteSupplier.CreationDate= CreationDate;
    NoteSupplier.date= date;
    NoteSupplier.User=User;
    NoteSupplier.Supplier=Supplier;
    
    console.log(NoteSupplier);
    NoteSupplier.save((err, NoteSupplierStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!NoteSupplierStored){
                res.status(500).send({message: "Error"});
            }else{
                res.status(200).send({NoteSupplier: NoteSupplierStored})
            }
        }
    });
}

async function updateNote(req, res){
    let noteSupplierData = req.body;
    const params = req.params;
    noteSupplierData.date = moment().format('L');
    noteSupplierData.CreationDate= moment().format('LT');

    noteSupplier.findByIdAndUpdate({_id: params.id}, noteSupplierData, (err, noteSupplierUpdate)=>{
        if(err){
            res.status(500).send({message: "Error del Servidor."});
        } else {
            if(!noteSupplierUpdate){
                res.status(404).send({message: "No hay"});
            }else{
                res.status(200).send({message: "Nota Actualizada"})
            }
        }
    })
}

async function deleteNote(req, res){
    const { id } = req.params;
  
    noteSupplier.findByIdAndRemove(id, (err, noteSupplierDeleted) => {
      if (err) {
        res.status(500).send({ message: "Error del servidor." });
      } else {
        if (!noteSupplierDeleted) {
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
    createNoteSupplier,
    getNotesSupplier,
    updateNote,
    deleteNote,
}