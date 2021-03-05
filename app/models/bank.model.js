module.exports = (sequelize, Sequelize) =>{

    const Bank = sequelize.define('crm_bank',{
        
        ID_Bank: { 
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        Name:{
            type: Sequelize.STRING,
        },
        Phone:{
            type: Sequelize.STRING,
        },
        Address:{
            type: Sequelize.STRING,
        },
        ID_Company:{
            type: Sequelize.INTEGER,
		    foreign_key:true,
        }
    },{
		freezeTableName: true,
		timestamps: false,
	});
	
	return Bank;
}
