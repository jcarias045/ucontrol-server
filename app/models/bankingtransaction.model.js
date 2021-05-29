const moongose = require('mongoose');
const Schema = moongose.Schema
const User = require('./user.model');
const BankMovement = require('./bankmovement.model');
const Concept = require('./concepts.model');
const BankAccount = require('./bankaccount.model');

const BankingTransactionSchema = Schema({
 
  TransactionDate: String, 
  Type: { type: Schema.ObjectId, 
    ref: "Concept",
   // autopopulate: true,
  }, 
  OperationNumber: Number,
  User: { type: Schema.ObjectId, 
             ref: "User",
            // autopopulate: true,
           },
   BankMovement:
    { type: Schema.ObjectId, 
      ref: "BankMovement",
     // autopopulate: true,
    },
   
   Deposit:Number,
   Withdrawal:Number, //retiro
   Concept:String,
   DocumentNumber:String,
   Account:{ type: Schema.ObjectId, 
    ref: "BankAccount",
   // autopopulate: true,
   },
   
   
})

module.exports = moongose.model('BankingTransaction', BankingTransactionSchema)