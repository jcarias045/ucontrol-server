import mongoose from 'mongoose';

const OpMenuModelSchema = mongoose.Schema({
    Name: String,
    Grupo: {
      Name: String
    }
})

const OpMenu = mongoose.model('OpMenu', OpMenuModelSchema );

export default OpMenu;


// module.exports = (sequelize, Sequelize) => {
// 	const sysop = sequelize.define('sys_optionmenu', {	
//         ID_OptionMenu : {
//             type: Sequelize.INTEGER,
//             autoIncrement: true,
//             primaryKey: true
//     },
// 	  Name: {
// 			type: Sequelize.STRING,
      
//       },
//       ID_Grupo:{
//         type: Sequelize.INTEGER,
//         foreignKey: true
//       }
   
// 	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
//         freezeTableName: true,
//         timestamps: false,
// 	  });
	
// 	return sysop;
// }