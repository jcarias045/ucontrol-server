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
  Quantity:Decimal128,
  Inventory: {type: Schema.ObjectId, 
    ref: "Inventory",
    // autopopulate: true,
  },

 
})

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