const moongose = require('mongoose');
const Schema = moongose.Schema
const User = require('../models/user.model')
const Costumer = require('../models/customer.model')

const NoteCostumerSchema = Schema({
    Subject: String,
    Text: String,
    CreationDate: Date,
    User: {type: Schema.ObjectId, ref: "User", },
    Costumer: { type: Schema.ObjectId, ref: "Costumer"}

  })
  
  module.exports = moongose.model('NoteCostumer', NoteCostumerSchema)