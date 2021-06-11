const { boolean } = require('joi');
const moongose = require('mongoose');
const Schema = moongose.Schema
const Company = require('../models/company.model');
const { param } = require('../routers/tax');

const AccountGrouperSchema = Schema({
  Codigo: String,
  Name: String, 
  Company: { type: Schema.ObjectId, 
             ref: "Company",
            // autopopulate: true,
           },
  Description: String  
})

module.exports = moongose.model('AccountGrouper', AccountGrouperSchema)