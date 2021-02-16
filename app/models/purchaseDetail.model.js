module.exports = (sequelize, Sequelize) => {
	const OrderDetails = sequelize.define('ec_purchasedetail', {	
        ID_PurchaseDetail : {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ID_PurchaseOrder: {
        type: Sequelize.INTEGER,
        foreign_key:true,
      },
    Quantity:{
        type: Sequelize.DECIMAL
        },
    Discount:{
        type: Sequelize.STRING
        },
    Price:{
        type: Sequelize.DECIMAL
        },
    ProductName:{
        type: Sequelize.STRING
        },
    Measures:{
        type: Sequelize.STRING,
        
        },
    ExperiationTime:{
        type: Sequelize.DATE,
        
    },
    ID_Inventory:{
        type: Sequelize.INTEGER,
        foreign_key:true,
    }
      
   
	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
        freezeTableName: true,
        timestamps: false,
	  });
	
	return OrderDetails;
}