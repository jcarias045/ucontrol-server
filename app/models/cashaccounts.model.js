const moongose = require('mongoose');
const Schema = moongose.Schema
const CashRegister = require('./cashregister.model');
const Company = require('./company.model');

const CashAccountsSchema = Schema({
    CashRegister:{
        type: Schema.ObjectId,
        ref: "CashRegister"
    },
    Alias: String,
    Company:{
        type: Schema.ObjectId,
        ref: "Company"
    },
    Saldo:Number,
    State: Boolean,
    Account:String
   
    
})

module.exports = moongose.model('CashAccounts',CashAccountsSchema )