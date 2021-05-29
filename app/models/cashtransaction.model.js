const moongose = require('mongoose');
const Schema = moongose.Schema
const User = require('./user.model');
const CashMovement = require('./cashmovement.model');
const Concept = require('./concepts.model');
const CashAccount = require('./cashaccounts.model');

const CashTransactionSchema = Schema({
 
  TransactionDate: String, 
  User: { type: Schema.ObjectId, 
             ref: "User",
            // autopopulate: true,
           },  
   Deposit:Number,
   Withdrawal:Number, //retiro
   Concept:String,

   CashAccount:{ type: Schema.ObjectId, 
    ref: "CashAccount",
   // autopopulate: true,
   },
   CashMovement:{ type: Schema.ObjectId, 
    ref: "CashMovement",
   // autopopulate: true,
   },
   
   
})

module.exports = moongose.model('CashTransaction', CashTransactionSchema)