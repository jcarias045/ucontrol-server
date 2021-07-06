const moongose = require('mongoose');
const  Company = require('./company.model');
const User = require('./user.model');
const Discount = require('./discount.model');
const Sector = require('./sector.model');
const Schema =  moongose.Schema;

const CustomerSchema = Schema({
  Name: String,
  LastName: String,
  codCustomer: String,
  Email: String,
  Password: String,
  Country: String,
  City: String,
  ZipCode: String,
  Phone: String,
  MobilPhone: String,
  idNumber: String,
  Images: String,   //ESTE CAMPO ACTUALMENTE SE USA PARA ALMACENAR A QUIEN VA DIRIGIDA LA COTIZACION
  Access: Boolean,
  AccountsReceivable: Number,
  PaymentTime: Number,
  Active: Boolean,
  User: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  Company: {
    type: Schema.Types.ObjectId,
    ref: "Company"
  },
  Discount: {
    type: Schema.Types.ObjectId,
    ref: "Discount"
  },
  TypeofTaxpayer: String,
  PaymentCondition:String,
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
  Address: String,
  Classification:String,
  Contributor:String,
  Exempt:Boolean,
})

module.exports = moongose.model('Customer', CustomerSchema)









// module.exports = (sequelize, Sequelize) => {
// 	const Customer = sequelize.define('crm_customers', {	
// 	  ID_Customer: {
//             type: Sequelize.INTEGER,
//             autoIncrement: true,
//             primaryKey: true
//        },
// 	  Name: {
// 			type: Sequelize.STRING
// 	  },
// 	  LastName:{
// 		type: Sequelize.STRING
// 	  },
// 	  User :{
// 		type: Sequelize.STRING
// 	  },
// 	  Email :{
// 		type: Sequelize.STRING,
// 		unique: true
// 	  },
// 	  Password: {
// 		type: Sequelize.STRING
// 	  },
// 	  Country:{
// 		type: Sequelize.STRING
// 	  },
// 	  City:{
// 		type: Sequelize.STRING
// 	  },
// 	  ZipCode:{
// 		type: Sequelize.STRING
// 	  },
// 	  Phone:{
// 		type: Sequelize.STRING
// 	  },
// 	  MobilPhone:{
// 		type: Sequelize.STRING
// 	  },
// 	  idNumber:{
// 		type: Sequelize.STRING
// 	  },
// 	  Images:{
// 		type: Sequelize.STRING
// 	  },
// 	  ID_Company:{
// 		type: Sequelize.INTEGER,
// 		foreign_key:true,
// 	  },
// 	  Access:{
// 		type: Sequelize.BOOLEAN,
// 	  },
// 	  AccountsReceivable:{
// 		type: Sequelize.DECIMAL,
// 		null: true		
// 	  },
// 	  PaymentTime:{
// 		type: Sequelize.INTEGER,
// 	  },
// 	  ID_User:{
// 		type: Sequelize.INTEGER,
// 		foreign_key:true,
// 	  },
// 	  ID_Discount:{
// 		type: Sequelize.INTEGER,
// 		foreign_key:true
// 	  },
// 		Active:{
// 			  type: Sequelize.BOOLEAN,
// 		},	    
// 	},{
// 		freezeTableName: true,
// 		timestamps: false,
// 	});
	
// 	return Customer;
// }