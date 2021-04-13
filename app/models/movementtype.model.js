const moongose = require('mongoose');
const Schema = moongose.Schema
const Company = require('../models/company.model')

const MovementTypeSchema = Schema({
  Name: String,
  Description: String, 
  
 
})

module.exports = moongose.model('MovementType', MovementTypeSchema)