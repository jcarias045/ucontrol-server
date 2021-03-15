const moongose = require('mongoose');
import Company from './company.model';
import User from './user.model';

const CustomerSchema = moongose.Schema({
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
  Images: String,
  Acces: Boolean,
  AccountsReceivable: Number,
  PaymentTime: Number,
  Active: Boolean,
  User: User,
  Company: Company,    
})

const Customer = moongose.model('Customer', CustomerSchema)

export default Customer







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