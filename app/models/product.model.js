const moongose = require('mongoose')
const Schema = moongose.Schema
const Brand = require('./brand.model')
const Company = require('./company.model')
const CatProduct = require('./catpoduct.model')
const Supplier = require('./supplier.model')
const Measure = require('./measure.model')

const ProductSchema = Schema({
    Name: String,
    Brand: { type: Schema.ObjectId, 
             ref: "Brand",
             // autopopulate: true,
           },
    SellPrice: Number,
    ShortName: String,
    Company: { type: Schema.ObjectId, 
               ref: "Company",
               // autopopulate: true,
             },
    CatProduct: { type: Schema.ObjectId, 
                  ref: "CatProduct",
                  // autopopulate: true,
                },
    Supplier: { type: Schema.ObjectId, 
                ref: "Supplier",
                // autopopulate: true,
              },
    Logo: Buffer,
    MinStock: Number,
    MaxStock: Number,
    Active: Boolean,
    BuyPrice: Number,
    codproducts: String,
    Measure: { 
      type: Schema.ObjectId, 
        ref: "Measure",
        // autopopulate: true,
      },
   
    AverageCost: Number
})

module.exports = moongose.model('Product', ProductSchema );




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