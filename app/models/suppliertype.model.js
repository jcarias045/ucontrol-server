const moongose = require('mongoose');
const Schema = moongose.Schema
const Company = require('./company.model');

const SupplierTypeSchema = Schema({
  Name: String,
  Description: String,
  Company: { 
    type: Schema.ObjectId, 
    ref: "Company"
  } 
})

module.exports = moongose.model('SupplierType', SupplierTypeSchema)


