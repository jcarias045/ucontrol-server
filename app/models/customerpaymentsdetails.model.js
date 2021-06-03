const moongose = require('mongoose');
const Schema = moongose.Schema
const CustomerPayment = require('../models/customerpayments.model');
const PaymentMethods = require('../models/paymentMethods.model');
const SaleOrderInvoice = require('../models/saleorderinvoice.model');
const User = require('../models/user.model');
const Company = require('../models/company.model');
const BankAccount = require('../models/bankaccount.model')
const CashAccount = require('../models/cashaccounts.model')

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
    Cancelled: Boolean,
    Company: {
      type: Schema.ObjectId,
      ref: "Company"
    },
    BankAccount: { type: Schema.ObjectId, ref:"BankAccount"},
    CashAccount: { type: Schema.ObjectId, ref:"CashAccounts"},
    Type:String
})

module.exports = moongose.model('CustomerPaymentDetail', CustomerPaymentDetailSchema)