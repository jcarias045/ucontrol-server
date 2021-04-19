const mongoose = require('mongoose');
const User= require('./user.model');
const Supplier = require('./supplier.model')
const Customer = require('./customer.model')
const BookingCustomer = require('./appointmentcustomer.modal')
const Schema =  mongoose.Schema;

const AppointmenUserSchema = Schema({
  StartDate: String,
  EndDate: String, 
  Description: String,
  //State: Boolean,
  User: {
    type: Schema.ObjectId,
    ref: "User"
  },
  Customer: {
    type: Schema.ObjectId,
    ref: "Customer"
  },
  Supplier: {
    type: Schema.ObjectId,
    ref: "Supplier"
  },
  BookingCustomer: {
    type: Schema.ObjectId,
    ref: "BookingCustomer"
  },
  Name: String,
  StartTime: String,
  EndTime: String,
})

module.exports = mongoose.model('BookingUser', AppointmenUserSchema)