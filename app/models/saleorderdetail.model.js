const mongoose = require('mongoose');
const Schema =  mongoose.Schema;
const SaleOrder = require('./saleorder.model');
const Inventory = require('./inventory.model');
const Product = require('./product.model');

const SaleOderDetailSchema = Schema({
  SaleOrder: {type: Schema.ObjectId, 
    ref: "SaleOrder",
    // autopopulate: true,
  },
  Quantity:Number,
  iniQuantity:Number,
  Discount:Number,
  Price:Number,
  ProductName:String,
  SubTotal:Number,
  Measure:String,
  CodProduct:String,
  Product:{type: Schema.ObjectId, 
    ref: "Product",
    // autopopulate: true,
  },
  Inventory: {type: Schema.ObjectId, 
    ref: "Inventory",
    // autopopulate: true,
  },
  GrossSellPrice:Number,
  inAdvanced:Boolean,
 
 


 
})

module.exports = mongoose.model('SaleOrderDetail', SaleOderDetailSchema)

