const moongose = require('mongoose');
const Company = require('./company.model');
const Schema = moongose.Schema;

const DiscountSchema = Schema({
  Name: String,
  DiscountNumber: Number,
  Company: {
    type: Schema.ObjectId,
    ref: "Company"
  } 
})




module.exports= moongose.model('Discount', DiscountSchema)







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
