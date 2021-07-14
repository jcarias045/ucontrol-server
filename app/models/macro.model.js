//tomando mongoose
const mongoose = require('mongoose');
//Schema
const Schema = mongoose.Schema;

//esquema de modelo macro
const MacroSchema = Schema({
    Company: {
        type: Schema.ObjectId,
        ref: "Company"
    },
    NameMacro: String,
    State: Boolean
})

module.exports = mongoose.model('Macro', MacroSchema)