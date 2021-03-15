import mongoose from 'mongoose';

const ProductSchema = mongoose.Schema({
    Name: String,
    SellPrice: Number,
    ShortName: String,
    Logo: Buffer,
    MinStock: Number,
    MaxStock: Number,
    Active: Boolean,
    BuyPrice: Number,
    codproducts: String,
    Inventary: Number,
    AverageCost: Number
})

const Product = mongoose.model('Product', ProductSchema );

export default Product;


// module.exports = (sequelize, Sequelize) => {
// 	const Product = sequelize.define('crm_products', {	
// 	  ID_Products: {
//             type: Sequelize.INTEGER,
//             autoIncrement: true,
//             primaryKey: true
//     },
// 	  Name: {
// 			type: Sequelize.STRING,
      
//       },
//       ID_Brand:{
//         type: Sequelize.INTEGER,
//         foreignKey: true
//       },
//       SellPrice:{
//         type: Sequelize.DECIMAL
//       },
//       ShortName:{
//         type: Sequelize.STRING
//       },
//       ID_Company:{
//           type: Sequelize.INTEGER,
//           foreignKey: true
//       },
//       ID_CatProduct:{
//         type: Sequelize.INTEGER,
//         foreignKey: true
//       },
//       ID_Supplier:{
//           type: Sequelize.INTEGER,
//           foreignKey: true,
//           null: true,
//       },
//       ID_Measure:{
//         type: Sequelize.INTEGER,
//         foreignKey: true
//       },
      
//       Logo:{
//         type: Sequelize.STRING
//       },
//       MinStock:{
//           type: Sequelize.DECIMAL
//       },
//       MaxStock:{
//         type: Sequelize.DECIMAL
//       },
//       Active:{
//         type: Sequelize.BOOLEAN
//       },
//       BuyPrice:{
//         type: Sequelize.DECIMAL
//       },
//       codproducts:{
//         type: Sequelize.STRING
//       }
//       // Inventary:{
//       //   type: Sequelize.DECIMAL
//       // }
 
// 	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
//         freezeTableName: true,
//         timestamps: false,
// 	  });
	
// 	return Product;
// }