const PurchaseDetail= require('../models/purchaseDetail.model');


function getPurchaseDetails(req, res){
    let purchaseId = req.params.id; 
    try{
        PurchaseDetails.findAll({where: {ID_PurchaseOrder : purchaseId}})
        .then(details => {
            res.status(200).send({details});
            
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
    let ordenDetails = {};
    let now= new Date();
    let creacion=now.getTime();
    try{
        //asignando valores 
        ordenDetails.ID_PurchaseOrder=req.body.ID_PurchaseOrder;
        ordenDetails.Quantity=req.body.Quantity;
        ordenDetails.Discount=req.body.Discount;
        ordenDetails.Price=req.body.Price;
        ordenDetails.ProductName=req.body.ProductName;
        ordenDetails.Measures=req.body.Measures;
        ordenDetails.ExperiationTime=req.body.ExperiationTime;
        // Save to MySQL database
        PurchaseDetails.create(ordenDetails)
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


async function deletePurchaseDetail(req, res){
    console.log(req.params.id);
    let detalleid=req.params.id;
    PurchaseDetail.findByIdAndRemove(detalleid, (err, userDeleted) => {
        if (err) {
          res.status(500).send({ message: "Error del servidor." });
        } else {
          if (!userDeleted) {
            res.status(404).send({ message: "Detalle no encontrado" });
          } else {
            res
              .status(200)
              .send({ userDeleted});
          }
        }
      });

}

module.exports={
    getPurchaseDetails,
    createPurchaseOrder,
    deletePurchaseDetail
}


