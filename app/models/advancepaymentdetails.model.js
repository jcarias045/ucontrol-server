const moongose = require('mongoose');
const Schema = moongose.Schema
const CustomerAdvance = require('../models/advancepayment.model');
const PaymentMethods = require('../models/paymentMethods.model');
const SaleOrder = require('../models/saleorder.model');
const User = require('../models/user.model');
const Product = require('../models/product.model');

const CustomerAdvanceDetailSchema = Schema({
    SaleOrder: { type: Schema.ObjectId, 
                       ref: "SaleOrder",
                       // autopopulate: true,
                     },
    NumberAccount: String,
    BankName: String,
    CreationDate: String,
    CustomerAdvance: { type: Schema.ObjectId, ref:"CustomerAdvance"},
    Amount: Number,
    Reason: String,
    NoTransaction: Number,
    PaymentMethods: { type: Schema.ObjectId, ref:"PaymentMethods"},
    Cancelled: Boolean,
    Product: { type: Schema.ObjectId, ref:"Product"},
    Quantity:Number,
})

module.exports = moongose.model('CustomerAdvanceDetail', CustomerAdvanceDetailSchema)