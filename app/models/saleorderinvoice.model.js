const mongoose = require('mongoose');
const Schema =  mongoose.Schema;
const SaleOrder = require('./saleorder.model');
const Customer = require('./customer.model');
const User = require('./user.model');
const PaymentSupplier=require('./paymentstoSuppliers.model');
const Product=require('./product.model');
const DocumentCorrelative= require('./documentcorrelatives.model')
const Company = require('./company.model')

const SaleOrderInvoiceSchema = Schema({
  SaleOrder: {type: Schema.ObjectId, 
    ref: "SaleOrder",
    // autopopulate: true,
  },
  InvoiceDate:Date,
  CreationDate: Date,
  Total:Number,
  CommentsofSale:String,
  DeliverDay:String,
  Customer: {type: Schema.ObjectId, 
    ref: "Customer",
    // autopopulate: true,
  },
  User: {type: Schema.ObjectId, 
    ref: "User",
    // autopopulate: true,
  },
  CodInvoice:Number,
  InvoiceNumber:String,
  Entregada:Boolean,
  Pagada: Boolean,
  State:String,
  InvoiceComments:String,
  DocumentCorrelative:{type: Schema.ObjectId, 
    ref: "DocumentCorrelative",
    // autopopulate: true,
  },
  iva:Number,
  Company: {type: Schema.ObjectId, 
    ref: "Company",
    // autopopulate: true,
  },
 
})



module.exports = mongoose.model('SaleOrderInvoice', SaleOrderInvoiceSchema)