const moongose = require('mongoose');
const Schema = moongose.Schema
const CustomerPayment = require('../models/customerpayments.model');
const PaymentMethods = require('../models/paymentMethods.model');
const SaleOrderInvoice = require('../models/saleorderinvoice.model');
const User = require('../models/user.model');

const CustomerPaymentDetailSchema = Schema({
    SaleOrderInvoice: { type: Schema.ObjectId, 
                       ref: "SaleOrderInvoice",
                       // autopopulate: true,
                     },
    NumberAccount: String,
    BankName: String,
    CreationDate: String,
    CustomerPayment: { type: Schema.ObjectId, ref:"CustomerPayment"},
    Amount: Number,
    Reason: String,
    NoTransaction: Number,
    PaymentMethods: { type: Schema.ObjectId, ref:"PaymentMethods"},
    Cancelled: Boolean
})

module.exports = moongose.model('CustomerPaymentDetail', CustomerPaymentDetailSchema)