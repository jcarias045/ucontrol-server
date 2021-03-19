const mongoose = require('mongoose');
const Schema =  mongoose.Schema;
const Bodega = require('./bodega.model');
const Company = require('./company.model');
const Product = require('./product.model');

const InventorySchema = Schema({
  Stock: Number,
  Description: String,
  Bodega: {type: Schema.ObjectId, 
    ref: "Bodega",
    // autopopulate: true,
  },
  Company: {type: Schema.ObjectId, 
    ref: "Company",
    // autopopulate: true,
  },
  Product: {type: Schema.ObjectId, 
    ref: "Product",
    // autopopulate: true,
  }
 
})

module.exports = mongoose.model('Inventory', InventorySchema)

// module.exports = (sequelize, Sequelize) => {
// 	const Inventory = sequelize.define('ec_inventory', {	
// 	  ID_Inventory: {
//             type: Sequelize.INTEGER,
//             autoIncrement: true,
//             primaryKey: true
//     },	  
//       Stock:{
//         type: Sequelize.INTEGER,
//       },
//       Description:{
//         type: Sequelize.STRING
//       },
//       ID_Bodega:{
//         type: Sequelize.INTEGER,
//       },
//       ID_Company:{
//         type: Sequelize.INTEGER,
//         foreign_key:true,
//       },
//       ID_Products:{
//         type: Sequelize.INTEGER,
//         foreign_key:true,
//       }
// 	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
//         freezeTableName: true,
//         timestamps: false,       
// 	  });
	
// 	return Inventory;
// }