module.exports = (sequelize, Sequelize) => {
	const Products = sequelize.define('crm_products', {	
	  ID_Products: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
    },
	  Name: {
			type: Sequelize.STRING
      },
      Brand:{
        type: Sequelize.STRING
      },
      Price:{
        type: Sequelize.DECIMAL
      },
      Stock:{
        type: Sequelize.INTEGER
      },
      ShortName:{
          type: Sequelize.STRING
      },
      ID_Company:{
		type: Sequelize.INTEGER,
		foreign_key:true,
      },
      ID_CatProduct:{
		type: Sequelize.INTEGER,
		foreign_key:true,
	  }
   
	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
        freezeTableName: true,
        timestamps: false,
	  });
	
	return Products;
}