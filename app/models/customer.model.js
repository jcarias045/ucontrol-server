module.exports = (sequelize, Sequelize) => {
	const Customer = sequelize.define('crm_customers', {	
	  id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
    },
	  nombre: {
			type: Sequelize.STRING
	  }
   
	});
	
	return Customer;
}