//tomando mongoose
const mongoose = require('mongoose');
//Schema
const Schema = mongoose.Schema;

const MacroFormula = Schema({
    MacroId: {
        type: Schema.ObjectId,
        ref: "Macro"
    },
    AccountingAccountId: {
        type: Schema.ObjectId,
        ref: "AccountingAccount"
    },
    ParamType: String,
    Order: Number,
    Value: Number
})

module.exports = mongoose.model("MacroFormula", MacroFormula)