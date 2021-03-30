const moongose = require('mongoose');
const Schema = moongose.Schema
const Company = require('./company.model')

const MeasureSchema = Schema({
  Name: String,
  Description: String,
  State: Boolean,
  Company: { type: Schema.ObjectId, 
             ref: "Company",
             // autopopulate: true,
           },
})

module.exports = moongose.model('Measure', MeasureSchema)





//module.exports = (sequelize, Sequelize) => {
// 	const Measure = sequelize.define('crm_measures', {	
// 	  ID_Measure: {
//             type: Sequelize.INTEGER,
//             autoIncrement: true,
//             primaryKey: true
//     },
// 	  Name: {
// 			type: Sequelize.STRING
//     },
//     ID_Company: {
// 			type: Sequelize.INTEGER
//     },
//     Description: {
// 			type: Sequelize.STRING
//     },
//     state: {
//       type: Sequelize.BOOLEAN
//     }
// 	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
//         freezeTableName: true,
//         timestamps: false,
// 	  });
	
// 	return Measure;
// }