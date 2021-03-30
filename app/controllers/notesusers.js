const noteUser = require('../models/noteuser.model')
const fs =require("fs");
const path=require("path");
const moment=require("moment");
const jwt= require('../services/jwt');


function getNotes(req, res){
    noteUser.find().populate({path: 'User', model: 'User'}).
    populate({path: 'Costumer', model: 'Costumer'})
    .then(noteUser => {
        if(!noteUser){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({noteUser})
        }
    });
}

function createNote(req, res){
    const NoteUser = new noteUser();

    const {Subject, Text, CreationDate, User} = req.body

    NoteUser.Subject= Subject
    NoteUser.Text= Text;
    NoteUser.CreationDate= CreationDate;
    NoteUser.User=User;
    
    console.log(NoteUser);
    NoteUser.save((err, NoteUserStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!NoteUserStored){
                res.status(500).send({message: "Error"});
            }else{
                res.status(200).send({NoteUser: NoteUserStored})
            }
        }
    });
}

async function updateNote(req, res){
    let noteUserData = req.body;
    const params = req.params;

    noteUser.findByIdAndUpdate({_id: params.id}, noteUserData, (err, noteUserUpdate)=>{
        if(err){
            res.status(500).sen({message: "Error del Servidor."});
        } else {
            if(!noteUserUpdate){
                res.status(404).sen({message: "No hay"});
            }else{
                res.status(200).send({message: "Nota Actualizada"})
            }
        }
    })
}

async function deleteNote(req, res){
    const { id } = req.params;
  
    noteUser.findByIdAndRemove(id, (err, noteUserDeleted) => {
      if (err) {
        res.status(500).send({ message: "Error del servidor." });
      } else {
        if (!noteUserDeleted) {
          res.status(404).send({ message: "Nota no encontrada." });
        } else {
          res
            .status(200)
            .send({ message: "La Nota ha sido eliminada correctamente." });
        }
      }
    });
}

function getNotesID(req, res){
    // Buscamos informacion para llenar el modelo de 
    try{
        NoteUser.findAll({attributes:['ID_NoteUser', 'Subject']})
        .then(notes => {
            res.status(200).send({notes});
          
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
    getNotes,
    createNote,
    updateNote,
    deleteNote,
    getNotesID
};