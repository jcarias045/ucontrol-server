const mongoose = require('mongoose');
const Schema =  mongoose.Schema;
const Bodega = require('./bodega.model');
const Company = require('./company.model');
const Inventory = require('./inventory.model');
const Product = require('./product.model');
const MovementType = require('./movementtype.model');

const InventoryTraceabilitySchema = Schema({
  Quantity:Number, 
  WarehouseDestination : {type: Schema.ObjectId, 
    ref: "Bodega",
    // autopopulate: true,
  },
  WarehouseOrigin: {type: Schema.ObjectId, 
    ref: "Inventory",
    // autopopulate: true,
  },
 MovDate:String,
 MovementType:{type: Schema.ObjectId, 
  ref: "MovementType",
  // autopopulate: true,
},
 Product:{type: Schema.ObjectId, 
  ref: "Product",
  // autopopulate: true,
},
User:{
  type: Schema.ObjectId, 
  ref: "User",
  // autopopulate: true,
},
Company: { type: Schema.ObjectId, 
  ref: "Company",},
    
  DocumentId:String,
  ProductDestiny:{type: Schema.ObjectId, 
    ref: "Product",
    // autopopulate: true,
  },
  Cost:Number
})

module.exports = mongoose.model('InventoryTraceability', InventoryTraceabilitySchema)