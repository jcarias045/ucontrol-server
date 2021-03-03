module.exports = (sequelize, Sequelize) => {
    const PaymentDetail = sequelize.define('ec_paymentdetails',{
        ID_PaymentDetails   : {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        Number : {
            type: Sequelize.INTEGER,
            foreignKey: true
        },
        BankName 	:{
            type: Sequelize.STRING,
           
        },
        Date	:{
            type: Sequelize.DATE
        },
        Amount:{
            type: Sequelize.DECIMAL
            
        },
        Reason:{
            type: Sequelize.STRING,

        },
        ID_Payments:{
            type: Sequelize.INTEGER,
            foreignKey: true
        },
        NoTransaction:{
            type: Sequelize.INTEGER,

        }
    },{
		freezeTableName: true,
		timestamps: false,
	});
	
	return PaymentDetail;
}