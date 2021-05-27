const moongose = require('mongoose');
const Schema = moongose.Schema
const SaleOrder = require('../models/saleorder.model');
const Product = require('../models/product.model');
const Inventory = require('../models/inventory.model');
const CustomerAdvanceDetail = require('../models/advancepaymentdetails.model')

const CustomerAdvanceProductSchema = Schema({
   CustomerAdvanceDetail: { type: Schema.ObjectId, 
    ref: "CustomerAdvanceDetail",
    // autopopulate: true,
    },
    Product:  { type: Schema.ObjectId, 
        ref: "Product",
        // autopopulate: true,
        },
    Quantity: Number,
    Price: Number,
    ProductName:String,
    Measure:String,
    CodProduct:String,
    Inventory: {type: Schema.ObjectId, 
        ref: "Inventory",
        // autopopulate: true,
    },
    State:Boolean,
})

module.exports = moongose.model('CustomerAdvanceProduct',CustomerAdvanceProductSchema)