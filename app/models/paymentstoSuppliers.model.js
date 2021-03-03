module.exports = (sequelize, Sequelize) => {
    const Payment = sequelize.define('ec_payments',{
        ID_Payments  : {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        ID_PurchaseInvoice : {
            type: Sequelize.INTEGER,
            foreignKey: true
        },
        ID_PaymentMethods 	:{
            type: Sequelize.INTEGER,
            foreignKey: true
        },
        DatePayment	:{
            type: Sequelize.DATE
        },
        Saldo:{
            type: Sequelize.DECIMAL
            
        }
    },{
		freezeTableName: true,
		timestamps: false,
	});
	
	return Payment;
}