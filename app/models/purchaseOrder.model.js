const mongoose = require('mongoose');
const Schema =  mongoose.Schema;
const Supplier = require('./supplier.model');
const User= require('./user.model')

const PurchaseOrderSchema = Schema({
  Supplier: {type: Schema.ObjectId, 
    ref: "Supplier",
    // autopopulate: true,
  },
  InvoiceNumber:String,
  Image:String,
  Total:Number,
  Active:Boolean,
  User: {type: Schema.ObjectId, 
    ref: "User",
    // autopopulate: true,
  },
  DeliverDate:String,
  CreationDate: String,
  State:String,
  Description:String,
  CodPurchase:Number,
})

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema)

// module.exports = (sequelize, Sequelize) => {
// 	const purchaseOrder = sequelize.define('ec_purchaseorder', {	
// 	  ID_PurchaseOrder: {
//             type: Sequelize.INTEGER,
//             autoIncrement: true,
//             primaryKey: true
//     },
//     ID_Supplier:
//     {
//         type: Sequelize.INTEGER,
//         foreign_key: true,
       
//     },
//     InvoiceNumber:
//     {
//         type: Sequelize.STRING,
        
//     },
//     Image:
//     {
//         type: Sequelize.DATE
//     },
//     Total:
//     {
//         type: Sequelize.DECIMAL
//     },
//     Active:
//     {
//         type: Sequelize.STRING
//     },
//     ID_User :
//     {
//       type: Sequelize.INTEGER,
//       foreign_key: true,
//     } ,
//     DeliverDate:{
//       type: Sequelize.DATE
//     },
//     CreationDate:{
//       type: Sequelize.DATE
//     },
//     State:{
//       type: Sequelize.STRING
//     },
//     Description:{
//       type: Sequelize.STRING
//     },
//     codpurchase:{
//       type: Sequelize.INTEGER
//     },
   
// 	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
//         freezeTableName: true,
//         timestamps: false,
// 	  });
	
// 	return purchaseOrder;
//     }