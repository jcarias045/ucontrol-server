const { custom } = require('joi');
const db = require('../config/db.config.js');
const bcrypt=require("bcrypt-nodejs");
const jwt=require('../services/jwt');
const Notes = db.Notes;


function createNotes(req, res){
    let notes = {};

    try{
        // Construimos el modelo del objeto notes para enviarlo como body del request
        notes.Subject = req.body.Subject;
        notes.Text=req.body.Text;
        notes.CretionDate= req.body.CreationDate;
        notes.UserName=req.body.UserName;
    }catch(error){
        res.status(500).json({
            message: "Fail!",
            error: error.message
        });
    }
}

function getNotesInfo(req, res){
    console.log("gola");
    Notes.findByPk(req.params.id)
        .then(notes=> {
          res.status(200).json(notes
          )
        }).catch(error => {
        // imprimimos a consola
          console.log(error);

          res.status(500).json({
              message: "Error!",
              error: error
          });
        })
}

function notes(req, res){
    // Buscamos informacion para llenar el modelo de notes
    try{
        Notes.findAll()
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

 async function updateNotes(req, res){
   
    let notesID = req.params.id;
  
    
    const { Subject, Text, CreationDate, UserName} = req.body;  //
   
    try{
        let notes = await Notes.findByPk(notesID);
        console.log(notes);
        if(!notes){
           // retornamos el resultado al nota
            res.status(404).json({
                message: "No se encuentra el nota con ID = " + notesID,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = {             
                Subject: Subject,
                Text: Text,
                CreationDate: CreationDate,
                UserName: UserName
            }
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await Notes.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_Notes: notesID},
                                attributes: [ 'Subject','CreationDate']
                              }
                            );

            // retornamos el resultado al nota
            if(!result) {
                res.status(500).json({
                    message: "Error -> No se puede actualizar el nota con ID = " + req.params.id,
                    error: "No se puede actualizar",
                });
            }

            res.status(200).json(result);
        }
    } catch(error){
        res.status(500).json({
            message: "Error -> No se puede actualizar el nota con ID = " + req.params.id,
            error: error.message
        });
    }
}


async function deleteNotes(req, res){
    try{
        let notesID = req.params.id;
        let notes = await Notes.findByPk(notesID);

        if(!notes){
            res.status(404).json({
                message: "El nota con este ID no existe = " + notesID,
                error: "404",
            });
        } else {
            await notes.destroy();
            res.status(200).send({
                message:"nota eliminado con exito"
            });
        }
    } catch(error) {
        res.status(500).json({
            message: "Error -> No se puede eliminar el nota con el ID = " + req.params.id,
            error: error.message
        });
    }
}


module.exports={
    createNotes,
    getNotesInfo,
    notes,
    updateNotes,
    deleteNotes

};