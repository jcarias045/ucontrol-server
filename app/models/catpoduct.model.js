const moongose = require('mongoose');
import Company from './company.model';

const BrandSchema = moongose.Schema({
  Name: String,
  Description: String,
  Company: Company 
})

const Brand = moongose.model('Brand', BrandSchema)

export default Brand




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