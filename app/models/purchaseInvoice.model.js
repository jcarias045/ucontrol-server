module.exports = (sequelize, Sequelize) => {
	const purchaseInvoice= sequelize.define('ec_purchaseinvoice', {	
    ID_PurchaseInvoice : {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
    },
    ID_PurchaseOrder :
    {
        type: Sequelize.INTEGER,
        foreign_key: true,
       
    },
    InvoiceDate:
    {
        type: Sequelize.DATE,
        
    },
    CreationDate:{
        type: Sequelize.DATE
      },
    Total:
      {
          type: Sequelize.DECIMAL
      },
    Comments:
    {
        type: Sequelize.STRING
    },
    DeliverDay:{
        type: Sequelize.DATE
    },
    
    ID_Supplier :
    {
      type: Sequelize.INTEGER,
      foreign_key: true,
      
    } ,
    
    ID_User :
    {
      type: Sequelize.INTEGER,
      
    } ,
    PurchaseNumber:{ //numero del PO que es invoice nmber en la orden de compra
      type: Sequelize.INTEGER
    },
    
    codInvoice:{ //numero del PO que es invoice nmber en la orden de compra
      type: Sequelize.INTEGER
    },
    InvoiceNumber:{ //numero del PO que es invoice nmber en la orden de compra
      type: Sequelize.INTEGER
    },
    Recibida:{
      type: Sequelize.BOOLEAN
    },
    Pagada:{
      type: Sequelize.BOOLEAN
    },
    State:{
      type: Sequelize.STRING
    },
    InvoiceComments:{
      type: Sequelize.STRING
    
    }
	},{ //colocamos este parametro para que SEQUELIZE nos deje colocar el nombre del modelo y NO lo coloque plural
        freezeTableName: true,
        timestamps: false,
	  });
	
	return purchaseInvoice;
    }