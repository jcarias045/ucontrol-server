const mongoose = require('mongoose');
const Schema =  mongoose.Schema;
const Inventory = require('./inventory.model');
const ProductOutput = require('./productoutput.model');
const SaleInvoiceDetail= require('./saleorderinvoicedetails.model');
const Product = require('./product.model');

const ProductOutputDetailSchema = Schema({
  SaleInvoiceDetail: {type: Schema.ObjectId, 
    ref: "PurchaseInvoiceDetail",
    // autopopulate: true,
  },
  ProductOutput: {type: Schema.ObjectId, 
    ref: "ProductOutput",
    // autopopulate: true,
  },
  Quantity:Number,
  ProductName:String,
  Price:Number,
  Measure:String,
  CodProduct:String,
  Inventory: {type: Schema.ObjectId, 
    ref: "Inventory",
    // autopopulate: true,
  },
  Product:{type: Schema.ObjectId, 
    ref: "Product",
    // autopopulate: true,
  },


 
})



module.exports = mongoose.model('ProductOutputDetail', ProductOutputDetailSchema)