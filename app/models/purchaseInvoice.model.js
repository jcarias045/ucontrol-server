const mongoose = require('mongoose');
const Schema =  mongoose.Schema;
const PurchaseOrder = require('./purchaseOrder.model');
const Supplier = require('./supplier.model');
const User = require('./user.model');
const PaymentSupplier=require('./paymentstoSuppliers.model');
const Product=require('./product.model');

const PurchaseInvoiceSchema = Schema({
  PurchaseOrder: {type: Schema.ObjectId, 
    ref: "PurchaseOrder",
    // autopopulate: true,
  },
  InvoiceDate:String,
  CreationDate: String,
  Total:Number,
  Comments:String,
  DeliverDay:String,
  Supplier: {type: Schema.ObjectId, 
    ref: "Supplier",
    // autopopulate: true,
  },
  User: {type: Schema.ObjectId, 
    ref: "User",
    // autopopulate: true,
  },
  PurchaseOrder:String,
  CodInvoice:Number,
  InvoiceNumber:String,
  Recibida:Boolean,
  Pagada: Boolean,
  State:String,
  InvoiceComments:String,
})



module.exports = mongoose.model('PurchaseInvoice', PurchaseInvoiceSchema)
// module.exports = (sequelize, Sequelize) => {
// 	const purchaseInvoice= sequelize.define('ec_purchaseinvoice', {	
//     ID_PurchaseInvoice : {
//             type: Sequelize.INTEGER,
//             autoIncrement: true,
//             primaryKey: true
//     },
//     ID_PurchaseOrder :
//     {
//         type: Sequelize.INTEGER,
//         foreign_key: true,
       
//     },
//     InvoiceDate:
//     {
//         type: Sequelize.DATE,
        
//     },
//     CreationDate:{
//         type: Sequelize.DATE
//       },
//     Total:
//       {
//           type: Sequelize.DECIMAL
//       },
//     Comments:
//     {
//         type: Sequelize.STRING
//     },
//     DeliverDay:{
//         type: Sequelize.DATE
//     },
    
//     ID_Supplier :
//     {
//       type: Sequelize.INTEGER,
//       foreign_key: true,
      
//     } ,
    
//     ID_User :
//     {
//       type: Sequelize.INTEGER,
      
//     } ,
//     PurchaseNumber:{ //numero del PO que es invoice nmber en la orden de compra
//       type: Sequelize.INTEGER
//     },
    
//     codInvoice:{ //numero del PO que es invoice nmber en la orden de compra
//       type: Sequelize.INTEGER
//     },
//     InvoiceNumber:{ //numero del PO que es invoice nmber en la orden de compra
//       type: Sequelize.STRING
//     },
//     Recibida:{
//       type: Sequelize.BOOLEAN
//     },
//     Pagada:{
//       type: Sequelize.BOOLEAN
//     },
//     State:{
//       type: Sequelize.STRING
//     },
//     InvoiceComments:{
//       type: Sequelize.STRING
    
//     }
// 	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
//         freezeTableName: true,
//         timestamps: false,
// 	  });
	
// 	return purchaseInvoice;
//     }