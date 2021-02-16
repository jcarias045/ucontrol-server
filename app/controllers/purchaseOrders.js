const db = require('../config/db.config.js');
const { Op } = require("sequelize");
const Sequelize = require('sequelize');

const PurchaseOrder = db.PurchaseOrder;
const PurchaseDetails= db.PurchaseDetails;
const Supplier = db.Supplier;
const User=db.User;

function getPurchaseOrders(req, res){
    let userId = req.params.id; 
    let companyId = req.params.company;
    let antCod=0;
    
    try{
        PurchaseOrder.findAll({    
             include: [
            {
                 model: Supplier,
                 attributes: ['ID_Supplier','Name'],
                 where: {ID_Company:companyId},
                 
             }
            ],
            where: {ID_User:userId},
            attributes: ['ID_PurchaseOrder','ID_Supplier','InvoiceNumber','Image','Total','Active','DeliverDate',
        'CreationDate','State','Description']
          })
        .then(orders => {
            res.status(200).send({orders});
            
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


async function createPurchaseOrder(req, res){
    let orden = {};
    let now= new Date();
    let creacion=now.getTime();
    let purchaseDetalle=req.body.details;
    let companyId = req.params.company;
    let userId = req.params.id; 
    let codigo=0;
    let codigoPurchase=await PurchaseOrder.max('codpurchase',{ 
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
        //asignando valores 
        orden.ID_Supplier=req.body.ID_Supplier;
        orden.InvoiceNumber=req.body.InvoiceNumber;
        orden.Image="imagen";
        orden.Total=req.body.Total;
        orden.Active=true;
        orden.ID_User=req.body.ID_User;
        orden.ID_Inventory=req.body.ID_Inventory;
        orden.DeliverDate=req.body.DeliverDate;
        orden.CreationDate= creacion;
        orden.State='Pendiente'; 
        orden.Description=req.body.Description; 
        orden.codpurchase=codigo;
        
        // Save to MySQL database
     PurchaseOrder.create(orden)
      .then(result => {    
        res.status(200).json(result);
        let idPurchase=result.ID_PurchaseOrder;
        if(idPurchase){
            console.log(idPurchase);
            for(const item of purchaseDetalle){
               console.log(item.Name);
               details.ProductName=item.Name;
               details.ID_PurchaseOrder=idPurchase;
               details.Quantity=parseFloat(item.Quantity) ;
               details.Discount=parseFloat(item.Discount);
               details.Price=parseFloat(item.Price);
               details.Measures=item.Measures;
               details.ExperiationTime=item.ExperiationTime;
               details.ID_Inventory =item.ID_Inventory;
               console.log(details);
               PurchaseDetails.create(details).then(async result=>{
                   if(!result){res.status(500).send({message:"Error al ingresar el detalle de la orden"});}
               }).catch(err=>{
                   console.log(err);
                return err.message;
            });
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

function getPurchaseDetails(req, res){
    let purchaseId = req.params.id; 
    try{
        PurchaseDetails.findAll({
            where: {ID_PurchaseOrder : purchaseId}
        })
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

async function updatePurchaseOrder(req, res){
   
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
                    console.log("HHOLAAAA");
                    for(const item of detailsAnt ){
                        let update={
                           Quantity: item.Quantity,
                           Discount:item.Discount,
                           Price: item.Price,
                           ProductName: item.ProductName,
                           Measures: item.Measures,
                           ExperiationTime: item.ExperiationTime,
                           ID_Inventory: item.ID_Inventory,
                        }
                        console.log(update);
                        let resultUpdateD = await PurchaseDetails.update(update,
                            { 
                              returning: true,                
                              where: {[Op.and]: [
                                { ID_PurchaseDetail : item.ID_PurchaseDetail },
                                { ID_PurchaseOrder: item.ID_PurchaseOrder }
                              ]},
                              attributes: ['ID_PurchaseDetail']
                            }
                          );
                    }
                }    
                 if(purchaseDetalle.length>0){  //agregando nuevo detalle a la orden ya existente
                    console.log("HOLAAAAAAAAAA");
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

async function deletePurchase(req, res){
    try{
        let purchaseId = req.params.id;
        let purchase = await PurchaseOrder.findByPk(purchaseId,{ attributes: ['ID_PurchaseOrder','ID_Supplier','InvoiceNumber','Image','Total','Active','DeliverDate',
        'CreationDate','State','Description']});
       
      
        if(!purchase){
            res.status(404).json({
                message: "Los detalles de la orden no existen  = " + purchaseId,
                error: "404",
            });
        } else {
            await purchase.destroy();
            res.status(200).send({
                message:"Cliente eliminado con exito"
            });
        }
    } catch(error) {
        res.status(500).json({
            message: "Error -> No se puede eliminar el cliente con el ID = " + req.params.id,
            error: error.message
        });
    }
}


module.exports={
    getPurchaseOrders,
    createPurchaseOrder,
    getPurchaseDetails,
    updatePurchaseOrder,
    deletePurchase
}


