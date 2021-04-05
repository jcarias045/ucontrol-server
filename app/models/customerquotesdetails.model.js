const mongoose = require('mongoose');
const Schema =  mongoose.Schema;
const CustomerQuote = require('./customerquotes.model');
const Inventory = require('./inventory.model');

const QuoteDetailsSchema = Schema({
  CustomerQuote: {type: Schema.ObjectId, 
    ref: "PurchaseOrder",
    // autopopulate: true,
  },
  Quantity:Number,
  Discount:Number,
  Price:Number,
  ProductName:String,
  SubTotal:Number,
  Measure:String,
  CodProduct:String,
  Inventory: {type: Schema.ObjectId, 
    ref: "Inventory",
    // autopopulate: true,
  },
  CustomerName:String,

 
})

module.exports = mongoose.model('QuoteDetails', QuoteDetailsSchema)

