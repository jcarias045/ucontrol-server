const mongoose = require('mongoose');
const Supplier = require('./supplier.model');
const User= require('./user.model');
const Schema =  mongoose.Schema;

const AppointmenSupplierSchema = Schema({
  StartDate: String,
  EndDate: String, 
  Description: String,
  //State: Boolean,
  User: {
    type: Schema.ObjectId,
    ref: "User"
  },
  Supplier: { 
    type: Schema.ObjectId, 
    ref: "Supplier",
  },
  Name: String,
  StartTime: String,
  EndTime: String,
  Color:String
})

module.exports = mongoose.model('BookingSupplier', AppointmenSupplierSchema)