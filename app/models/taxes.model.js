
const moongose = require('mongoose');
const Schema = moongose.Schema
const Company = require('../models/company.model');
const { param } = require('../routers/tax');

const TaxesSchema = Schema({
  Name: String,
  document: String, 
  percentage: Number,
  Company: { type: Schema.ObjectId, 
             ref: "Company",
            // autopopulate: true,
           },
  Parameter: String, //campo
  Value:String,
  DocValue:Number,
  State: String,         
})

module.exports = moongose.model('Taxes', TaxesSchema)