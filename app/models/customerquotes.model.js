const mongoose = require('mongoose');
const Schema =  mongoose.Schema;
const Customer = require('./customer.model');
const User= require('./user.model')

const CustomerQuoteSchema = Schema({
  Customer: {type: Schema.ObjectId, 
    ref: "Customer",
    // autopopulate: true,
  },

  CodCustomerQuote:Number,
  Total:Number,
  State:String,
  User: {type: Schema.ObjectId, 
    ref: "User",
    // autopopulate: true,
  },
  CreationDate: String,
  Description:String,
  Active:Boolean,
  CustomerName:String,
  DateUpdate:String,
  SubTotal:Number,
})

module.exports = mongoose.model('CustomerQuote', CustomerQuoteSchema)