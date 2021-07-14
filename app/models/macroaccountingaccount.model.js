//tomando mongoose
const mongoose = require('mongoose');
//Schema
const Schema = mongoose.Schema;

const MacroAccountingAccount = Schema({
    MacroId: {
        type: Schema.ObjectId,
        ref: "Macro"
    },
    AccountingAccountId: {
        type: Schema.ObjectId,
        ref: "AccountingAccount"
    },
    AffectationType: Number,
    FormulaId: {
        type: Schema.ObjectId,
        ref: ""
    }
})

module.exports = mongoose.model("MacroAccountingAccounts", MacroAccountingAccount)