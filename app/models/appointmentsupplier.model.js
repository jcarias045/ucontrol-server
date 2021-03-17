const moongose = require('mongoose');
const Schema = moongose.Schema
const User = require('../models/user.model')
const Supplier = require('../models/supplier.model')
  
  const BookingSupplierSchema = Schema({
      Description: String,
      StartDate: Number,
      EndDate: Number,
      State: Boolean,
      User: { type: Schema.ObjectId, ref: "User"},
      Supplier: { type: Schema.ObjectId, ref: "Supplier"}

    })
    
 module.exports = moongose.model('BookingSupplier', BookingSupplierSchema)
  