module.exports = (sequelize, Sequelize) => {
	const invoiceEntries = sequelize.define('ec_invoiceentry', {	
    ID_InvoiceEntry  : {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
    },
    ID_PurchaseInvoiceDetail		: {
			type: Sequelize.INTEGER
      },
      ID_ProductEntry:{
        type: Sequelize.INTEGER
      },
      Quantity		:{
        type: Sequelize.DECIMAL,
	  	
      },
      ID_Inventory:{
        type: Sequelize.INTEGER

      }
      
   
	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
        freezeTableName: true,
        timestamps: false,
	  });
	
	return invoiceEntries;
}