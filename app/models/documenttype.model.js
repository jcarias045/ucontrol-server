const moongose = require('mongoose');
const Schema = moongose.Schema
const Company = require('../models/company.model')

const DocumentTypeSchema = Schema({
  
  Company: { type: Schema.ObjectId, 
             ref: "Company",
            // autopopulate: true,
           },
   Name: String,
   Description: String,
   Referencia:String
})

module.exports = moongose.model('DocumentType', DocumentTypeSchema)