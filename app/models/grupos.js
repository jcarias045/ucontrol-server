module.exports = (sequelize, Sequelize) => {
	const grupos = sequelize.define('sys_grupos', {	
   
      ID_Grupo:{
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      Name: {
        type: Sequelize.STRING,
  
  },
  icon: {
    type: Sequelize.STRING,

}
   
	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
        freezeTableName: true,
        timestamps: false,
	  });
	
	return grupos;
}