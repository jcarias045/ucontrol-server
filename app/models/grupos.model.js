const moongose = require('mongoose');
const Schema = moongose.Schema;


const GruposSchema = Schema({
    Name: String,
    icon: String,
})

module.exports =  moongose.model('Grupos', GruposSchema );





// module.exports = (sequelize, Sequelize) => {
// 	const grupos = sequelize.define('sys_grupos', {	
   
//       ID_Grupo:{
//         type: Sequelize.INTEGER,
//         primaryKey: true
//       },
//       Name: {
//         type: Sequelize.STRING,
  
//   }
   
// 	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
//         freezeTableName: true,
//         timestamps: false,
// 	  });
	
// 	return grupos;
// }