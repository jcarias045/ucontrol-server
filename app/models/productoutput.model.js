const mongoose = require('mongoose');
const Schema =  mongoose.Schema;
const User = require('./user.model');
const Company = require('./company.model');
const Product = require('./product.model');
const Customer = require('./customer.model');

const ProducOutputSchema = Schema({
  EntryDate:String,
  User: {type: Schema.ObjectId, 
    ref: "User",
    // autopopulate: true,
  },
  Comments:String,
  State:Boolean,
  CodOutput:Number,
  Company: {type: Schema.ObjectId, 
    ref: "Company",
    // autopopulate: true,
  },
  SaleOrderInvoice:String,
  Customer:{type: Schema.ObjectId, 
    ref: "Customer",
    // autopopulate: true,
  },
  InvoiceNumber:String, 
 
 
})


module.exports = mongoose.model('ProducOutput', ProducOutputSchema);