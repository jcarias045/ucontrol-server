const moongose = require('mongoose');
import Company from './company.model';

const DiscountSchema = moongose.Schema({
  Name: String,
  Discount: Number,
  Company: Company, 
})

const Discount = moongose.model('Discount', DiscountSchema)

export default Discount






// module.exports = (sequelize, Sequelize) =>{

//     const Discount = sequelize.define('crm_discount',{
        
//         ID_Discount: { 
//             type: Sequelize.INTEGER,
//             autoIncrement: true,
//             primaryKey: true
//         },
//         Name:{
//             type: Sequelize.STRING,
//         },
//         Discount:{
//             type: Sequelize.INTEGER,
//         },
//         ID_Company:{
//             type: Sequelize.INTEGER,
// 		    foreign_key:true,
//         }
//     },{
// 		freezeTableName: true,
// 		timestamps: false,
// 	});
	
// 	return Discount;
// }
