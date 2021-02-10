module.exports = (sequelize, Sequelize) => {
	const User = sequelize.define('sys_user', {	
	  ID_User: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
	},
	ID_Company:{
		type: Sequelize.INTEGER,
		foreignKey: true
	},
	  Name: {
			type: Sequelize.STRING
	  },
	  LastName: {
		type: Sequelize.STRING
	  },
	  UserName:{
		type: Sequelize.STRING
  	},
	  
	  Email:{
		type: Sequelize.STRING,
		unique: true
	  },
	  Password:{ 
		type: Sequelize.STRING
	  },
	  Gender:{
		type: Sequelize.STRING
	  },
	  BirthDate:{
		type: Sequelize.STRING
	  },
	  Country:{
		type: Sequelize.STRING
	  },
	  Address:{
		type: Sequelize.STRING
	  },
	  ID_Profile:{
		type: Sequelize.INTEGER,
		foreignKey: true
	  },
	  LastLogin:{
		type: Sequelize.DATE
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