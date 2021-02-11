module.exports = (sequelize, Sequelize) => {
	const order = sequelize.define('ec_order', {	
	  ID_Order: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
    },
    ID_User:
    {
        type: Sequelize.INTEGER,
        foreign_key: true,
        null: true,
    },
    ID_Customer:
    {
        type: Sequelize.INTEGER,
        foreign_key: true,
    },
    CreationDate:
    {
        type: Sequelize.DATE
    },
    Total:
    {
        type: Sequelize.DECIMAL
    },
    Active:
    {
        type: Sequelize.STRING
    },
    State:
    {
        type: Sequelize.STRING,
    } 
   
	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
        freezeTableName: true,
        timestamps: false,
	  });
	
	return Order;
    }