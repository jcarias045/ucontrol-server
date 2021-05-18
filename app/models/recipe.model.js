const moongose = require('mongoose');
const Schema = moongose.Schema
const Product = require('../models/product.model')

const RecipeSchema = Schema({
  Product: { type: Schema.ObjectId, 
             ref: "Product",
            // autopopulate: true,
           },
  RecipeProduct: { type: Schema.ObjectId, 
    ref: "Product",
   // autopopulate: true,
  },
  Quantity:Number,
  Measure: String,
  Codigo:String,
  Name: String
})

module.exports = moongose.model('Recipe', RecipeSchema)