const mongoose = require('mongoose');
const Schema =  mongoose.Schema;
const PurchaseInvoice = require('./purchaseInvoice.model');
const Inventory = require('./inventory.model');


const PurchaseInvoiceDetailSchema = Schema({
  PurchaseInvoice: {type: Schema.ObjectId, 
    ref: "PurchaseInvoice",
    // autopopulate: true,
  },
  Quantity:Number,
  Discount:Number,
  Price:Number,
  ProductName:String,
  SubTotal:Number,
  Measure:String,
  CodProduct:String,
  SupplierName:String,
  Inventory: {type: Schema.ObjectId, 
    ref: "Inventory",
    // autopopulate: true,
  },
  Ingresados:Number,
  State:Boolean

 
})

module.exports = mongoose.model('PurchaseInvoiceDetail', PurchaseInvoiceDetailSchema)
// module.exports = (sequelize, Sequelize) => {
// 	const purchaseInvoiceD = sequelize.define('ec_purchaseinvoicedetails', {	
//         ID_PurchaseInvoiceDetail  : {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         primaryKey: true
//     },
//     ID_PurchaseInvoice : {
//         type: Sequelize.INTEGER,
//         foreign_key:true,
//       },
//     Quantity:{
//         type: Sequelize.DECIMAL
//         },
//     Discount:{
//         type: Sequelize.STRING
//         },
//     Price:{
//         type: Sequelize.DECIMAL
//         },
//     ProductName:{
//         type: Sequelize.STRING
//         },
//     SubTotal:{
//     type: Sequelize.DECIMAL
//     },
 
//     ID_Inventory:{
//         type: Sequelize.INTEGER,
//         foreign_key:true,
//     },
//     Ingresados:{
//         type: Sequelize.DECIMAL
//     },
//     State:{
//         type: Sequelize.BOOLEAN,
//     }
      
   
// 	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
//         freezeTableName: true,
//         timestamps: false,
// 	  });
	
// 	return purchaseInvoiceD;
// }