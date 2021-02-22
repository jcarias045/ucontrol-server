module.exports = (sequelize, Sequelize) => {
    const PaymentTime = sequelize.define('ec_paymenttime',{
        ID_PaymentTime: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        Name: {
            type: Sequelize.STRING,
        },
        Description:{
            type: Sequelize.STRING,
        },
        ID_Company:{
            type: Sequelize.INTEGER,
            foreign_key: true,
        }
    },{
		freezeTableName: true,
		timestamps: false,
	});
	
	return PaymentTime;
}