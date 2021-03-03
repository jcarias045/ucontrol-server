module.exports = (sequelize, Sequelize) => {
	const productEntry = sequelize.define('ec_productentry', {	
    ID_ProductEntry : {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
    },
    EntryDate	: {
			type: Sequelize.DATE
      },
      ID_User:{
        type: Sequelize.INTEGER
      },
      Comments	:{
        type: Sequelize.STRING,
	  	
      },
      State:{
        type: Sequelize.BOOLEAN

      },
      codentry:{
        type: Sequelize.INTEGER,
      },
      ID_Company:{
        type: Sequelize.INTEGER
      }
      
   
	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
        freezeTableName: true,
        timestamps: false,
	  });
	
	return productEntry;
}