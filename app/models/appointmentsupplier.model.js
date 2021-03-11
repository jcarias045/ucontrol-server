module.exports = (sequelize, Sequelize) => {
	const BookingSupplier = sequelize.define('crm_appointmentsupplier', {	
    ID_AppointmentSupplier	: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
    },
    StartDate: {
			type: Sequelize.STRING
      },
      EndDate:{
        type: Sequelize.STRING
      },
      Description:{
        type: Sequelize.STRING
      },
      State:{
        type: Sequelize.BOOLEAN
      },
      ID_User:{
        type: Sequelize.INTEGER,
        foreign_key:true,
      },
      ID_Supplier:{
        type: Sequelize.INTEGER,
        foreign_key:true,
      },
      Name:{
        type: Sequelize.INTEGER,
      },
      StartTime:{
          type: Sequelize.STRING,
      },
      EndTime:{
          type: Sequelize.STRING,
      }      
	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
        freezeTableName: true,
        timestamps: false,
	  });
	
	return BookingSupplier;
}