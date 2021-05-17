const moongose = require('mongoose');
const Schema = moongose.Schema
const Company = require('../models/company.model');
const User = require('../models/user.model');
const Product = require('../models/product.model');

const ConversionSchema = Schema({

    User: { type: Schema.ObjectId, 
            ref: "User",
            // autopopulate: true,
    },
    CreationDate:Date,
    Receta: { type: Schema.ObjectId, 
        ref: "Product",
        // autopopulate: true,
        },
})

module.exports = moongose.model('Conversion', ConversionSchema)