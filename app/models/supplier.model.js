const moongose = require('mongoose');
const Company = require('./company.model')

const SupplierSchema = moongose.Schema({
  Name: String,
  Web: String,
  Email: String,
  Phone: String,
  Adress: String,
  DebsToPay: Number,
  PaymentTime: Number,
  Active: Boolean,
  codsupplier: String,
  deliveryDays: Number,
  Company: { type: Schema.ObjectId, 
             ref: "Company",
             // autopopulate: true,
           },    
})

module.exports = moongose.model('Supplier', SupplierSchema)



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
            
//         },
//         deliveryDays:{
//           type: Sequelize.INTEGER,
//         },
//         // ID_SupplierType:{
//         //   type: Sequelize.INTEGER,
//         //   foreign_key:true,
//         // }

// 	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
//         freezeTableName: true,
//         timestamps: false,
// 	  });
	
// 	return Supplier;
// }