const PurchaseOrder = require("../models/purchaseOrder.model");

function getPurchaseOrders(req, res){
    const { id,company } = req.params;
    PurchaseOrder.find({User:id}).populate({path: 'Supplier', model: 'Supplier', match:{Company: company}})
    .then(order => {
        if(!order){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({order})
        }
    });
}

function createPurchaseOrder(req,res){
    
    const order = new PurchaseOrder();
    let now= new Date();
    let creacion=now.getTime();
    const {Supplier,InvoiceNumber,Image,Total,User,Inventory,DeliverDate,
    Description} = req.body;

    orden.Supplier=Supplier;
    orden.InvoiceNumber=InvoiceNumber;
    orden.Image=Image;
    orden.Total=Total;
    orden.Active=true;
    orden.User=User,
    orden.Inventory=Inventory;
    orden.DeliverDate=DeliverDate;
    orden.CreationDate= creacion;
    orden.State='Abierta'; 
    orden.Description=Description; 
    orden.CodPurchase=codigo;
    console.log(orden);
    orden.save((err, ordenStored)=>{
        if(err){
            res.status(500).send({message: err});

        }else {
            if(!ordenStored){
                res.status(500).send({message: "Error al crear el nuevo usuario."});
                console.log(ordenStored);
            }else{
                res.status(200).send({orden: ordenStored})
            }
        }
    })
}


module.exports={
    getPurchaseOrders,
    createPurchaseOrder,
    // getPurchaseDetails,
    // updatePurchaseOrder,
    // deletePurchase,
    // changePurchaseState,
    // getLastMonthPurchase,
    // getThisMonthPurchase,
    // getPurchaseOrdersClosed,
    // getClosedPurchaseDetails,
    // getPurchaseOrdersBySupplier,
    // getInvoicesBySupplier
}

// const db = require('../config/db.config.js');
// const { Op } = require("sequelize");

// const sequelize = require('sequelize');
// const { PurchaseInvoice, PurchaseInvoiceDetails } = require('../config/db.config.js');
// const PurchaseOrder = db.PurchaseOrder;
// const PurchaseDetails= db.PurchaseDetails;
// const Supplier = db.Supplier;
// const Inventory = db.Inventory;
// const Product = db.Product;
// const Measure = db.Measure;
// const User=db.User;

// function getPurchaseOrders(req, res){
//     let userId = req.params.id; 
//     let companyId = req.params.company;
//     let antCod=0;
    
//     try{
//         PurchaseOrder.findAll({    
//              include: [
//             {
//                  model: Supplier,
//                  attributes: ['ID_Supplier','Name'],
//                  where: {ID_Company:companyId},
                 
//              }
//             ],
//             where: {ID_User:userId},
//             attributes: ['ID_PurchaseOrder','ID_Supplier','InvoiceNumber','Image','Total','Active','DeliverDate',
//         'CreationDate','State','Description','codpurchase']
//           })
//         .then(orders => {
//             res.status(200).send({orders});
            
//         })
//     }catch(error) {
//         // imprimimos a consola
//         console.log(error);

//         res.status(500).json({
//             message: "Error!",
//             error: error
//         });
//     }
// }


// async function createPurchaseOrder(req, res){
//     let orden = {};
//     let now= new Date();
//     let creacion=now.getTime();
//     let purchaseDetalle=req.body.details;
//     let companyId = req.params.company;
//     let userId = req.params.id; 
//     let codigo=0;
//     let codigoPurchase=await PurchaseOrder.max('codpurchase',{ 
//         include: [
//             {
//                  model: Supplier,
//                  attributes: ['ID_Supplier','Name'],
//                  where: {ID_Company:companyId},
                 
//              }
//             ],
//             where: {ID_User:userId}, 
        
//     }).then(function(orden) {
        
//        return orden;
//     });
    
//     if(!codigoPurchase){
//         codigo =1;
//     }else {codigo=codigoPurchase+1}
    
    
    
//     try{
//         let details={};
//         //asignando valores 
//         orden.ID_Supplier=req.body.ID_Supplier;
//         orden.InvoiceNumber=req.body.InvoiceNumber;
//         orden.Image="imagen";
//         orden.Total=req.body.Total;
//         orden.Active=true;
//         orden.ID_User=req.body.ID_User;
//         orden.ID_Inventory=req.body.ID_Inventory;
//         orden.DeliverDate=req.body.DeliverDate;
//         orden.CreationDate= creacion;
//         orden.State='Abierta'; 
//         orden.Description=req.body.Description; 
//         orden.codpurchase=codigo;
//         console.log(orden);
//         // Save to MySQL database
//      PurchaseOrder.create(orden)
//       .then(result => {    
//         res.status(200).json(result);
//         let idPurchase=result.ID_PurchaseOrder;
//         if(idPurchase){
//             console.log(idPurchase);
//             for(const item of purchaseDetalle){
//                console.log(item.Name);
//                details.ProductName=item.Name;
//                details.ID_PurchaseOrder=idPurchase;
//                details.Quantity=parseFloat(item.Quantity) ;
//                details.Discount=parseFloat(item.Discount);
//                details.Price=parseFloat(item.Price);
//                details.Measures=item.Measures;
//                details.ExperiationTime=item.ExperiationTime;
//                details.ID_Inventory =item.ID_Inventory;
//                console.log(details);
//                PurchaseDetails.create(details).then(async result=>{
//                    if(!result){res.status(500).send({message:"Error al ingresar el detalle de la orden"});}
//                }).catch(err=>{
//                    console.log(err);
//                 return err.message;
//             });
//             }
//         }
//         else {
//             res.status(500).send({message:"Error al ingresar orden de compra"});
//         }
//       }).catch(err=>{
//         console.log(err);
//      return err.message;
//  });
//     }catch(error){
//         res.status(500).json({
//             message: "Fail!",
//             error: error.message
//         });
//     }
// }

// function getPurchaseDetails(req, res){
//     let purchaseId = req.params.id; 
//     try{
//         Inventory.findAll({
//             attributes: ['ID_Inventory'],
//             where:{
//                 ID_PurchaseOrder: sequelize.where(sequelize.col("ec_purchasedetail.ID_PurchaseOrder"), "=", purchaseId),
//                 ID_Bodega:8
//             },
//             include: [
//                 {
//                     model: PurchaseDetails,
//                     attributes: ['ID_PurchaseDetail','ID_PurchaseOrder','Quantity','Discount','ProductName'],
//                     on:{
                   
//                        ID_Inventory: sequelize.where(sequelize.col("ec_purchasedetail.ID_Inventory"), "=", sequelize.col("ec_inventory.ID_Inventory")),
                    
//                     }
//                 },
//                 {
//                     model: Product,
//                     attributes: ['codproducts','ID_Measure','BuyPrice'],
//                     on:{
//                         ID_Products: sequelize.where(sequelize.col("ec_inventory.ID_Products"), "=", sequelize.col("crm_products.ID_Products")),
//                     },
//                     include: [
//                         {
//                             model:Measure,
//                             attributes: ['Name'],
//                             on: {
//                                ID_Measure: sequelize.where(sequelize.col("crm_products.ID_Measure"), "=", sequelize.col("crm_products->crm_measures.ID_Measure")),
                               
//                            }
//                         }
//                     ],
//                     on:{
//                         ID_Products: sequelize.where(sequelize.col("ec_inventory.ID_Products"), "=", sequelize.col("crm_products.ID_Products")),
//                     }
                    
//                 }
//             ], 
           
//         })
//         .then(details => {
//             res.status(200).json({details});
            
//         })
//     }catch(error) {
//         // imprimimos a consola
//         console.log(error);

//         res.status(500).json({
//             message: "Error!",
//             error: error
//         });
//     }
// }

// async function updatePurchaseOrder(req, res){
   
//     let purchaseId = req.params.id;
    
//     let purchaseDetalle=req.body.details;
//     let detailsAnt=req.body.ordenAnt;
    
//     let orden={};
//     let details={};
//     //asignando valores 
//     const {ID_Supplier,InvoiceNumber,Image,Total,ID_User,DeliverDate,Description,State}= req.body;
//     console.log(purchaseDetalle.length);
  
//     try{
//         let ordenExist = await PurchaseOrder.findByPk(purchaseId,{
//             attributes: ['ID_PurchaseOrder','ID_Supplier','InvoiceNumber','Image','Total','Active','DeliverDate',
//         'CreationDate','State','Description']});
       
//         if(!ordenExist){
//            // retornamos el resultado al cliente
//             res.status(404).json({
//                 message: "No se encuentra el cliente con ID = " + purchaseId,
//                 error: "404"
//             });
//         } else {    
//             // actualizamos nuevo cambio en la base de datos, definición de
//             let updatedObject = {             
//                ID_Supplier:ID_Supplier,
//                InvoiceNumber: InvoiceNumber,
//                Image: Image,
//                Total: Total,
//                ID_User: ID_User,
//                DeliverDate: DeliverDate,
//                Description: Description,
//                State: State,
//             }
                
//             let result = await PurchaseOrder.update(updatedObject,
//                               { 
                                              
//                                 where: {ID_PurchaseOrder : purchaseId},
//                                 attributes: ['ID_PurchaseOrder']
//                               }
//                             );
                            
                            
//             if (result) {
//                 console.log(purchaseDetalle);
//                 if(detailsAnt.length > 0) {
                   
//                     for(const item of detailsAnt ){
//                         let update={
//                            Quantity: item.ec_purchasedetail.Quantity,
//                            Discount:item.ec_purchasedetail.Discount,
//                         }
//                         console.log(update);
//                         let resultUpdateD = await PurchaseDetails.update(update,
//                             { 
//                               returning: true,                
//                               where: {[Op.and]: [
//                                 { ID_PurchaseDetail : item.ec_purchasedetail.ID_PurchaseDetail },
//                                 { ID_PurchaseOrder: item.ec_purchasedetail.ID_PurchaseOrder }
//                               ]},
//                               attributes: ['ID_PurchaseDetail']
//                             }
//                           );
//                     }
//                 }    
//                  if(purchaseDetalle.length>0){  //agregando nuevo detalle a la orden ya existente
                    
//                     for(const item of purchaseDetalle ){
//                         let detalleNuevo={
//                            Quantity: item.Quantity,
//                            ID_PurchaseOrder:purchaseId,
//                            Discount:item.Discount,
//                            Price: item.Price,
//                            ProductName: item.Name,
//                            Measures: item.Measures,
//                            ExperiationTime: item.ExperiationTime,
//                            ID_Inventory: item.ID_Inventory,
//                         }
//                         console.log(detalleNuevo);
//                         PurchaseDetails.create(detalleNuevo).then(async result=>{
//                             console.log(result);
//                             if(!result){res.status(500).send({message:"Error al ingresar el detalle de la orden"});}
//                         }).catch(err=>{
//                             console.log(err);
//                          return err.message;
//                      });
//                     }
//                 }
            
//             }

//             // retornamos el resultado al cliente
//             if(!result) {
//                 res.status(500).json({
//                     message: "Error -> No se puede actualizar el cliente con ID = " + req.params.id,
//                     error: "No se puede actualizar",
//                 });
//             }

//             res.status(200).json(result);
//         }
//     } catch(error){
//         res.status(500).json({
//             message: "Error -> No se puede actualizar el cliente con ID = " + req.params.id,
//             error: error.message
//         });
//     }
// }

// async function deletePurchase(req, res){
//     try{
//         let purchaseId = req.params.id;
//         let purchase = await PurchaseOrder.findByPk(purchaseId,{ attributes: ['ID_PurchaseOrder','ID_Supplier','InvoiceNumber','Image','Total','Active','DeliverDate',
//         'CreationDate','State','Description']});
       
      
//         if(!purchase){
//             res.status(404).json({
//                 message: "Los detalles de la orden no existen  = " + purchaseId,
//                 error: "404",
//             });
//         } else {
//             await purchase.destroy();
//             res.status(200).send({
//                 message:"Cliente eliminado con exito"
//             });
//         }
//     } catch(error) {
//         res.status(500).json({
//             message: "Error -> No se puede eliminar el cliente con el ID = " + req.params.id,
//             error: error.message
//         });
//     }
// }


// async function changePurchaseState(req, res){
   
//     let purchaseId = req.params.id; 
//     console.log(purchaseId);
//     const {estado} = req.body;  //
  
//     try{
//         let purchase = await PurchaseOrder.findByPk(purchaseId,{
//             attributes: ['ID_PurchaseOrder','ID_Supplier','InvoiceNumber','Image','Total','Active','DeliverDate',
//         'CreationDate','State','Description']});
//         console.log(purchase.State);
//         if(!purchase){
//            // retornamos el resultado al cliente
//             res.status(404).json({
//                 message: "No se encuentra el cliente con ID = " + purchaseId,
//                 error: "404"
//             });
//         } else {    
            
//             // actualizamos nuevo cambio en la base de datos, definición de
//             let updatedObject = { 
               
//                 State:estado          
//             }
//             console.log(updatedObject);    //agregar proceso de encriptacion
//             let result = await purchase.update(updatedObject,
//                               { 
//                                 returning: true,                
//                                 where: {ID_PurchaseOrder : purchaseId},
//                                 attributes:['Description' ]
//                               }
//                             );

//             // retornamos el resultado al cliente
//             if(!result) {
//                 res.status(500).json({
//                     message: "Error -> No se puede actualizar el usuario con ID = " + req.params.id,
//                     error: "No se puede actualizar",
//                 });
//             }

//             res.status(200).json(result);
//         }
//     } catch(error){
//         res.status(500).json({
//             message: "Error -> No se puede actualizar el usuario con ID = " + req.params.id,
//             error: error.message
//         });
//     }
// }


// function getLastMonthPurchase(req,res){
   

//     let userId = req.params.id; 
    
//     try{

//         let now= new Date();
//         let fecha=now.getTime();
//         var date = new Date(fecha);
     
//         date.setMonth(date.getMonth() - 1);
//         let compare=date.toISOString().substring(0, 7);
//         console.log(date.toISOString().substring(0, 7)); 
//         let purchase=null;
//         purchase= PurchaseOrder.findAll({    
             
//             where: {ID_User:userId},
//             attributes: ['ID_PurchaseOrder',
//             [sequelize.fn('sum', sequelize.col('Total')), 'total_amount']],
//             where: {
//                 CreationDate: {[Op.substring]: compare}
//             }
//           })
//         .then(total => {
//             res.status(200).send({total});
            
//         });
//         console.log(purchase);
//     }
//     catch(error) {
//         // imprimimos a consola
//         console.log(error);

//         res.status(500).json({
//             message: "Error!",
//             error: error
//         });
//     }

// }

// function getThisMonthPurchase(req,res){
   

//     let userId = req.params.id; 
    
//     try{

//         let now= new Date();
//         let fecha=now.getTime();
//         var date = new Date(fecha);
//         let compare=date.toISOString().substring(0, 7);
//         console.log(date.toISOString().substring(0, 7)); 
//         let purchase=null;
//         purchase= PurchaseOrder.findAll({    
             
//             where: {ID_User:userId},
//             attributes: ['ID_PurchaseOrder',
//             [sequelize.fn('sum', sequelize.col('Total')), 'total_amount']],
//             where: {
//                 CreationDate: {[Op.substring]: compare}
//             }
//           })
//         .then(total => {
//             res.status(200).send({total});
            
//         });
//         console.log(purchase);
//     }
//     catch(error) {
//         // imprimimos a consola
//         console.log(error);

//         res.status(500).json({
//             message: "Error!",
//             error: error
//         });
//     }

// }

// function getPurchaseOrdersClosed(req, res){
//     let userId = req.params.id; 
//     let companyId = req.params.company;
//     let antCod=0;
    
//     try{
//         PurchaseOrder.findAll({    
//              include: [
//             {
//                  model: Supplier,
//                  attributes: ['ID_Supplier','Name'],
//                  where: {ID_Company:companyId},
                 
//              }
//             ],
//             where: {
//                 ID_User:userId,
//                 State:"Cerrada"
//             },
//             attributes: ['ID_PurchaseOrder','ID_Supplier','InvoiceNumber','Image','Total','Active','DeliverDate',
//         'CreationDate','State','Description','codpurchase']
//           })
//         .then(orders => {
//             res.status(200).send({orders});
            
//         })
//     }catch(error) {
//         // imprimimos a consola
//         console.log(error);

//         res.status(500).json({
//             message: "Error!",
//             error: error
//         });
//     }
// }

// function getClosedPurchaseDetails(req, res){
    
//     let id=req.params.id;
//     let antCod=0;
    
//     try{
//         PurchaseOrder.findAll({    
//              include: [
//              {
//                  model: Supplier,
//                  attributes: ['ID_Supplier','Name','deliveryDays'],
                 
                 
//              },
//              { 
//                 model: PurchaseDetails,
               
//              }
//             ],
//             where: {
//             ID_PurchaseOrder:id},
//             attributes: ['ID_PurchaseOrder','ID_Supplier','InvoiceNumber','Image','Total','Active','DeliverDate',
//              'CreationDate','State','Description','codpurchase']
//           })
//         .then(orders => {
//             res.status(200).send({orders});
            
//         })
//     }catch(error) {
//         // imprimimos a consola
//         console.log(error);

//         res.status(500).json({
//             message: "Error!",
//             error: error
//         });
//     }
// }


// function getPurchaseOrdersBySupplier(req, res){
//     let supplierId = req.params.id; 
//     let companyId = req.params.company;
//     let f1=new Date(req.params.fecha1);
//     let f2=new Date(req.params.fecha2);
//     let antCod=0;
//     let now= new Date();
//     let fecha=now.getTime();
//     var date = new Date(fecha);
//     console.log(f1);
//     // date.setMonth(date.getMonth() - 1/2);
//     date.setDate(date.getDate() -15);
//     let fecha1=now.toISOString().substring(0, 10);
//     let fecha2=date.toISOString().substring(0, 10);
//     console.log(); 
//     console.log(date.toISOString().substring(0, 10)); 
//     try{
//         PurchaseOrder.findAll({    
//             where: {ID_Supplier:supplierId,
//                 CreationDate:{
//                     [Op.lte]: !f1?fecha1:f1,
//                     [Op.gte]: !f2?fecha2:f2,
//                 }
//             },
//             attributes: ['ID_PurchaseOrder','ID_Supplier','InvoiceNumber','Image','Total','Active','DeliverDate',
//         'CreationDate','State','Description','codpurchase'],
           
//              include: [
//             {
//                  model: PurchaseDetails,
//                  on:{
                   
//                     ID_PurchaseOrder: sequelize.where(sequelize.col("ec_purchasedetails.ID_PurchaseOrder"), "=", sequelize.col("ec_purchaseorder.ID_PurchaseOrder")),
                 
//                  },
//                  attributes: ['ID_PurchaseDetail','Quantity','Discount','ProductName','Price'],
                 
//              }
//             ],
           
//           })
//         .then(orders => {
//             res.status(200).send(orders);
            
//         })
//     }catch(error) {
//         // imprimimos a consola
//         console.log(error);

//         res.status(500).json({
//             message: "Error!",
//             error: error
//         });
//     }
// }

// function getInvoicesBySupplier(req, res){
//     let supplierId = req.params.id; 
//     let companyId = req.params.company;
//     let f1=new Date(req.params.fecha1);
//     let f2=new Date(req.params.fecha2);
//     let antCod=0;
//     let now= new Date();
//     let fecha=now.getTime();
//     var date = new Date(fecha);
//     console.log(f1);
//     // date.setMonth(date.getMonth() - 1/2);
//     date.setDate(date.getDate() -15);
//     let fecha1=now.toISOString().substring(0, 10);
//     let fecha2=date.toISOString().substring(0, 10);
//     console.log(); 
//     console.log(date.toISOString().substring(0, 10)); 
//     try{
//         PurchaseInvoice.findAll({    
//             where: {ID_Supplier:supplierId,
//                 CreationDate:{
//                     [Op.lte]: !f1?fecha1:f1,
//                     [Op.gte]: !f2?fecha2:f2,
//                 }
//             },
           
//              include: [
//             {
//                  model: PurchaseInvoiceDetails,
//                  on:{
                   
//                     ID_PurchaseInvoice: sequelize.where(sequelize.col("ec_purchaseinvoicedetails.ID_PurchaseInvoice"), "=", sequelize.col("ec_purchaseinvoice.ID_PurchaseInvoice")),
                   
//                  }
                 
//              }
//             ],
           
           
//           })
//         .then(orders => {
//             res.status(200).send(orders);
            
//         })
//     }catch(error) {
//         // imprimimos a consola
//         console.log(error);

//         res.status(500).json({
//             message: "Error!",
//             error: error
//         });
//     }
// }


// module.exports={
//     getPurchaseOrders,
//     createPurchaseOrder,
//     getPurchaseDetails,
//     updatePurchaseOrder,
//     deletePurchase,
//     changePurchaseState,
//     getLastMonthPurchase,
//     getThisMonthPurchase,
//     getPurchaseOrdersClosed,
//     getClosedPurchaseDetails,
//     getPurchaseOrdersBySupplier,
//     getInvoicesBySupplier
// }


