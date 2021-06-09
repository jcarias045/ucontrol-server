const mongoose = require("mongoose");
const Schema = mongoose.Schema

const CompanySchema = Schema({
  Name: String,
  Logo: String,
  Web: String,
  ShortName: String,
  Address:String,
  Active: Boolean,
  AccessToCustomers: Boolean,
  AccessToSuppliers: Boolean,
  RequieredIncome: Boolean,
  RequieredOutput: Boolean,
  CompanyRecords: Boolean,
  WorksOpenQuote: Boolean,
  DaysQuotationValidity: Number,
  DaysOrderValidity: Number,
  AvailableReservation:Boolean,
  OrderWithWallet:Boolean,
  AverageCost:Boolean,
  InvoiceLines: Number,
  Nit:String,
  Ncr:String,
  Imprenta:String,
  ActividadPrimaria:{
    type: Schema.Types.ObjectId,
    ref: "Sector"
  },
  ActividadSecundaria:{
    type: Schema.Types.ObjectId,
    ref: "Sector",
  },
  ActividadTerciaria:{
    type: Schema.Types.ObjectId,
    ref: "Sector",
  },
  },
  // { 
  //       freezeTableName: true,
  //       timestamps: false,
  // 	  }
      )

module.exports = mongoose.model('Company', CompanySchema)



// module.exports = (sequelize, Sequelize) => {
// 	const Company = sequelize.define('sys_company', {	
// 	  // ID_Company: {
//     //         type: Sequelize.INTEGER,
//     //         autoIncrement: true,
//     //         primaryKey: true
//     // },
// 	  Name: {
// 			type: Sequelize.STRING,
//       unique: true
//       },
//       Logo:{
//         type: Sequelize.STRING
//       },
//       Web:{
//         type: Sequelize.STRING
//       },
//       ShortName:{
//         type: Sequelize.STRING
//       },
//       Active:{
//           type: Sequelize.BOOLEAN
//       },
//       AccessToCustomers:{
//         type: Sequelize.BOOLEAN
//       },
//       AccessToSuppliers:{
//         type: Sequelize.BOOLEAN
//       },
//       RequiredIncome:{
//         type: Sequelize.BOOLEAN
//       },
//       RequiredOutput:{
//         type: Sequelize.BOOLEAN
//       },
//       CompanyRecords:{
//         type: Sequelize.BOOLEAN
//       },
//       AverageCost:{
//         type: Sequelize.BOOLEAN
//       }   
// 	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
//         freezeTableName: true,
//         timestamps: false,
// 	  });
	
// 	return Company;
// }