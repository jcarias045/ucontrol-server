const moongose = require('mongoose');
const Schema = moongose.Schema
const User = require('../models/user.model')
const Supplier = require('../models/supplier.model')
  
  const BookingSupplierSchema = Schema({
      Description: String,
      StartDate: Date,
      EndDate: Date,
      //State: Boolean,
      User: { type: Schema.ObjectId, ref: "User"},
      Supplier: { type: Schema.ObjectId, ref: "Supplier"},
      Name: String,
      StartTime: Date,
      EndTime: Date,
    })
    
 module.exports = moongose.model('BookingSupplier', BookingSupplierSchema)
  