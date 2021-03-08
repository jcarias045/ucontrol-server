module.exports = (sequelize, Sequelize) =>{

    const Brand = sequelize.define('crm_brand',{
        
        ID_Brand: { 
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        Name:{
            type: Sequelize.STRING,
        },
        Description:{
            type: Sequelize.STRING
        },
        ID_Company:{
            type: Sequelize.INTEGER,
		    foreign_key:true,
        }
    },{
		freezeTableName: true,
		timestamps: false,
	});
	
	return Brand;
}