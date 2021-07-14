//tomando mongoose
const mongoose = require('mongoose');
//Schema
const Schema = mongoose.Schema;

const MacroParamsSchema = Schema({
    MacroId: {
        type: Schema.ObjectId,
        ref: "Macro"
    },
    NameParam: String
})

module.exports = mongoose.model('MacroParams', MacroParamsSchema)