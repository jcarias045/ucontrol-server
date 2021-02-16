module.exports = (sequelize, Sequelize) => {
	const purchaseOrder = sequelize.define('ec_purchaseorder', {	
	  ID_PurchaseOrder: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
    },
    ID_Supplier:
    {
        type: Sequelize.INTEGER,
        foreign_key: true,
       
    },
    InvoiceNumber:
    {
        type: Sequelize.STRING,
        
    },
    Image:
    {
        type: Sequelize.DATE
    },
    Total:
    {
        type: Sequelize.DECIMAL
    },
    Active:
    {
        type: Sequelize.STRING
    },
    ID_User :
    {
      type: Sequelize.INTEGER,
      foreign_key: true,
    } ,
    DeliverDate:{
      type: Sequelize.DATE
    },
    CreationDate:{
      type: Sequelize.DATE
    },
    State:{
      type: Sequelize.STRING
    },
    Description:{
      type: Sequelize.STRING
    },
    codpurchase:{
      type: Sequelize.INTEGER
    },
   
	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
        freezeTableName: true,
        timestamps: false,
	  });
	
	return purchaseOrder;
    }