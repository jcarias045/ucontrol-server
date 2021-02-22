module.exports = (sequelize, Sequelize) => {
	const taxes = sequelize.define('crm_taxes', {	
	  id_taxes: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
    },
	  name: {
			type: Sequelize.STRING
      },
      document:{
        type: Sequelize.STRING
      },
      id_company:{
        type: Sequelize.INTEGER,
	  	foreignKey: true
      },
      percentage:{
        type: Sequelize.DECIMAL

      }
      
   
	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
        freezeTableName: true,
        timestamps: false,
	  });
	
	return taxes;
}