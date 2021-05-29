const moongose = require('mongoose');
const Schema = moongose.Schema
const Company = require('./company.model')
const BankMovement = require('./bankmovement.model')
const CashMovement = require('./cashmovement.model')

const ConceptSchema = Schema({
  Name: String,
  BankMovement: { type: Schema.ObjectId, 
    ref: "BankMovement",
   // autopopulate: true,
  },
  Company: { type: Schema.ObjectId, 
    ref: "Company",
   //, autopopulate: true,
  },
  CashMovement: { type: Schema.ObjectId, 
    ref: "BankMovement",
   // autopopulate: true,
  },
})

module.exports = moongose.model('Concept', ConceptSchema)