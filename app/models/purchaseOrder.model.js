module.exports = (sequelize, Sequelize) => {
	const PurchaseOrder = sequelize.define('ec_purchaseorder', {	
	  ID_PurchaseOrder: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
    },
	  ID_Supplier: {
			type: Sequelize.INTEGER,
            foreign_key:true,
      },
      InvoceNumber:{
        type: Sequelize.STRING
      },
      Image:{
        type: Sequelize.STRING
      },
      Total:{
        type: Sequelize.STRING
      },
      Active:{
        type: Sequelize.STRING
        },
       ID_User:{
        type: Sequelize.INTEGER,
        foreign_key:true,
        },
        ID_Inventory:{
            type: Sequelize.INTEGER,
            foreign_key:true,
        },
        DeliverDate:{
            type: Sequelize.DATE
        },
        CreationDate:{
            type: Sequelize.DATE
        },
        State:{
            type: Sequelize.STRING,
            
        }
      
   
	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
        freezeTableName: true,
        timestamps: false,
	  });
	
	return PurchaseOrder;
}