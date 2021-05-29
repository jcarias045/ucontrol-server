const moongose = require('mongoose');
const Schema = moongose.Schema
const Company = require('./company.model')

const BankMovementSchema = Schema({
  Name: String,
  Description: String, 
  Company: { type: Schema.ObjectId, 
    ref: "Company",
   // autopopulate: true,
  }
})

module.exports = moongose.model('BankMovement', BankMovementSchema)