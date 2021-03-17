const moongose = require('mongoose');
const Schema = moongose.Schema
const PaymentSupplier = require('../models/paymentstoSuppliers.model')
const PaymentMethods = require('../models/paymentMethods.model')
const User = require('../models/user.model')

const PaymentSupplierSchema = Schema({
    PurchaseInvoice: { type: Schema.ObjectId, 
                       ref: "PurchaseInvoice",
                       // autopopulate: true,
                     },
    NumberAccount: String,
    BankName: String,
    CreationDate: Date,
    PaymentSupplier: { type: Schema.ObjectId, ref:"PaymentSupplier"},
    Amount: Schema.Types.Decimal128,
    Reason: String,
    NoTransaction: Number,
    PaymentMethods: { type: Schema.ObjectId, ref:"PaymentMethods"},
    Cancelled: Boolean
})

module.exports = moongose.model('PaymentSupplier', PaymentSupplierSchema)