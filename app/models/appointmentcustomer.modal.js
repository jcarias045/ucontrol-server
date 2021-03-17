const mongoose = require('mongoose');
const Customer = require('./customer.model');
const User= require('./user.model');
const Schema =  mongoose.Schema;

const AppointmenCustomerSchema = Schema({
  StartDate: Date,
  EndDate: Date, 
  Description: String,
  State: Boolean,
  User: {
    type: Schema.ObjectId,
    ref: "User"
  },
  Customer: { 
    type: Schema.ObjectId, 
    ref: "Customer",
  },
  Name: String,
  StartTime: Date,
  EndTime: Date,
})

module.exports = mongoose.model('BookingCustomer', AppointmenCustomerSchema)





// module.exports = (sequelize, Sequelize) => {
// 	const BookingCustomer = sequelize.define('crm_appointmentcustomer', {	
//     ID_AppointmentCustomer	: {
//             type: Sequelize.INTEGER,
//             autoIncrement: true,
//             primaryKey: true
//     },
//     StartDate: {
// 			type: Sequelize.STRING
//       },
//       EndDate:{
//         type: Sequelize.STRING
//       },
//       Description:{
//         type: Sequelize.STRING
//       },
//       State:{
//         type: Sequelize.BOOLEAN
//       },
//       ID_User:{
//         type: Sequelize.INTEGER,
//         foreign_key:true,
//       },
//       ID_Customer:{
//         type: Sequelize.INTEGER,
//         foreign_key:true,
//       },
//       Name:{
//         type: Sequelize.INTEGER,
//       },
//       StartTime:{
//           type: Sequelize.STRING,
//       },
//       EndTime:{
//           type: Sequelize.STRING,
//       }      
// 	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
//         freezeTableName: true,
//         timestamps: false,
// 	  });
	
// 	return BookingCustomer;
// }