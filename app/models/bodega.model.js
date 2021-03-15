module.exports = (sequelize, Sequelize) => {
	const Bodega = sequelize.define('crm_bodega',{
        ID_Bodega:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        ID_Company:{
            type: Sequelize.INTEGER,
		    foreign_key:true,
        },
        Name:{
            type: Sequelize.INTEGER,
        },
        State:{
            type: Sequelize.BOOLEAN,
        }
    },{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
        freezeTableName: true,
        timestamps: false,
	  });
      return Bodega
    }