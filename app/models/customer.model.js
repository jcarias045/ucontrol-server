module.exports = (sequelize, Sequelize) => {
	const Customer = sequelize.define('crm_customers', {	
	  ID_Customer: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
       },
	  Name: {
			type: Sequelize.STRING
	  },
	  LastName:{
		type: Sequelize.STRING
	  },
	  User :{
		type: Sequelize.STRING
	  },
	  Email :{
		type: Sequelize.STRING,
		unique: true
	  },
	  Password: {
		type: Sequelize.STRING
	  },
	  Country:{
		type: Sequelize.STRING
	  },
	  City:{
		type: Sequelize.STRING
	  },
	  ZipCode:{
		type: Sequelize.STRING
	  },
	  Phone:{
		type: Sequelize.STRING
	  },
	  MobilPhone:{
		type: Sequelize.STRING
	  },
	  IdNumber:{
		type: Sequelize.STRING
	  },
	  Images:{
		type: Sequelize.STRING
	  },
	  ID_Company:{
		type: Sequelize.INTEGER,
		foreign_key:true,
	  },
	  Access:{
		type: Sequelize.BOOLEAN,
		foreign_key:true,
	  },
	  AccountsReceivable:{
		type: Sequelize.DECIMAL
	  },
	  ID_PaymentTime:{
		type: Sequelize.INTEGER,
		foreign_key:true,
	  },
	  ID_User:{
		type: Sequelize.INTEGER,
		foreign_key:true,
	  }
	  
   
	},{
		freezeTableName: true,
		timestamps: false,
	});
	
	return Customer;
}