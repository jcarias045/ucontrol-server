const mongoose = require('mongoose');
const Schema =  mongoose.Schema;
const Company = require('./company.model')
const SupplierType = require('./suppliertype.model')

const SupplierSchema = Schema({
  Name: String,
  Web: String,
  Email: String,
  Phone: String,
  Address: String,
  DebsToPay: Number,
  PaymentTime: Number,
  Active: Boolean,
  codsupplier: String,
  deliveryDays: Number,
  Company: { type: Schema.ObjectId, 
             ref: "Company",
             // autopopulate: true,
           },
  SupplierType: { 
    type: Schema.ObjectId, 
    ref: "SupplierType"
  }  ,
  Nit:String,
  Ncr:String,
  Sector:{
    type: Schema.Types.ObjectId,
    ref: "Sector"
  },
  Sector1:{
    type: Schema.Types.ObjectId,
    ref: "Sector"
  },
  Sector2:{
    type: Schema.Types.ObjectId,
    ref: "Sector"
  },
  Contributor:String,
  Exempt:Boolean,
})

module.exports =mongoose.model('Supplier', SupplierSchema)



// module.exports = (sequelize, Sequelize) => {
// 	const Supplier = sequelize.define('crm_supplier', {	
// 	  ID_Supplier: {
//             type: Sequelize.INTEGER,
//             autoIncrement: true,
//             primaryKey: true
//     },
// 	   ID_Company: {
// 			type: Sequelize.INTEGER,
//             foreign_key:true,
//       },
//       Name:{
//         type: Sequelize.STRING
//       },
//       Web:{
//         type: Sequelize.STRING
//       },
//       Email:{
//         type: Sequelize.STRING,
//         unique: true
//       },
//       Phone:{
//         type: Sequelize.STRING
//         },
//         Adress:{
//             type: Sequelize.STRING
//         },
//         DebsToPay:{
//             type: Sequelize.DECIMAL
//         },
//         Active:{
//             type: Sequelize.BOOLEAN
//         },
//         codsupplier:{
//             type: Sequelize.STRING
//         },
//         PaymentTime:{
//             type: Sequelize.INTEGER,
            
//         freezeTableName: true,
//         timestamps: false,
// 	  });
	
// 	return Supplier;
// }