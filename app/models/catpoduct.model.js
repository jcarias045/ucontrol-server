const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Company = require('./company.model');



const CatProductSchema = Schema({
  Name: String,
  Description: String,
  Company:{
    type: Schema.ObjectId, 
    ref: "Company",
  }
})

module.exports = mongoose.model('CatProduct', CatProductSchema)






// module.exports = (sequelize, Sequelize) => {
// 	const CatProduct = sequelize.define('crm_catproduct', {	
// 	  ID_CatProduct: {
//             type: Sequelize.INTEGER,
//             autoIncrement: true,
//             primaryKey: true
//     },
// 	  Name: {
// 			type: Sequelize.STRING
//       },
//       Description:{
//         type: Sequelize.STRING
//       },
//     ID_Company:{
//       type: Sequelize.INTEGER,
//       foreign_key:true,
//     }
// 	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
//         freezeTableName: true,
//         timestamps: false,
// 	  });
	
// 	return CatProduct;
// }