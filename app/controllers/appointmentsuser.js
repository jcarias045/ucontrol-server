const BookingUser = require('../models/appointmentuser.modal');
const fs =require("fs");
const path=require("path");
const moment = require("moment-timezone");
const jwt= require('../services/jwt');

function getBookingUser(req,res){
    BookingUser.find().populate({ path: 'User', model: 'User'}).
    populate({ path:'BookingCustomer', model: 'BookingCustomer' })
    .then(bookingUser => {
        if(!bookingUser){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({bookingUser})
        }
    });
}

function getBookingCustomerInfo(req, res) {
    BookingUser.find().populate({ path: 'User', model: 'User'}).
    populate({ path:'BookingCustomer', model: 'BookingCustomer' })
    .then(bookingUser => {
        if(!bookingUser){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({bookingUser})
        }
    })
}

function createBookingUser(req,res){

    const bookingUser = new BookingUser()

   const {StartDate, EndDate, Description, State,
    User,  Name, StartTime, EndTime } = req.body

    bookingUser.StartDate = StartDate;
    bookingUser.EndDate = EndDate;
    bookingUser.Description = Description;
    bookingUser.State = State;
    bookingUser.User = User;
    bookingUser.Name = Name;
    bookingUser.StartTime = StartTime;
    bookingUser.EndTime = EndTime;

   console.log(bookingUser);
   bookingUser.save((err, BookingUserStored)=>{
       if(err){
           res.status(500).send({message: err});
       }else{
           if(!BookingUserStored){
               res.status(500).send({message: "Error"});
           }else{
               res.status(200).send({BookingUser: BookingUserStored})
           }
       }
   });
}

function updateBookingUser(req,res){
    let bookingUserData = req.body;
    const params = req.params;

   BookingUser.findByIdAndUpdate({_id: params.id}, bookingUserData, (err,bookingUserUpdate)=>{
        if(err){
            res.status(500).send({message: "Error del Servidor."});
        } else {
            if(!bookingUserUpdate){
                res.status(404).send({message: "No hay"});
            }else{
                res.status(200).send({message: "bookingSupplier Actualizado"})
            }
        }
    })
}

function deleteBookingUser(req,res){
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
    getBookingUser,
    createBookingUser,
    updateBookingUser,
    deleteBookingUser,
    getBookingCustomerInfo   
}