const moongose = require('mongoose');
const Schema = moongose.Schema
const Company = require('../models/company.model')

const TaxesSchema = Schema({
  Name: String,
  document: String, 
  percentage: Schema.Types.Decimal128,
  Company: { type: Schema.ObjectId, 
             ref: "Company",
            // autopopulate: true,
           }
})

module.exports = moongose.model('Taxes', TaxesSchema)