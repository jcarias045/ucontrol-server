const { boolean } = require('joi');
const moongose = require('mongoose');
const Schema = moongose.Schema
const Company = require('../models/company.model');
const AccountGrouper = require('../models/accountgrouper.model');

const AccountingAccountSchema = Schema({
    Identifier:Number,
    NumberAccount: String, 
    Name: Number,
    Company: { type: Schema.ObjectId, 
    ref: "Company",
    // autopopulate: true,
    },
    Type: String,
    State:Boolean,  
    ReferenceAccount:{ type: Schema.ObjectId,   //cuenta padre
        ref: "AccountingAccount",
        // autopopulate: true,
    },
})

module.exports = moongose.model('AccountingAccount', AccountingAccountSchema)