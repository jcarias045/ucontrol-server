module.exports = (sequelize, Sequelize) => {
	const User = sequelize.define('sys_company', {	
	  ID_Company: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
    },
	  Name: {
			type: Sequelize.STRING
      },
      Logo:{
        type: Sequelize.STRING
      },
      Web:{
        type: Sequelize.STRING
      },
      ShortName:{
        type: Sequelize.STRING
      },
      Active:{
          type: Sequelize.BOOLEAN
      }
   
	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
        freezeTableName: true,
        timestamps: false,
	  });
	
	return User;
}