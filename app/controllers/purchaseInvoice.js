const db = require('../config/db.config.js');;

const PurchaseInvoice=db.PurchaseInvoice;
const PurchaseOrder = db.PurchaseOrder;
const PurchaseDetails= db.PurchaseDetails;
const Supplier = db.Supplier;


function getSuppliersInvoices(req, res){
    let userId = req.params.id; 
    let companyId = req.params.company;
    let antCod=0;
    
    try{
        PurchaseInvoice.findAll({    
             include: [
            {
                model: PurchaseOrder,
                attributes: ['ID_Supplier'],
                include: [{
                    model: Supplier,
                    attributes: ['ID_Supplier','Name'],
                    where: {ID_Company:companyId},
                }]
                 
             }
            ],
            where: {ID_User:userId},
           
          })
        .then(invoices => {
            res.status(200).send({invoices});
            
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

module.exports={
    getSuppliersInvoices
}