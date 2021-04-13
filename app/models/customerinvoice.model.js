const mongoose = require('mongoose');
const Schema =  mongoose.Schema;
const PurchaseOrder = require('./purchaseOrder.model');
const Customer = require('./customer.model');
const User = require('./user.model');
const PaymentSupplier=require('./paymentstoSuppliers.model')

const CustomerInvoiceSchema = Schema({
  CreationDate: String,
  Customer: {type: Schema.ObjectId, 
    ref: "Customer",
    // autopopulate: true,
  },
  Pagada:Boolean
 

 
})



module.exports = mongoose.model('CustomerInvoice', CustomerInvoiceSchema)
