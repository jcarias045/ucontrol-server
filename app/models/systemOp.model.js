const moongose = require('mongoose');
const Schema = moongose.Schema;
const Grupos = require('./grupos.model');

const OpMenuModelSchema = Schema({
    Name: String,
    Grupos: {
        type: Schema.ObjectId,
        ref: "Grupos"
    },
    URL: String,
    State: Boolean,
})

module.exports =  moongose.model('OpMenu', OpMenuModelSchema );




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