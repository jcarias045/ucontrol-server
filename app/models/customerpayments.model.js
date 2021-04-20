const moongose = require('mongoose');
const Schema = moongose.Schema
const SaleOrderInvoice = require('../models/saleorderinvoice.model');
const User = require('../models/user.model');
const Customer = require('../models/customer.model')

const CustomerPaymentSchema = Schema({
   SaleOrderInvoice: { type: Schema.ObjectId, 
    ref: "SaleOrderInvoice",
    // autopopulate: true,
    },
    DatePayment: String,
    Saldo: Number,
    codpayment: Number,
    User: { type: Schema.ObjectId, ref:"User"},
    Customer: { type: Schema.ObjectId, ref:"Customer"}
})

module.exports = moongose.model('CustomerPayment', CustomerPaymentSchema)