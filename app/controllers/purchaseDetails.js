const db = require('../config/db.config.js');


const PurchaseDetails = db.PurchaseDetails;


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

    try{
        let detailId = req.params.id;
        let detalle= await PurchaseDetails.findByPk(detailId);
        console.log(detalle);
        if(!detalle){
            res.status(404).json({
                message: "La compañia con este ID no existe = " + detailId,
                error: "404",
            });
        } else {
            await detalle.destroy();
            res.status(200).send({
                message:"Compañia eliminada con exito"
            });
        }
    } catch(error) {
        res.status(500).json({
            message: "Error -> No se puede eliminar el detalle de la orden con el ID = " + req.params.id,
            error: error.message
        });
    }
}

module.exports={
    getPurchaseDetails,
    createPurchaseOrder,
    deletePurchaseDetail
}


