const moongose = require('mongoose');
const Schema = moongose.Schema

const BodegaSchema = Schema({
    Name: String,
    IdCompany: Number,
    State: Boolean
  })
  
  module.exports = moongose.model('Bodega', BodegaSchema)
