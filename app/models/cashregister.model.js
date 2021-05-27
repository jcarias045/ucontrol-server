const moongose = require('mongoose');
const Schema = moongose.Schema
const Company = require('./company.model');
const Bank = require('./bank.model');

const CashRegisterSchema = Schema({
    Name:String,
    Company: { type: Schema.ObjectId, 
             ref: "Company",
            // autopopulate: true,
           },
    State: Boolean,
})

module.exports = moongose.model('CashRegister', CashRegisterSchema)