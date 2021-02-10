const db = require('../config/db.config.js');


const PurchaseOrder = db.PurchaseOrder;


function getPurchaseOrders(req, res){
    let companyId = req.params.id; 
    try{
        PurchaseOrder.findAll({    
             include: [
            {
                 model: Product,
                 attributes: ['ID_Products','Name'],
                 where:{ID_Company:companyId}
             }
            ]
          })
        .then(inventories => {
            res.status(200).send({inventories});
            
        })
    }catch(error) {
        // imprimimos a consola
        console.log(error);

        res.status(500).json({
            message: "Error!",
            error: error
        });
    }
}


function createPurchaseOrder(req, res){
    let orden = {};
    let now= new Date();
    let creacion=now.getTime();
    try{
        //asignando valores 
        orden.ID_Supplier=req.body.ID_Supplier;
        orden.InvoiceNumber=req.body.InvoiceNumber;
        orden.Image=req.body.Image;
        orden.Total=req.body.Total;
        orden.Active=req.body.Active;
        orden.ID_User=req.body.ID_User;
        orden.ID_Inventory=req.body.ID_Inventory;
        orden.DeliverDate=req.body.DeliverDate;
        orden.CreationDate= creacion;
        orden.State=req.body.State;  
        // Save to MySQL database
     PurchaseOrder.create(orden)
      .then(result => {    
        res.status(200).json(result);
    
      });  
    }catch(error){
        res.status(500).json({
            message: "Fail!",
            error: error.message
        });
    }
}

module.exports={
    getPurchaseOrders,
    createPurchaseOrder,
}


