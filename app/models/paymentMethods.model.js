module.exports = (sequelize, Sequelize) => {
    const PaymentMethods = sequelize.define('ec_paymentmethods',{
        ID_PaymentMethods : {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        Name: {
            type: Sequelize.STRING,
        },
        Description	:{
            type: Sequelize.STRING,
        }
    },{
		freezeTableName: true,
		timestamps: false,
	});
	
	return PaymentMethods;
}