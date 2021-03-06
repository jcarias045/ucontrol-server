const mongoose = require('mongoose');
const Schema =  mongoose.Schema;
const Company = require('./company.model');
const Rol = require('./rol.model');
const Profile = require('./profile.model.js');


const UserSchema = Schema({
  Name: String,
  LastName: String,
  Email: String,
  Password: String,
  Gender: String,
  BirthDate: Date,
  Country: String,
  Address: String,
  LastLogin: Date,
  Active: Boolean,
  Image: String,
  UserName: String,
  Company: {
    type: Schema.ObjectId, 
    ref: "Company"
          },
  Rol:{
    type: Schema.ObjectId,
    ref: "Rol"
  },
  Profile:{
    type: Schema.ObjectId,
    ref: "Profile"
  }        
})

module.exports = mongoose.model('User', UserSchema)





// module.exports = (sequelize, Sequelize) => {
// 	const User = sequelize.define('sys_user', {	
// 	  ID_User: {
//             type: Sequelize.INTEGER,
//             autoIncrement: true,
//             primaryKey: true
// 	},
// 	ID_Company:{
// 		type: Sequelize.INTEGER,
// 		foreignKey: true
// 	},
// 	  Name: {
// 			type: Sequelize.STRING
// 	  },
// 	  LastName: {
// 		type: Sequelize.STRING
// 	  },
// 	  UserName:{
// 		type: Sequelize.STRING
//   	},
	  
// 	  Email:{
// 		type: Sequelize.STRING,
// 		unique: true
// 	  },
// 	  Password:{ 
// 		type: Sequelize.STRING
// 	  },
// 	  Gender:{
// 		type: Sequelize.STRING
// 	  },
// 	  BirthDate:{
// 		type: Sequelize.STRING
// 	  },
// 	  Country:{
// 		type: Sequelize.STRING
// 	  },
// 	  Address:{
// 		type: Sequelize.STRING
// 	  },
// 	  ID_Profile:{
// 		type: Sequelize.INTEGER,
// 		foreignKey: true
// 	  },
// 	  LastLogin:{
// 		type: Sequelize.DATE
// 	  },
// 	  Active:{
// 		type: Sequelize.BOOLEAN
// 	  },
// 	  ID_Rol:{
// 		type: Sequelize.INTEGER,
// 	  }
   
// 	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
// 		freezeTableName: true,
// 		timestamps: false,
// 	  });
	
// 	return User;
// }