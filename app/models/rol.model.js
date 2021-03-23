const moongose = require('mongoose');
const Schema = moongose.Schema
const Company = require('./company.model');

const RolSchema = Schema({
  Name: String,
  Description: String,
  State: Boolean,
  Company: {
    type: Schema.ObjectId, 
    ref: "Company"
  }
})
    

module.exports =  moongose.model('Rol', RolSchema)






// module.exports = (sequelize, Sequelize) => {
// 	const rol = sequelize.define('sys_roles', {	
//         ID_Rol : {
//             type: Sequelize.INTEGER,
//             autoIncrement: true,
//             primaryKey: true
//     },
// 	  Name: {
// 			type: Sequelize.STRING,
      
//       },
//       Description: {
//         type: Sequelize.STRING,
//       },
//       ID_Company:{
//         type: Sequelize.INTEGER,
        
//       },
//       State:{
//         type: Sequelize.BOOLEAN,
//       }
   
// 	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
//         freezeTableName: true,
//         timestamps: false,
// 	  });
	
// 	return rol;
// }