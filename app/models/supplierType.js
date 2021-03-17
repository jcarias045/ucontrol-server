module.exports = (sequelize, Sequelize) => {
	const suppliertype = sequelize.define('crm_suppliertype', {	
        ID_SupplierType : {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
    },
       Name: {
			type: Sequelize.STRING
      },
      Description:{
        type: Sequelize.STRING
      },
      ID_Company :{
        type: Sequelize.INTEGER,
	  	foreignKey: true
      }
      
   
	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
        freezeTableName: true,
        timestamps: false,
	  });
	
	return suppliertype;
}