const moongose = require('mongoose');
const Schema = moongose.Schema
const PurchaseInvoice = require('../models/purchaseInvoice.model')
const User = require('../models/user.model')

const PaymentSupplierSchema = Schema({
    PurchaseInvoice: { type: Schema.ObjectId, 
                       ref: "PurchaseInvoice",
                       // autopopulate: true,
                     },
    DatePayment: String,
    Saldo: Number,
    codpayment: Number,
    User: { type: Schema.ObjectId, ref:"User"}
})

module.exports = moongose.model('PaymentSupplier', PaymentSupplierSchema)