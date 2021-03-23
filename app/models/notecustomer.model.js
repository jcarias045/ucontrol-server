const moongose = require('mongoose');
const Schema = moongose.Schema
const User = require('../models/user.model')
const Customer = require('../models/customer.model')

const NoteCostumerSchema = Schema({
    Subject: String,
    Text: String,
    CreationDate: String,
    date: String,
    User: {type: Schema.ObjectId, ref: "User", },
    Customer: { type: Schema.ObjectId, ref: "Customer"}

  })
  
  module.exports = moongose.model('NoteCostumer', NoteCostumerSchema)