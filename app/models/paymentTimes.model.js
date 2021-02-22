module.exports = (sequelize, Sequelize) => {
	const paymenttime = sequelize.define('ec_paymenttime', {	
        ID_PaymentTime	  : {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey:true
    },
        Name  : {
            type: Sequelize.STRING,        
           
    },
    Description : {
        type: Sequelize.STRING,  
      },
   
	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
        freezeTableName: true,
        timestamps: false,
	  });
	
	return paymenttime;
}