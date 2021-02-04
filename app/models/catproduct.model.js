module.exports = (sequelize, Sequelize) => {
	const CatProduct = sequelize.define('crm_catproducts', {	
	  ID_CatProduct: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
       },
	  Name: {
			type: Sequelize.STRING
	  },
	  Description:{
		type: Sequelize.STRING
	  }    
	},{
		timestamps: false,
	});
	
	return CatProduct;
}