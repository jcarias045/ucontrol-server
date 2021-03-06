const mongoose = require('mongoose');
const Schema =  mongoose.Schema;
const SaleOrderInvoice = require('./saleorderinvoice.model');
const Inventory = require('./inventory.model');
const Customer = require('./customer.model');

const Product = require('./product.model');

const SaleInvoiceDetailSchema = Schema({
  SaleOrderInvoice: {type: Schema.ObjectId, 
    ref: "SaleOrderInvoice",
    // autopopulate: true,
  },
  Quantity:Number,
  iniQuantity:Number,
  Discount:Number,
  Price:Number,
  ProductName:String,
  SubTotal:Number,
  PriceDiscount:Number,
  BuyPrice:Number,
  Measure:String,
  CodProduct:String,
  Inventory: {type: Schema.ObjectId, 
    ref: "Inventory",
    // autopopulate: true,
  },
  Entregados:Number,
  State:Boolean,
  Product:{type: Schema.ObjectId, 
    ref: "Product",
    // autopopulate: true,
  },
  GrossSellPrice:Number,
  inAdvanced:Boolean,


 
})

module.exports = mongoose.model('SaleInvoiceDetail', SaleInvoiceDetailSchema)