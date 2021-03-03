module.exports = (sequelize, Sequelize) => {
	const taxesinvoice = sequelize.define('ec_invoicetaxes', {	
	  id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
    },
    ID_PurchaseInvoice: {
			type: Sequelize.STRING
      },
      ID_Taxes :{
        type: Sequelize.STRING
      },
      Monto	:{
        type: Sequelize.INTEGER,
	  	foreignKey: true
      }
      
   
	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
        freezeTableName: true,
        timestamps: false,
	  });
	
	return taxesinvoice;
}