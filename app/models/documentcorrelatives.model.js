const moongose = require('mongoose');
const Schema = moongose.Schema
const Company = require('../models/company.model');
const DocumentType = require('../models/documenttype.model');

const DocumentCorrelativeSchema = Schema({
  SerialNumberRange:String,
  Company: { type: Schema.ObjectId, 
             ref: "Company",
            // autopopulate: true,
           },
   NResolucion: String,
   StartNumber:Number,
   EndNumber:Number,
   CurrentNumber:Number,
   State:Boolean,
   DocumentType:{ type: Schema.ObjectId, 
    ref: "DocumentType",
   // autopopulate: true,
  },
})

module.exports = moongose.model('DocumentCorrelative', DocumentCorrelativeSchema)