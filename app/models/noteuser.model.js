module.exports = (sequelize, Sequelize) => {
	const NoteUser = sequelize.define('crm_noteuser', {	
	  ID_NoteUser: {
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
        type: Sequelize.DATE
      },
      ID_User:{
        type: Sequelize.INTEGER,
        foreign_key:true,
      }   
	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
        freezeTableName: true,
        timestamps: false,
	  });
	
	return NoteUser;
}