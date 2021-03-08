const db = require('../config/db.config.js');
const fs =require("fs");
const path=require("path");
const NoteCustomer = db.NoteCustomer;
const User = db.User;
const Customer = db.Customer;
const moment=require("moment");
const jwt= require('../services/jwt');

function getNotesCustomer(req, res) {
    let userId = req.params.id;
    let customerId = req.params.customer;
    try{
        NoteCustomer.findAll({
            include:[
                {
                    model: Customer,
                    attributes: ['ID_Customer', 'Name' , 'User', 'LastName'],
                    where: {ID_Customer: customerId},
                }
            ],
            where: {ID_User: userId
            },
             attributes:['ID_NoteCustomer','Subject','Text','Date','Time']
        })
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

function createNoteCustomer(req,res){
    let note = {};
    let date = moment().format('L');
    let CreationDate = moment().format('LT');

    try{
        // Construimos el modelo del objeto company para enviarlo como body del reques
        note.Subject = req.body.Subject;
        note.Text=req.body.Text;
        note.Date= date;
        note.ID_User=req.body.ID_User;
        note.ID_Customer= req.body.ID_Customer;
        note.Time= CreationDate;
 
        // Save to MySQL database
       NoteCustomer.create(note)
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
    const { Subject, Text, Date, Time} = req.body;  //
    try{
        let date = moment().format('L');
        let CreationDate = moment().format('LT');
        let note = await NoteCustomer.findByPk(noteID,{
            attributes: ['Subject','Text','ID_User','ID_Customer']
        });
        console.log(note);
        if(!note){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra la nota con ID = " + noteID,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = {             
                Subject: Subject,
                Text: Text,
                Date: date,
                Time: CreationDate        
            }
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await NoteCustomer.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_NoteCustomer: noteID}
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
        let note = await NoteCustomer.findByPk(noteID);
       
        if(!note){
            res.status(404).json({
                message: "La Nota con este ID no existe = " + noteID,
                error: "404",
            });
        } else {
            await note.destroy();
            res.status(200).send({
                message:"Nota eliminada con exito"
            });
        }
    } catch(errr) {
        res.status(500).json({
            mesage: "Error -> No se puede eliminar el cliente con el ID = " + req.params.id,
            error: error.message
        });
    }
}




module.exports={
    getNotesCustomer,
    createNoteCustomer,
    updateNote,
    deleteNote
}