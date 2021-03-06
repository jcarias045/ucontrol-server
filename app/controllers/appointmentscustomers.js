const BookingCustomer = require('../models/appointmentcustomer.modal');
const fs =require("fs");
const path=require("path");
const moment = require("moment-timezone");
const jwt= require('../services/jwt');

function getBookingCustomer(req,res){
    BookingCustomer.find({User: req.params.id, Customer: req.params.customerid}).populate({ path: 'User', model: 'User'}).
    populate({ path: 'Customer', model: 'Customer'})
    .then(bookingCustomer => {
        if(!bookingCustomer){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({bookingCustomer})
        }
    });
}

function getBookingAllCustomer(req,res){
    BookingCustomer.find({User: req.params.id}).populate({ path: 'User', model: 'User'}).
    populate({ path: 'Customer', model: 'Customer'})
    .then(bookingCustomer => {
        if(!bookingCustomer){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({bookingCustomer})
        }
    });
} 

function getBookingId (req, res){
    let user = req.params.id
    BookingCustomer.find({User: user}).populate({path: 'User', model: 'User'})
    .then(bookingCustomer => {
        if(!bookingCustomer){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({bookingCustomer})
        }
    });
}


function createBookingCustomer(req,res){

    const bookingCustomer = new BookingCustomer()

   const {StartDate, EndDate, Description, State,
    User, Customer,  Name, StartTime, EndTime } = req.body

    bookingCustomer.StartDate = StartDate;
    bookingCustomer.EndDate = EndDate;
    bookingCustomer.Description = Description;
    bookingCustomer.State = State;
    bookingCustomer.User = User;
    bookingCustomer.Customer = Customer;
    bookingCustomer.Name = Name;
    bookingCustomer.StartTime = StartTime;
    bookingCustomer.EndTime = EndTime;
    bookingCustomer.Color = "#70CAC9";

   console.log(bookingCustomer);
   bookingCustomer.save((err, BookingCustomerStored)=>{
       if(err){
           res.status(500).send({message: err});
       }else{
           if(!BookingCustomerStored){
               res.status(500).send({message: "Error"});
           }else{
               res.status(200).send({BookingCustomer: BookingCustomerStored})
           }
       }
   });
}

function updateBookingCustomer(req,res){
    let bookingCustomerData = req.body;
    const params = req.params;

   BookingCustomer.findByIdAndUpdate({_id: params.id}, bookingCustomerData, (err,bookingCustomerUpdate)=>{
        if(err){
            res.status(500).send({message: "Error del Servidor."});
        } else {
            if(!bookingCustomerUpdate){
                res.status(404).send({message: "No hay"});
            }else{
                res.status(200).send({message: "bookingSupplier Actualizado"})
            }
        }
    })
}

function deleteBookingCustomer(req,res){
    const { id } = req.params;
  
    bodega.findByIdAndRemove(id, (err, bodegaDeleted) => {
      if (err) {
        res.status(500).send({ message: "Error del servidor." });
      } else {
        if (!bodegaDeleted) {
          res.status(404).send({ message: "Appointment no encontrado." });
        } else {
          res
            .status(200)
            .send({ message: "El Appointmet  ha sido eliminado correctamente." });
        }
      }
    });
}


module.exports={
    getBookingCustomer,
    createBookingCustomer,
    updateBookingCustomer,
    deleteBookingCustomer,
    getBookingAllCustomer,    
    getBookingId    
}