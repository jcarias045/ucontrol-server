const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//creando esquema para la tabla de conceptos
const ConceptSchema = Schema({
    entryorexit: String,
    conceptDescription: String,
    Company: {
        type: Schema.ObjectId,
        ref: "Company"
    }
})

//exportando el esquema
module.exports = mongoose.model('ConcepEntryExit', ConceptSchema)