module.exports = (sequelize, Sequelize) => {
	const Product = sequelize.define('crm_products', {	
	  ID_Products: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
    },
	  Name: {
			type: Sequelize.STRING,
      
      },
      Brand:{
        type: Sequelize.STRING
      },
      SellPrice:{
        type: Sequelize.DECIMAL
      },
      ShortName:{
        type: Sequelize.STRING
      },
      ID_Company:{
          type: Sequelize.INTEGER,
          foreignKey: true
      },
      ID_CatProduct:{
        type: Sequelize.INTEGER,
        foreignKey: true
      },
      ID_Supplier:{
          type: Sequelize.INTEGER,
          foreignKey: true,
          null: true,
      },
      ID_Measure:{
        type: Sequelize.INTEGER,
        foreignKey: true
      },
      
      Logo:{
        type: Sequelize.STRING
      },
      MinStock:{
          type: Sequelize.DECIMAL
      },
      MaxStock:{
        type: Sequelize.DECIMAL
      },
      Active:{
        type: Sequelize.BOOLEAN
      },
      BuyPrice:{
        type: Sequelize.DECIMAL
      },
      codproducts:{
        type: Sequelize.STRING
      }
 
	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
        freezeTableName: true,
        timestamps: false,
	  });
	
	return Product;
}