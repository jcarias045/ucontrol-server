const db = require('../config/db.config.js');
const fs =require("fs");
const path=require("path");
const BookingCustomer = db.BookingCustomer;
const User = db.User;
const Customer = db.Customer;
const moment=require("moment");
const jwt= require('../services/jwt');


function getBookingCustomers(req,res){
    let userId = req.params.id;
    let customerId = req.params.customerid;
    try{
    BookingCustomer.findAll({
        include:[
            {
                model: Customer,
                attributes: ['ID_Customer', 'Name' , 'User', 'LastName'],
                where: {ID_Customer: customerId},
            }
        ],
        where: {ID_User: userId
        },
         attributes:['ID_AppointmentCustomer','StartDate','EndDate', 'Description',
        'State', 'ID_User', 'ID_Customer','Name','StartTime','EndTime']
    })
    .then(booking => {
        res.status(200).send({booking});          
    })
}catch(error) {
    console.log(error);
    res.status(500).json({
        message: "Error en query!",
        error: error
        });
    }
}

function createBookingCustomer(req,res){
    let bookingCustomer = {};

    try{
        // Construimos el modelo del objeto company para enviarlo como body del reques
        bookingCustomer.StartDate = req.body.StartDate;
        bookingCustomer.EndDate = req.body.EndDate;
        bookingCustomer.Description = req.body.Description;
        bookingCustomer.State = req.body.State;
        bookingCustomer.ID_User = req.body.ID_User;
        bookingCustomer.ID_Customer = req.body.ID_Customer;
        bookingCustomer.StartTime = req.body.StartTime;
        bookingCustomer.EndTime = req.body.EndTime;
        bookingCustomer.Name = req.body.Name;
 
        // Save to MySQL database
        BookingCustomer.create(bookingCustomer)
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

async function updateBookingCustomer(req,res){
    let bookingId = req.params.id; 
    console.log(bookingId); 
    const {StartDate, EndDate, Description,StartTime,
            EndTime, Name } = req.body;  //
    try{
        let booking = await BookingCustomer.findByPk(bookingId,{
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
            let result = await BookingCustomer.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_AppointmentCustomer: bookingId}
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

async function deleteBookingCustomer(req,res){
    console.log(req.params.id);
    try{
        let bookingeId = req.params.id;
        let booking = await BookingCustomer.findByPk(bookingeId);
       
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

async function desactiveBooking(req,res){
    let bookingId = req.params.id; 
  
    const {State} = req.body;  //
    try{
        let booking = await BookingCustomer.findByPk(bookingId);
        
        if(!booking){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el cliente con ID = " + bookingId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = {      
                State: State          
            }
               //agregar proceso de encriptacion
            let result = await booking.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_AppointmentCustomer: bookingId},
                                attributes:['State' ]
                              }
                            );

            // retornamos el resultado al cliente
            if(!result) {
                res.status(500).json({
                    message: "Error -> No se puede actualizar el usuario con ID = " + req.params.id,
                    error: "No se puede actualizar",
                });
            }

            res.status(200).json(result);
        }
    } catch(error){
        res.status(500).json({
            message: "Error -> No se puede actualizar el usuario con ID = " + req.params.id,
            error: error.message
        });
    }
}

module.exports={
    getBookingCustomers,
    createBookingCustomer,
    updateBookingCustomer,
    deleteBookingCustomer,
    desactiveBooking
}