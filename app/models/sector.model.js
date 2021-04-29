const moongose = require('mongoose');
const Schema = moongose.Schema
const Company = require('../models/company.model')

const SectorSchema = Schema({
  Name: String,
  Categoria: String,
  CodMin: String,
  SubCategoria: String
})

module.exports = moongose.model('Sector', SectorSchema)