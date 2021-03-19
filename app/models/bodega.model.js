const moongose = require('mongoose');
const Schema = moongose.Schema
const Company = require('../models/company.model')

const BodegaSchema = Schema({
    Name: String,
    Company: { type: Schema.ObjectId, ref:"Company"},
    State: Boolean
  })
  
  module.exports = moongose.model('Bodega', BodegaSchema)
