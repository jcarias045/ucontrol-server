module.exports = (sequelize, Sequelize) => {
	const purchaseInvoiceD = sequelize.define('ec_purchaseinvoicedetails', {	
        ID_PurchaseInvoiceDetail  : {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ID_PurchaseInvoice : {
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
    SubTotal:{
    type: Sequelize.DECIMAL
    },
 
    ID_Inventory:{
        type: Sequelize.INTEGER,
        foreign_key:true,
    },
    Ingresados:{
        type: Sequelize.DECIMAL
    },
    State:{
        type: Sequelize.BOOLEAN,
    }
      
   
	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
        freezeTableName: true,
        timestamps: false,
	  });
	
	return purchaseInvoiceD;
}