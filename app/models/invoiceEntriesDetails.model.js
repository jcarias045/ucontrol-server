const mongoose = require('mongoose');
const Schema =  mongoose.Schema;
const Inventory = require('./inventory.model');
const ProductEntry = require('./productEntries.model');
const PurchaseInvoiceDetail= require('./purchaseInvoiceDetails.model');

const EntriesDetailSchema = Schema({
  PurchaseInvoiceDetail: {type: Schema.ObjectId, 
    ref: "PurchaseInvoiceDetail",
    // autopopulate: true,
  },
  ProductEntry: {type: Schema.ObjectId, 
    ref: "ProductEntry",
    // autopopulate: true,
  },
  Quantity:Number,
  ProductName:String,
  Price:Number,
  Measure:String,
  CodProduct:String,
  Inventory: {type: Schema.ObjectId, 
    ref: "Inventory",
    // autopopulate: true,
  },

 
})

EntriesDetailSchema.virtual('members', {
  ref: 'ProductEntry', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'ProductEntry', // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: false,
  options: { sort: { name: -1 }, limit: 5 } // Query options, see http://bit.ly/mongoose-query-options
});


module.exports = mongoose.model('EntryDetail', EntriesDetailSchema)

// module.exports = (sequelize, Sequelize) => {
// 	const invoiceEntries = sequelize.define('ec_invoiceentry', {	
//     ID_InvoiceEntry  : {
//             type: Sequelize.INTEGER,
//             autoIncrement: true,
//             primaryKey: true
//     },
//     ID_PurchaseInvoiceDetail		: {
// 			type: Sequelize.INTEGER
//       },
//       ID_ProductEntry:{
//         type: Sequelize.INTEGER
//       },
//       Quantity		:{
//         type: Sequelize.DECIMAL,
	  	
//       },
//       ID_Inventory:{
//         type: Sequelize.INTEGER

//       }
      
   
// 	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
//         freezeTableName: true,
//         timestamps: false,
// 	  });
	
// 	return invoiceEntries;
// }