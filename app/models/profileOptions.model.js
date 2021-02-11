module.exports = (sequelize, Sequelize) => {
	const profileOp = sequelize.define('sys_profileoptions', {	
        ID_ProfileOptions	  : {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey:true
    },
        ID_Profile  : {
            type: Sequelize.INTEGER,
            
           
    },
    ID_OptionMenu : {
        type: Sequelize.INTEGER,
            
        
      
      },
      
      
   
	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
        freezeTableName: true,
        timestamps: false,
	  });
	
	return profileOp;
}