const moongose = require('mongoose');
const Schema = moongose.Schema
const Product = require('./product.model')
const User = require('./user.model')

const DocumentProductSchema = Schema({
    title: String,
    description: String,
    Url: String,
    Product: { type: Schema.ObjectId, 
               ref: "Product",
              // autopopulate: true,
             },
    User: { type: Schema.ObjectId,
            ref: "User"
          }
  })
  
  module.exports = moongose.model('DocumentProduct', DocumentProductSchema)