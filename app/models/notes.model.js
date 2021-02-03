module.exports = (sequelize, Sequelize) => {
	const Notes = sequelize.define('crm_note', {	
	  ID_Notes: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
    },
	  Subject: {
			type: Sequelize.STRING
      },
      Text:{
        type: Sequelize.STRING
      },
      CreationDate:{
        type: Sequelize.STRING
      },
      UserName:{
        type: Sequelize.STRING
      }
	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
        freezeTableName: true,
        timestamps: false,
	  });
	
	return Notes;
}
