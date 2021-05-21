const mongoose = require('mongoose');
const Schema =  mongoose.Schema;
const Customer = require('./customer.model');
const User= require('./user.model');
const CustomerQuote= require('./customerquotes.model');

const SaleOrderSchema = Schema({
  Customer: {type: Schema.ObjectId, 
    ref: "Customer",
    // autopopulate: true,
  },
  CodSaleOrder:Number,
  CodCustomerQuote:Number,
  Total:Number,
  State:String,
  User: {type: Schema.ObjectId, 
    ref: "User",
    // autopopulate: true,
  },
  CreationDate: String,
  Comments:String,
  Active:Boolean,
  CustomerName:String,
  CommentsofQuote:String,
  CustomerQuote: {type: Schema.ObjectId, 
    ref: "CustomerQuote",
    // autopopulate: true,
  },
  AdvancePayment:Boolean
})

module.exports = mongoose.model('SaleOrder', SaleOrderSchema)