const moongose = require('mongoose');
const Schema = moongose.Schema
const SaleOrder = require('../models/saleorder.model');
const User = require('../models/user.model');
const Customer = require('../models/customer.model')

const CustomerAdvanceSchema = Schema({
   SaleOrder: { type: Schema.ObjectId, 
    ref: "SaleOrder",
    // autopopulate: true,
    },
    DatePayment: String,
    Saldo: Number,
    Codigo: Number,
    User: { type: Schema.ObjectId, ref:"User"},
    Customer: { type: Schema.ObjectId, ref:"Customer"}
})

module.exports = moongose.model('CustomerAdvance', CustomerAdvanceSchema)