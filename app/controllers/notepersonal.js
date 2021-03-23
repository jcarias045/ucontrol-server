const notePersonal = require('../models/notepersonal')
const fs =require("fs");
const path=require("path");
const moment=require("moment");
const jwt= require('../services/jwt');

function getNotesPersonal(req, res) {
    notePersonal.find({User: req.params.id, Personal: req.params.personal}).populate({path: 'User', model: 'User'}).
    populate({path: 'Personal', model:'Personal'})
    .then(notePersonal => {
        if(!notePersonal){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({notePersonal})
        }
    });
}

function createNotePersonal(req,res){
    //let note = {};
    let Date = moment().format('L');
    let creationDate = moment().format('LT');

    const NotePersonal = new notePersonal();

    const {Subject, Text, CreationDate, date, User, Personal} = req.body

    NotePersonal.Subject= Subject
    NotePersonal.Text= Text;
    NotePersonal.CreationDate=creationDate ;
    NotePersonal.date = Date;
    NotePersonal.User=User;
    NotePersonal.Personal=Personal;
    
    console.log(NotePersonal);
    NotePersonal.save((err, NotePersonalStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!NotePersonalStored){
                res.status(500).send({message: "Error"});
            }else{
                res.status(200).send({NotePersonal: NotePersonalStored})
            }
        }
    });
}

async function updateNotePersonal(req, res){
    let notePersonalData = req.body;
    const params = req.params;
    notePersonalData.date = moment().format('L');
    notePersonalData.CreationDate = moment().format('LT');

    notePersonal.findByIdAndUpdate({_id: params.id}, notePersonalData, (err, notePersonalUpdate)=>{
        if(err){
            res.status(500).sen({message: "Error del Servidor."});
        } else {
            if(!notePersonalUpdate){
                res.status(404).sen({message: "No hay"});
            }else{
                res.status(200).send({message: "Nota Actualizada"})
            }
        }
    })
}


async function deleteNotePersonal(req, res){
    const { id } = req.params;
  
    notePersonal.findByIdAndRemove(id, (err, notePersonalDeleted) => {
      if (err) {
        res.status(500).send({ message: "Error del servidor." });
      } else {
        if (!notePersonalDeleted) {
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
    getNotesPersonal,
    createNotePersonal,
    updateNotePersonal,
    deleteNotePersonal
}



