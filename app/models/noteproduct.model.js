module.exports = (sequelize, Sequelize) => {
	const NoteProduct = sequelize.define('crm_noteproduct', {	
	  ID_NoteProduct: {
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
      ID_User:{
        type: Sequelize.INTEGER,
        foreign_key:true,
      },
      Time:{
        type: Sequelize.STRING
      },
      ID_Products:{
        type: Sequelize.INTEGER,
        foreign_key:true,
      }      
	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
        freezeTableName: true,
        timestamps: false,
	  });
	
	return NoteProduct;
}