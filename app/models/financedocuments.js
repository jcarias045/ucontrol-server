const moongose = require('mongoose');
const Schema = moongose.Schema
const Company = require('../models/company.model')

const SourceDocumentSchema = Schema({
  SourceDocument: String,
  Name: String, 
  Description: String,
  Company: { type: Schema.ObjectId, 
             ref: "Company",
            // autopopulate: true,
           }
})

module.exports = moongose.model('SourceDocument', SouceDocumentSchema)