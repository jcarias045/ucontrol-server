const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user.model');
const Company = require('./company.model');
const Product = require('./product.model');
const Supplier = require('./supplier.model');
const ProductEntrySchema = Schema({
  EntryDate: String,
  User: {
    type: Schema.ObjectId,
    ref: "User",
    // autopopulate: true,
  },
  Comments: String,
  State: Boolean,
  CodEntry: Number,
  Company: {
    type: Schema.ObjectId,
    ref: "Company",
    // autopopulate: true,
  },
  PurchaseInvoice: String,
  Supplier: String,
  SupplierId: {
    type: Schema.ObjectId,
    ref: "Supplier",
    // autopopulate: true,
  },
  InvoiceNumber: String,
  ConceptEntryExit: {
    type: Schema.ObjectId,
    ref: "ConcepEntryExit"
  }
})


module.exports = mongoose.model('ProductEntry', ProductEntrySchema);
// module.exports = (sequelize, Sequelize) => {
// 	const productEntry = sequelize.define('ec_productentry', {	
//     ID_ProductEntry : {
//             type: Sequelize.INTEGER,
//             autoIncrement: true,
//             primaryKey: true
//     },
//     EntryDate	: {
// 			type: Sequelize.DATE
//       },
//       ID_User:{
//         type: Sequelize.INTEGER
//       },
//       Comments	:{
//         type: Sequelize.STRING,

//       },
//       State:{
//         type: Sequelize.BOOLEAN

//       },
//       codentry:{
//         type: Sequelize.INTEGER,
//       },
//       ID_Company:{
//         type: Sequelize.INTEGER
//       }


// 	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
//         freezeTableName: true,
//         timestamps: false,
// 	  });

// 	return productEntry;
// }