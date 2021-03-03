module.exports = (sequelize, Sequelize) => {
	const Supplier = sequelize.define('crm_supplier', {	
	  ID_Supplier: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
    },
	   ID_Company: {
			type: Sequelize.INTEGER,
            foreign_key:true,
      },
      Name:{
        type: Sequelize.STRING
      },
      Web:{
        type: Sequelize.STRING
      },
      Email:{
        type: Sequelize.STRING,
        unique: true
      },
      Phone:{
        type: Sequelize.STRING
        },
        Adress:{
            type: Sequelize.STRING
        },
        DebsToPay:{
            type: Sequelize.DECIMAL
        },
        Active:{
            type: Sequelize.BOOLEAN
        },
        codsupplier:{
            type: Sequelize.STRING
        },
        PaymentTime:{
            type: Sequelize.INTEGER,
            
        },
        deliveryDays:{
          type: Sequelize.INTEGER,
        },
        ID_SupplierType:{
          type: Sequelize.INTEGER,
          foreign_key:true,
        }

	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
        freezeTableName: true,
        timestamps: false,
	  });
	
	return Supplier;
}