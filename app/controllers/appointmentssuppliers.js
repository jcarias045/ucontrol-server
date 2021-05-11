const bookingSupplier  = require('../models/appointmentsupplier.model')
const fs =require("fs");
const path=require("path");
const moment=require("moment");
const jwt= require('../services/jwt');

function getBookingSupplier(req,res){
    bookingSupplier.find().populate({ path: 'User', model: 'User'}).
    populate({ path: 'Supplier', model: 'Supplier'})
    .then(bookingSupplier => {
        if(!bookingSupplier){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({bookingSupplier})
        }
    });
}

function createBookingSupplier(req,res){
    const BookingSupplier = new bookingSupplier()
    
    console.log("bookin proveedor", req.body);
    const {StartDate, EndDate, Description, State,
        User, Customer,  Name, StartTime, EndTime } = req.body
    
       BookingSupplier.StartDate = StartDate;
       BookingSupplier.EndDate = EndDate;
       BookingSupplier.Description = Description;
       BookingSupplier.State = State;
       BookingSupplier.User = User;
       BookingSupplier.Customer = Customer;
       BookingSupplier.Name = Name;
       BookingSupplier.StartTime = StartTime;
       BookingSupplier.EndTime = EndTime;

   console.log(BookingSupplier);
   BookingSupplier.save((err, BookingSupplierStored)=>{
       if(err){
           res.status(500).send({message: err});
       }else{
           if(!BookingSupplierStored){
               res.status(500).send({message: "Error"});
           }else{
               res.status(200).send({BookingSupplier: BookingSupplierStored})
           }
       }
   });
}

function updateBookingSupplier(req,res){
    let bookingSupplierData = req.body;
    const params = req.params;

   bookingSupplier.findByIdAndUpdate({_id: params.id}, bookingSupplierData, (err,bookingSupplierUpdate)=>{
        if(err){
            res.status(500).sen({message: "Error del Servidor."});
        } else {
            if(!bookingSupplierUpdate){
                res.status(404).sen({message: "No hay"});
            }else{
                res.status(200).send({message: "bookingSupplier Actualizado"})
            }
        }
    })
}

function deleteBookingSupplier(req,res){
    const { id } = req.params;
  
    bookingSupplier.findByIdAndRemove(id, (err, bodegaDeleted) => {
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

function getBookingAllSupplier(req,res){
    bookingSupplier.find({User: req.params.id}).populate({ path: 'User', model: 'User'}).
    populate({ path: 'Supplier', model: 'Supplier'})
    .then(bookingSupplier => {
        if(!bookingSupplier){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({bookingSupplier})
        }
    });
} 

module.exports={
    getBookingSupplier,
    createBookingSupplier,
    updateBookingSupplier,
    deleteBookingSupplier,
    getBookingAllSupplier
    
}