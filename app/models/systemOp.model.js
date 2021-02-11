module.exports = (sequelize, Sequelize) => {
	const sysop = sequelize.define('sys_optionmenu', {	
        ID_OptionMenu : {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
    },
	  Name: {
			type: Sequelize.STRING,
      
      },
      Description:{
        type: Sequelize.STRING
      },
      
   
	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
        freezeTableName: true,
        timestamps: false,
	  });
	
	return sysop;
}