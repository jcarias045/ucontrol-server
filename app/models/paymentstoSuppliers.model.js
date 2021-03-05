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
       
        DatePayment	:{
            type: Sequelize.DATE
        },
        Saldo:{
            type: Sequelize.DECIMAL
            
        },
        codpayment: {
            type: Sequelize.INTEGER,
        },
        ID_User: {
            type: Sequelize.INTEGER,

        }
    },{
		freezeTableName: true,
		timestamps: false,
	});
	
	return Payment;
}