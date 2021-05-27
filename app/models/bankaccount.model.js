const moongose = require('mongoose');
const Schema = moongose.Schema
const Bank = require('./bank.model');
const Company = require('./company.model');

const BankAccountSchema = Schema({
    Bank:{
        type: Schema.ObjectId,
        ref: "Bank"
    },
    NumberAccount: String,
    Company:{
        type: Schema.ObjectId,
        ref: "Company"
    },
    Active: Boolean,
    Saldo:Number,
    
})

module.exports = moongose.model('BankAccount',BankAccountSchema )

