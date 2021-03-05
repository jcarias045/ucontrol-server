module.exports = (sequelize, Sequelize) => {
    const PaymentDetail = sequelize.define('ec_paymentdetails',{
        ID_PaymentDetails   : {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        Number : {
            type: Sequelize.INTEGER,
           
        },
        BankName 	:{
            type: Sequelize.STRING,
           
        },
        CreationDate:{
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

        },
        ID_PaymentMethods:{
            type: Sequelize.INTEGER,
            foreignKey: true
        },
        Cancelled:{
            type: Sequelize.BOOLEAN,
        }
    },{
		freezeTableName: true,
		timestamps: false,
	});
	
	return PaymentDetail;
}