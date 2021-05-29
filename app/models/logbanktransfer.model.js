const moongose = require('mongoose');
const Schema = moongose.Schema
const User = require('./user.model');
const Bank = require('./bank.model');
const Concept = require('./concepts.model');
const BankAccount = require('./bankaccount.model');
const BankingTransaction = require('./bankingtransaction.model');

const BankTransfersLogSchema = Schema({
 
   TransactionDate: String, 
 
   OperationNumber: Number,
   User: { type: Schema.ObjectId, 
             ref: "User",
            // autopopulate: true,
           },
   Deposit:Number,
   Withdrawal:Number, //retiro
   Concept:String,
   DocumentNumber:String,
   AccountOrigin:{ type: Schema.ObjectId, 
    ref: "BankAccount",
   // autopopulate: true,
   },
   AccountDestination:{ type: Schema.ObjectId, 
    ref: "BankAccount",
   // autopopulate: true,
   },
   BankOrigin:{ type: Schema.ObjectId,
     ref: "Bank"},
   BankDestination:{ type: Schema.ObjectId,
      ref: "Bank"},
    Document:{ type: Schema.ObjectId,
    ref: "BankingTransaction"}
   
})

module.exports = moongose.model('BankTransfersLog', BankTransfersLogSchema)
