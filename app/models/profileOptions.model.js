const moongose = require('mongoose');
const Schema =  moongose.Schema;
const Rol = require('./rol.model');
const OpMenu = require('./systemOp.model');


const ProfileOptionSchema = Schema({
  Checked: Boolean,
  Rol: {
    type: Schema.ObjectId,
    ref: "Rol"
  },
  OpMenu: {
    type: Schema.ObjectId,
    ref: "OpMenu"
  } 
})

module.exports = moongose.model('ProfileOption', ProfileOptionSchema)





// module.exports = (sequelize, Sequelize) => {
// 	const profileOp = sequelize.define('sys_profileoptions', {	
//         ID_ProfileOptions	  : {
//             type: Sequelize.INTEGER,
//             autoIncrement: true,
//             primaryKey:true
//     },
//         ID_Rol  : {
//             type: Sequelize.INTEGER,
            
           
//     },
//     ID_OptionMenu : {
//         type: Sequelize.INTEGER,
            
        
      
//       },
//       Checked:{
//         type: Sequelize.BOOLEAN,
//       }
      
   
// 	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
//         freezeTableName: true,
//         timestamps: false,
// 	  });
	
// 	return profileOp;
// }