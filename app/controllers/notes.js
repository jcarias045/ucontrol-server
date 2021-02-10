const db = require('../config/db.config.js');
const fs =require("fs");
const path=require("path");
const Note = db.Note;


function getNotes(req, res){
    // Buscamos informacion para llenar el modelo de 
    try{
        Note.findAll()
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

function createNote(req, res){
    let note = {};
    let CreationDate = now.getTime();

    try{
        // Construimos el modelo del objeto company para enviarlo como body del request
        note.ID_Note = req.body.ID_Note;
        note.Subject = req.body.Subject;
        note.Text=req.body.Text;
        note.CreationDate= CreationDate;
        note.UserName=req.body.UserName;
 
        // Save to MySQL database
       Note.create(note)
      .then(result => {    
        res.status(200).json(result);
    
      });  
    }catch(error){
        res.status(500).json({
            message: "Fail!",
            error: error.message
        });
    }
}

async function updateNote(req, res){
   
    let noteID = req.params.id; 
    console.log(noteID); 
    const { Subject, Text, CreationDate, UserName} = req.body;  //
    try{
        let note = await Note.findByPk(noteID);
        console.log(note);
        if(!note){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el cliente con ID = " + noteID,
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
            let result = await note.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_Note: noteID}
                              }
                            );

            // retornamos el resultado al cliente
            if(!result) {
                res.status(500).json({
                    message: "Error -> No se puede actualizar el cliente con ID = " + req.params.id,
                    error: "No se puede actualizar",
                });
            }

            res.status(200).json(result);
        }
    } catch(error){
        res.status(500).json({
            message: "Error -> No se puede actualizar el cliente con ID = " + req.params.id,
            error: error.message
        });
    }
}

async function deleteNote(req, res){
    console.log(req.params.id);
    try{
        let noteID = req.params.id;
        let note = await Note.findByPk(noteID);
       
        if(!note){
            res.status(404).json({
                message: "La compañia con este ID no existe = " + noteID,
                error: "404",
            });
        } else {
            await note.destroy();
            res.status(200).send({
                message:"Compañia eliminada con exito"
            });
        }
    } catch(errr) {
        res.status(500).json({
            mesage: "Error -> No se puede eliminar el cliente con el ID = " + req.params.id,
            error: error.message
        });
    }
}

function getNotesID(req, res){
    // Buscamos informacion para llenar el modelo de 
    try{
        Note.findAll({attributes:['ID_Note', 'Subject']})
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