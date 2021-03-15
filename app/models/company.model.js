const moongose = require('mongoose');


const CompanySchema = moongose.Schema({
  Name: String,
  Logo: String,
  Web: String,
  ShortName: String,
  Active: Boolean,
  AccessToCustomers: Boolean,
  AccessToSupplier: Boolean,
  RequiredIncome: Boolean,
  RequiredOutput: Boolean,
  CompanyRecords: Boolean,
  AverageCost: Boolean,
})

const Company = moongose.model('Company', CompanySchema)

export default Company


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