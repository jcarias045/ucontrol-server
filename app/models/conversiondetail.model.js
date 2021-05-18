const moongose = require('mongoose');
const Schema = moongose.Schema
const Product = require('../models/product.model')
const Conversion = require('../models/conversion.model')

const ConversionDetailSchema = Schema({
  Name: String,
  Codigo: String, 
  Measure: String,
  Product: { type: Schema.ObjectId, 
             ref: "Product",
            // autopopulate: true,
           },
 Utilizar: Number, 
 Quantity: Number,
 Conversion: { type: Schema.ObjectId, 
    ref: "Conversion",
   // autopopulate: true,
  },
 

})

module.exports = moongose.model('ConversionDetail', ConversionDetailSchema)