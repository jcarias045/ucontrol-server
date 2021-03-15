module.exports = (sequelize, Sequelize) => {
	const Inventory = sequelize.define('ec_inventory', {	
	  ID_Inventory: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
    },	  
      Stock:{
        type: Sequelize.INTEGER,
      },
      Description:{
        type: Sequelize.STRING
      },
      ID_Bodega:{
        type: Sequelize.INTEGER,
      },
      ID_Company:{
        type: Sequelize.INTEGER,
        foreign_key:true,
      },
      ID_Products:{
        type: Sequelize.INTEGER,
        foreign_key:true,
      }
	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
        freezeTableName: true,
        timestamps: false,       
	  });
	
	return Inventory;
}