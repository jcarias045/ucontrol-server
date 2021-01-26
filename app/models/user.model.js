module.exports = (sequelize, Sequelize) => {
	const User = sequelize.define('sys_user', {	
	  id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
    },
	  nombre: {
			type: Sequelize.STRING
	  }
   
	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
		freezeTableName: true
	  });
	
	return User;
}