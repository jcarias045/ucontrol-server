const mongoose = require('mongoose');
const Schema =  mongoose.Schema;
const PurchaseOrder = require('./purchaseOrder.model');
const Inventory = require('./inventory.model');

const PurchaseOrderDetailSchema = Schema({
  PurchaseOrder: {type: Schema.ObjectId, 
    ref: "PurchaseOrder",
    // autopopulate: true,
  },
  Quantity:Number,
  Discount:Number,
  Price:Number,
  ProductName:String,
  SubTotal:Number,
  Measure:String,
  CodProduct:String,
  Inventory: {type: Schema.ObjectId, 
    ref: "Inventory",
    // autopopulate: true,
  },
  SupplierName:String,
})

module.exports = mongoose.model('PurchaseOrderDetail', PurchaseOrderDetailSchema)

// module.exports = (sequelize, Sequelize) => {
// 	const OrderDetails = sequelize.define('ec_purchasedetail', {	
//         ID_PurchaseDetail : {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         primaryKey: true
//     },
//     ID_PurchaseOrder: {
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

 
//     ID_Inventory:{
//         type: Sequelize.INTEGER,
//         foreign_key:true,
//     }
      
   
// 	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
//         freezeTableName: true,
//         timestamps: false,
// 	  });
	
// 	return OrderDetails;
// }