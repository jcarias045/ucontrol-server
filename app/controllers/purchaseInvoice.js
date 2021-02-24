const db = require('../config/db.config.js');;
const sequelize = require('sequelize');

const PurchaseInvoice=db.PurchaseInvoice;
const PurchaseOrder = db.PurchaseOrder;
const PurchaseDetails= db.PurchaseDetails;
const Supplier = db.Supplier;
const PurchaseInvoiceDetails = db.PurchaseInvoiceDetails;


function getSuppliersInvoices(req, res){
    let userId = req.params.id; 
    let companyId = req.params.company;
    let antCod=0;
    
    try{
        PurchaseInvoice.findAll({    
             include: [
            {
                    model: Supplier,
                    attributes: ['ID_Supplier','Name'],
                    where: {ID_Company:companyId},
                    on:{
                   
                        ID_Supplier: sequelize.where(sequelize.col("ec_purchaseinvoice.ID_Supplier"), "=", sequelize.col("crm_suppliers.ID_Supplier")),
                     
                     }
                }]
                 
            ,
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
async function createSupplierInvoice(req, res){
    let orden = {};
    let now= new Date();
    let creacion=now.getTime();
    let purchaseDetalle=req.body.details;
    let dePurchaseOrder=req.body.ordenAnt;
    let companyId = req.params.company;
    let userId = req.params.id; 
    let codigo=0;
    let codigoPurchase=await PurchaseInvoice.max('codInvoice',{ 
        include: [
            {
                 model: Supplier,
                 attributes: ['ID_Supplier','Name'],
                 where: {ID_Company:companyId},
                 
             }
            ],
            where: {ID_User:userId}, 
        
    }).then(function(orden) {
        
       return orden;
    });
    
    if(!codigoPurchase){
        codigo =1;
    }else {codigo=codigoPurchase+1}
    
    
    
    try{
        let details={};
        let deOrden={};
        //asignando valores 
        orden.ID_PurchaseOrder=req.body.PurchaseOrder;
        orden.InvoiceDate=req.body.InvoiceDate;
        orden.ID_Supplier=req.body.ID_Supplier;
        orden.InvoiceNumber=req.body.InvoiceNumber;
        orden.CreationDate= creacion;
        orden.Total=req.body.Total;
        orden.ID_User=req.body.ID_User;
        orden.DeliverDay=req.body.DeliverDay;
        orden.State='Creada'; 
        orden.PurchaseNumber=req.body.PurchaseNumber;
        orden.Comments=req.body.Description; 
        orden.InvoiceComments	=req.body.InvoiceComments;
        orden.Pagada=false;
        orden.Recibida=false;
        orden.codInvoice=codigo;
        console.log(orden);
        // Save to MySQL database
    PurchaseInvoice.create(orden)
      .then(result => {    
        res.status(200).json(result);
        let idPurchase=result.ID_PurchaseInvoice;
        console.log(idPurchase);
        if(idPurchase){
            if(purchaseDetalle.length > 0){
                console.log('LESLIEEEEEEEEE');
                for(const item of purchaseDetalle){
                    console.log(item.Name);
                    details.ProductName=item.Name;
                    details.ID_PurchaseInvoice=idPurchase;
                    details.Quantity=parseFloat(item.Quantity) ;
                    details.Discount=parseFloat(item.Discount);
                    details.Price=parseFloat(item.Price);
                    details.ID_Inventory =item.ID_Inventory;
                    details.SubTotal=parseFloat((item.Quantity*item.Price)-(item.Quantity*item.Price)*item.Discount)
                    console.log(details);
                    PurchaseInvoiceDetails.create(details).then(async result=>{
                        if(!result){res.status(500).send({message:"Error al ingresar el detalle de la orden"});}
                    }).catch(err=>{
                        console.log(err);
                     return err.message;
                 });
                 }
            }
            if(dePurchaseOrder.length > 0){
                console.log('MARIAAAAAAAAAAA');
                 console.log(idPurchase);
                for(const item of dePurchaseOrder){
                deOrden.ProductName=item.ec_purchasedetail.ProductName;
                deOrden.ID_PurchaseInvoice =idPurchase;
                deOrden.Quantity=parseFloat(item.ec_purchasedetail.Quantity) ;
                deOrden.Discount=parseFloat(item.ec_purchasedetail.Discount);
                deOrden.Price=parseFloat(item.crm_product.BuyPrice);
                deOrden.ID_Inventory =item.ID_Inventory;
                deOrden.SubTotal=parseFloat((item.ec_purchasedetail.Quantity*item.crm_product.BuyPrice)-(item.ec_purchasedetail.Quantity*item.crm_product.BuyPrice)*item.ec_purchasedetail.Discount);
                PurchaseInvoiceDetails.create(deOrden).then(async result=>{
                    if(!result){res.status(500).send({message:"Error al ingresar el detalle de la orden"});}
                    }).catch(err=>{
                        console.log(err);
                    return err.message;
                    });
                }

               
            }
           
        }
        else {
            res.status(500).send({message:"Error al ingresar orden de compra"});
        }
      }).catch(err=>{
        console.log(err);p
     return err.message;
 });
    }catch(error){
        res.status(500).json({
            message: "Fail!",
            error: error.message
        });
    }
}

async function createNewSupplierInvoice(req, res){
    let orden = {};
    let now= new Date();
    let creacion=now.getTime();
    let purchaseDetalle=req.body.details;
    
    let companyId = req.params.company;
    let userId = req.params.id; 
    let codigo=0;
    let codigoPurchase=await PurchaseInvoice.max('codInvoice',{ 
        include: [
            {
                model: PurchaseOrder,
                include: [
                    {
                        model:Supplier,
                        attributes: ['ID_Supplier','Name'],
                        where: {ID_Company:companyId},
                    }
                ]
                 
             }
            ],
            where: {ID_User:userId}, 
        
    }).then(function(orden) {
        
       return orden;
    });
    
    if(!codigoPurchase){
        codigo =1;
    }else {codigo=codigoPurchase+1}
    
    
    
    try{
        let details={};
        let deOrden={};
        //asignando valores 
        orden.InvoiceDate=req.body.InvoiceDate;
        orden.ID_Supplier=req.body.ID_Supplier;
        orden.InvoiceNumber=req.body.InvoiceNumber;
        orden.CreationDate= creacion;
        orden.Total=req.body.Total;
        orden.ID_User=req.body.ID_User;
        orden.DeliverDay=req.body.DeliverDay;
        orden.State='Creada'; 
        orden.InvoiceComments	=req.body.InvoiceComments;
        orden.Pagada=false;
        orden.Recibida=false;
        orden.codInvoice=codigo;
        console.log(orden);
        // Save to MySQL database
    PurchaseInvoice.create(orden)
      .then(result => {    
        res.status(200).json(result);
        let idPurchase=result.ID_PurchaseInvoice;
        console.log(idPurchase);
        if(idPurchase){
            if(purchaseDetalle.length > 0){
                console.log('LESLIEEEEEEEEE');
                for(const item of purchaseDetalle){
                    console.log(item.Name);
                    details.ProductName=item.Name;
                    details.ID_PurchaseInvoice=idPurchase;
                    details.Quantity=parseFloat(item.Quantity) ;
                    details.Discount=parseFloat(item.Discount);
                    details.Price=parseFloat(item.Price);
                    details.ID_Inventory =item.ID_Inventory;
                    details.SubTotal=parseFloat((item.Quantity*item.Price)-(item.Quantity*item.Price)*item.Discount)
                    console.log(details);
                    PurchaseInvoiceDetails.create(details).then(async result=>{
                        if(!result){res.status(500).send({message:"Error al ingresar el detalle de la orden"});}
                    }).catch(err=>{
                        console.log(err);
                     return err.message;
                 });
                 }
            }
         
           
        }
        else {
            res.status(500).send({message:"Error al ingresar orden de compra"});
        }
      }).catch(err=>{
        console.log(err);
     return err.message;
 });
    }catch(error){
        res.status(500).json({
            message: "Fail!",
            error: error.message
        });
    }
}

async function updateInvoicePurchase(req, res){
   
    let purchaseId = req.params.id;
    
    let purchaseDetalle=req.body.details;
    let detailsAnt=req.body.ordenAnt;
    let orden={};
    let details={};
    //asignando valores 
    const {ID_Supplier,InvoiceNumber,Image,Total,ID_User,DeliverDate,Description,State}= req.body;
    console.log(purchaseDetalle.length);
  
    try{
        let ordenExist = await PurchaseOrder.findByPk(purchaseId,{
            attributes: ['ID_PurchaseOrder','ID_Supplier','InvoiceNumber','Image','Total','Active','DeliverDate',
        'CreationDate','State','Description']});
       
        if(!ordenExist){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el cliente con ID = " + purchaseId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = {             
               ID_Supplier:ID_Supplier,
               InvoiceNumber: InvoiceNumber,
               Image: Image,
               Total: Total,
               ID_User: ID_User,
               DeliverDate: DeliverDate,
               Description: Description,
               State: State,
            }
                
            let result = await PurchaseOrder.update(updatedObject,
                              { 
                                              
                                where: {ID_PurchaseOrder : purchaseId},
                                attributes: ['ID_PurchaseOrder']
                              }
                            );
                            
                            
            if (result) {
                console.log(purchaseDetalle);
                if(detailsAnt.length > 0) {
                   
                    for(const item of detailsAnt ){
                        let update={
                           Quantity: item.ec_purchasedetail.Quantity,
                           Discount:item.ec_purchasedetail.Discount,
                        }
                        console.log(update);
                        let resultUpdateD = await PurchaseDetails.update(update,
                            { 
                              returning: true,                
                              where: {[Op.and]: [
                                { ID_PurchaseDetail : item.ec_purchasedetail.ID_PurchaseDetail },
                                { ID_PurchaseOrder: item.ec_purchasedetail.ID_PurchaseOrder }
                              ]},
                              attributes: ['ID_PurchaseDetail']
                            }
                          );
                    }
                }    
                 if(purchaseDetalle.length>0){  //agregando nuevo detalle a la orden ya existente
                    
                    for(const item of purchaseDetalle ){
                        let detalleNuevo={
                           Quantity: item.Quantity,
                           ID_PurchaseOrder:purchaseId,
                           Discount:item.Discount,
                           Price: item.Price,
                           ProductName: item.Name,
                           Measures: item.Measures,
                           ExperiationTime: item.ExperiationTime,
                           ID_Inventory: item.ID_Inventory,
                        }
                        console.log(detalleNuevo);
                        PurchaseDetails.create(detalleNuevo).then(async result=>{
                            console.log(result);
                            if(!result){res.status(500).send({message:"Error al ingresar el detalle de la orden"});}
                        }).catch(err=>{
                            console.log(err);
                         return err.message;
                     });
                    }
                }
            
            }

            // retornamos el resultado al cliente
            if(!result) {
                res.status(500).json({
                    message: "Error -> No se puede actualizar el cliente con ID = " + req.params.id,
                    error: "No se puede actualizar",
                });
            }

            res.status(200).json(result);
        }
    } catch(error){
        res.status(500).json({
            message: "Error -> No se puede actualizar el cliente con ID = " + req.params.id,
            error: error.message
        });
    }
}

module.exports={
    getSuppliersInvoices,
    createSupplierInvoice,
    createNewSupplierInvoice,
    updateInvoicePurchase
}