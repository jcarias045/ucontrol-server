const moongose = require('mongoose');
const Schema = moongose.Schema
const User = require('./User.model')

const BankingTransactionSchema = Schema({
  SourceDocument: String,
  TransactionDate: String, 
  Concept: String, 
  OperationNumber: Number,
  User: { type: Schema.ObjectId, 
             ref: "User",
            // autopopulate: true,
           },
   Reference:Number,
   Deposit:Number,
   Withdrawal:Number, //retiro
   
})

module.exports = moongose.model('BankingTransaction', BankingTransactionSchema)