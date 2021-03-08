module.exports = (sequelize, Sequelize) => {
	const NoteCustomer = sequelize.define('crm_notecustomer', {	
	  ID_NoteCustomer: {
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
     Date:{
        type: Sequelize.STRING
      },
      Time:{
        type: Sequelize.STRING
      },
      ID_User:{
        type: Sequelize.INTEGER,
        foreign_key:true,
      },
      ID_Customer:{
        type: Sequelize.INTEGER,
        foreign_key:true,
      }      
	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
        freezeTableName: true,
        timestamps: false,
	  });
	
	return NoteCustomer;
}