const db = require('../config/db.config.js');
const fs =require("fs");
const path=require("path");
const NoteProduct = db.NoteProduct;
const User = db.User;
const Product = db.Product;
const moment=require("moment");
const jwt= require('../services/jwt');

function getNotesProduct(req, res) {
    let userId = req.params.id;
    let productId = req.params.product;
    try{
        NoteProduct.findAll({
            include:[
                {
                    model: Product,
                    attributes: ['ID_Products', 'Name' , 'Brand', 'ShortName'],
                    where: {ID_Products: productId},
                }
            ],
            where: {ID_User: userId,
            },
            attributes:['ID_NoteProduct','Subject','Text']
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

function createNoteProduct(req,res){
    let note = {};
    let CreationDate = moment().unix();

    try{
        // Construimos el modelo del objeto company para enviarlo como body del reques
        note.Subject = req.body.Subject;
        note.Text=req.body.Text;
        note.CreationDate= CreationDate;
        note.ID_User=req.body.ID_User;
        note.ID_Products= req.body.ID_Products;
 
        // Save to MySQL database
       NoteProduct.create(note)
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
    const { Subject, Text} = req.body;  //
    try{
        let note = await NoteProduct.findByPk(noteID,{
            attributes: ['Subject','Text','ID_User']
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
                Text: Text       
            }
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await NoteProduct.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_NoteProduct: noteID}
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
        let note = await NoteProduct.findByPk(noteID);
       
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

module.exports = {
    createNoteProduct,
    getNotesProduct,
    updateNote,
    deleteNote
}