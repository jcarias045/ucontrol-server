const moongose = require('mongoose');
const Schema = moongose.Schema
const PaymentSupplier = require('../models/paymentstoSuppliers.model')
const PaymentMethods = require('../models/paymentMethods.model')
const User = require('../models/user.model')

const PaymentSupplierDetailSchema = Schema({
    PurchaseInvoice: { type: Schema.ObjectId, 
                       ref: "PurchaseInvoice",
                       // autopopulate: true,
                     },
    NumberAccount: String,
    BankName: String,
    CreationDate: String,
    PaymentSupplier: { type: Schema.ObjectId, ref:"PaymentSupplier"},
    Amount: Number,
    Reason: String,
    NoTransaction: Number,
    PaymentMethods: { type: Schema.ObjectId, ref:"PaymentMethods"},
    Cancelled: Boolean
})

module.exports = moongose.model('PaymentSupplierDetail', PaymentSupplierDetailSchema)