const moongose = require('mongoose');
const Schema = moongose.Schema
const Company = require('../models/company.model');
const DocumentType = require('../models/documenttype.model');
const BankAccount = require('../models/bankaccount.model');

const CheckbookSchema = Schema({
    SerialNumberRange:String,
    BankAccount: {type: Schema.ObjectId, 
    ref: "BankAccount",
   // autopopulate: true,}
  },
  Name:String,
   StartNumber:Number,
   EndNumber:Number,
   CurrentNumber:Number,
   State:Boolean,
   DocumentType:{ type: Schema.ObjectId, 
    ref: "DocumentType",
   // autopopulate: true,
  },
})

module.exports = moongose.model('Checkbook', CheckbookSchema)