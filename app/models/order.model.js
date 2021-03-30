const moongose = require('mongoose');
const Schema = moongose.Schema
const User = require('./company.model');
const Costumer = require('./customer.model');

const OrderSchema = Schema({
    User:  { type: Schema.ObjectId, 
             ref: "User",
             // autopopulate: true,
           },
    CreationDate: Date, 
    Total: Schema.Types.Decimal128,
    Active: Boolean,
    Costumer: { type: Schema.ObjectId, 
               ref: "Costumer",
              // autopopulate: true,
             },
    State: Boolean
  })
  
  module.exports = moongose.model('Order', OrderSchema)