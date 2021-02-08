module.exports = (sequelize, Sequelize) => {
	const Inventory = sequelize.define('ec_inventory', {	
	  ID_Inventory: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
    },
	  ID_Products: {
			type: Sequelize.STRING
      },
      Stock:{
        type: Sequelize.INTEGER
      },
      Description:{
        type: Sequelize.STRING
      },  
	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
        freezeTableName: true,
        timestamps: false,
	  });
	
	return Inventory;
}