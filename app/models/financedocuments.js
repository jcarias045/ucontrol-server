const moongose = require('mongoose');
const Schema = moongose.Schema
const Company = require('./company.model')

const FinanceDocumentSchema = Schema({
  Name: String, 
  Description: String,
  Company: { type: Schema.ObjectId, 
             ref: "Company",
            // autopopulate: true,
           }
})

module.exports = moongose.model('FinanceDocument', SouceDocumentSchema)