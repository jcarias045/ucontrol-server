const moongose = require('mongoose');
const Schema = moongose.Schema
const User = require('../models/user.model')
const Product = require('../models/product.model')

const NoteProductSchema = Schema({
    Subject: String,
    Text: String,
    CreationDate: String,
    date: String,
    User: {
      type: Schema.ObjectId, 
      ref: "User", 
    },
    Product: { 
      type: Schema.ObjectId, 
      ref: "Product"
    }

  })
  
  module.exports = moongose.model('NoteProduct', NoteProductSchema)