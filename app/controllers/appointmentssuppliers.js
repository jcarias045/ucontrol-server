const db = require('../config/db.config.js');
const fs =require("fs");
const path=require("path");
const BookingSupplier = db.BookingSupplier;
const User = db.User;
const Supplier = db.Supplier;
const moment=require("moment");
const jwt= require('../services/jwt');

function getBookingSupplier(req,res){
    let userId = req.params.id;
    let supplierId = req.params.supplierid;
    try{
    BookingSupplier.findAll({
        include:[
            {
                model: Supplier,
                attributes: ['ID_Supplier', 'Name' , 'codsupplier', 'Email','Phone'],
                where: {ID_Supplier: supplierId},
            }
        ],
        where: {ID_User: userId
        },
         attributes:['ID_AppointmentSupplier','StartDate','EndDate', 'Description',
        'State', 'ID_User', 'ID_Supplier','Name','StartTime','EndTime']
    })
    .then(bookingSupplierList => {
        res.status(200).send({bookingSupplierList});          
    })
}catch(error) {
    console.log(error);
    res.status(500).json({
        message: "Error en query!",
        error: error
        });
    }
}

function createBookingSupplier(req,res){
    let bookingSupplier = {};

    try{
        // Construimos el modelo del objeto company para enviarlo como body del reques
        bookingSupplier.StartDate = req.body.StartDate;
        bookingSupplier.EndDate = req.body.EndDate;
        bookingSupplier.Description = req.body.Description;
        bookingSupplier.State = req.body.State;
        bookingSupplier.ID_User = req.body.ID_User;
        bookingSupplier.ID_Supplier = req.body.ID_Supplier;
        bookingSupplier.StartTime = req.body.StartTime;
        bookingSupplier.EndTime = req.body.EndTime;
        bookingSupplier.Name = req.body.Name;
 
        // Save to MySQL database
        BookingSupplier.create(bookingSupplier)
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

async function updateBookingSupplier(req,res){
    let bookingId = req.params.id; 
    console.log(bookingId); 
    const {StartDate, EndDate, Description,StartTime,
            EndTime, Name } = req.body;  //
    try{
        let booking = await BookingSupplier.findByPk(bookingId,{
            attributes: ['StartDate', 'EndDate', 'Description', 'StartTime',
                'EndTime', 'Name']
        });
        console.log(booking);
        if(!booking){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra la nota con ID = " + bookingId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = {             
                StartDate: StartDate,
                EndDate: EndDate,
                Description: Description,
                StartTime: StartTime,
                EndTime: EndTime,
                Name: Name        
            }
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await BookingSupplier.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_AppointmentSupplier: bookingId}
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

async function deleteBookingSupplier(req,res){
    console.log(req.params.id);
    try{
        let bookingeId = req.params.id;
        let booking = await BookingSupplier.findByPk(bookingeId);
       
        if(!booking){
            res.status(404).json({
                message: "La Nota con este ID no existe = " + bookingeId,
                error: "404",
            });
        } else {
            await booking.destroy();
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
    getBookingSupplier,
    createBookingSupplier,
    updateBookingSupplier,
    deleteBookingSupplier
    
}