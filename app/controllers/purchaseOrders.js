const db = require('../config/db.config.js');
const { Op } = require("sequelize");
const sequelize = require('sequelize');
const { PurchaseInvoice, PurchaseInvoiceDetails } = require('../config/db.config.js');
const moment=require("moment");
const PurchaseOrder = require("../models/purchaseOrder.model");
const PurchaseOrderDetail = require("../models/purchaseDetail.model");
const Inventory = require("../models/inventory.model");
const Product=require("../models/product.model");
const Measure = require("../models/measure.model");
const Brand = require('../models/brand.model');
const Supplier = require ('../models/supplier.model')

function getPurchaseOrders(req, res){
    const { id,company,profile } = req.params;
    //la validacion de perfil se realiza para determinar si el usuario logueado es admin y si es asi podra ver toda la informacion
    //generada  por los demás usuarios
   if(profile==="Admin"){
    PurchaseOrder.find().populate({path: 'Supplier', model: 'Supplier', match:{Company: company}}).sort({CodPurchase:-1})
    .then(ordenes => {
        if(!ordenes){
            res.status(404).send({message:"No hay "});
        }else{
            var order = ordenes.filter(function (item) {
                return item.Supplier!==null;
              });
           
            res.status(200).send({order})
        }
    });
   }else{
    PurchaseOrder.find({User:id}).populate({path: 'Supplier', model: 'Supplier', match:{Company: company}}).sort({CodPurchase:-1})
    .then(ordenes => {
        if(!ordenes){
            res.status(404).send({message:"No hay "});
        }else{
            
            var order = ordenes.filter(function (item) {
                return item.Supplier!==null;
              });
           
            res.status(200).send({order})
        }
    });
   }
    
}

async function createPurchaseOrder(req,res){
    
    const orden= new PurchaseOrder();  

    let now= new Date();
    let creacion=now.toISOString().substring(0, 10);

    const {Supplier,InvoiceNumber,Image,Total,User,Inventory,DeliverDate,
    Description,companyId,SupplierName} = req.body;

    const purchaseDetalle=req.body.details; //obtiene el detalle de los productos (arreglo generado en el frontend)
    const detalle=[];
    console.log(Supplier);
    let codigo=0;

    let codigoPurchase=await PurchaseOrder.findOne({Company: companyId}).sort({CodPurchase:-1})   //de esta manera ggenero los numeros correlativos por empresa (1,2,3,...)
    .populate({path: 'Supplier', model: 'Supplier', match:{Company: companyId}}).then(function(doc){
            if(doc){
                    if(doc.CodPurchase!==null){
                return(doc.CodPurchase)
            }
        }
       
    });
    
    //utilizado para sumar al codigo obtenido (codigoPurchase)
    if(!codigoPurchase){
        codigo =1;
    }else {codigo=codigoPurchase+1}    

    //creamos el objeto que será insertado
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
            }
            else{
                let idPurchase=ordenStored._id;
             
                if(idPurchase){
                    
                    purchaseDetalle.map(async item => {  //recorremos el arreglo de productos para generar el json u objeto a insetar
                    detalle.push({
                        ProductName:item.Name,
                        PurchaseOrder:idPurchase,
                        Quantity:parseFloat(item.Quantity) ,
                        Discount:parseFloat(item.Discount),
                        Price:parseFloat(item.Price),
                        Inventory :item.Inventory,
                        Measure:item.Measures,
                        CodProduct:item.codproducts,
                        SupplierName:SupplierName
                    })
                 });
                 console.log(detalle);
                    if(detalle.length>0){
                        PurchaseOrderDetail.insertMany(detalle)  //insert many porque al final es un arreglo de varios objetos
                        .then(function () {
                            
                            //acá se podrian agregar otras funciones en caso de ser necesarias
                            
                        })
                        .catch(function (err) {
                            console.log(err);
                        });
                    }
                }
                res.status(200).send({orden: ordenStored})
              
            }
        }
    })
}

function getPurchaseDetails(req, res){
    let purchaseId = req.params.id; 
    PurchaseOrderDetail.find({PurchaseOrder:purchaseId}).populate({path: 'Inventory', model: 'Inventory',
    populate:({path: 'Bodega', model: 'Bodega', match:{Name:'Principal'}}),
    populate:({path: 'Product',model:'Product',populate:{path: 'Measure',model:'Measure'}})})
    .then(order => {
        if(!order){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({order})
        }
    })
    }

async function updatePurchaseOrder(req, res){
    let purchaseId = req.params.id;
    let purchaseDetalle=req.body.details;
    let detailsAnt=req.body.ordenAnt;
    let updatePurchase={};

    updatePurchase.Supplier=req.body.Supplier;
    updatePurchase.DeliverDate=req.body.DeliverDate;
    updatePurchase.Description=req.body.Description;
    updatePurchase.InvoiceNumber=req.body.InvoiceNumber;
    updatePurchase.Total=req.body.Total;
    let detallePrev={};
    let detalle=[];
    PurchaseOrder.findByIdAndUpdate({_id:purchaseId},updatePurchase,(err,purchaseUpdate)=>{
        if(err){
            res.status(500).send({message: "Error del Servidor."});
            console.log(err);
        } else {
            if(!purchaseUpdate){
                console.log(purchaseUpdate);
                res.status(404).send({message: "No se actualizo registro"});
            }else{
                if(detailsAnt.length > 0) {
                     detailsAnt.map(async item => {  
                        detallePrev.ProductName=item.ProductName;
                        detallePrev.PurchaseOrder=purchaseId,
                        detallePrev.Quantity=parseFloat(item.Quantity) ,
                        detallePrev.Discount=parseFloat(item.Discount),
                        detallePrev.Price=parseFloat(item.Price),
                        detallePrev.Inventory =item.Inventory._id,
                       
                        PurchaseOrderDetail.updateMany({_id: item._id ,PurchaseOrder:purchaseId},detallePrev)
                            .then(function () {
                                
                                console.log("Actualizados");
                                
                            })
                            .catch(function (err) {
                                console.log(err);
                            });
                       });
                        console.log(detallePrev);
                       
                }

                if(purchaseDetalle.length>0){
                    purchaseDetalle.map(async item => {
                        detalle.push({
                            ProductName:item.Name,
                            PurchaseOrder:purchaseId,
                            Quantity:parseFloat(item.Quantity) ,
                            Discount:parseFloat(item.Discount),
                            Price:parseFloat(item.Price),
                            Inventory :item.Inventory,
                        })
                     });
                     console.log(detalle);
                        if(detalle.length>0){
                            PurchaseOrderDetail.insertMany(detalle)
                            .then(function () {
                                
                                console.log("INSERTADOS");
                                
                            })
                            .catch(function (err) {
                                console.log(err);
                            });
                        }
                }
                res.status(200).send(purchaseUpdate)
            }
        }
    })
}

async function changePurchaseState(req, res){
    let purchaseId = req.params.id;
    let state=req.body;
    console.log(state);
    //para cambiar a diferentes estados (las validaciones o el estado es enviado desde el frontend)
    PurchaseOrder.findByIdAndUpdate({_id:purchaseId},state,(err,purchaseUpdate)=>{
        if(err){
            res.status(500).send({message: "Error del Servidor."});
            
        } else {
            if(!purchaseUpdate){
                res.status(404).send({message: "No se actualizo registro"});
            }
            else{
                res.status(200).send(purchaseUpdate)
            }
        }
   
    })
}

function getPurchaseOrdersClosed(req, res){
//esta función se utiliza para cargar las ordenes en la parte de creacion de facturas
    const { id,company } = req.params;
   
    PurchaseOrder.find({User:id,State:'Cerrada'}).populate({path: 'Supplier', model: 'Supplier', match:{Company: company}})
    .then(orders => {
        if(!orders){
            res.status(404).send({message:"No hay "});
        }else{
            
            res.status(200).send({orders})
        }
    });
}

function getClosedPurchaseDetails(req, res){
    //función que se utiliza para mostrar los detalles de la orden seleccionada dentro de la factura
    let purchaseId = req.params.id; 
   
    PurchaseOrder.find({_id:purchaseId})
    .populate({path: 'Supplier', model: 'Supplier',populate:({path: 'SupplierType', model:'SupplierType'})})
   
    .then(order => {
        if(!order){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send(order)
        }
    });
}

function exportPruchaseOrder(req, res){
   
    PurchaseOrderDetail.find().populate({path: 'PurchaseOrder', model: 'PurchaseOrder', 
    populate:({path: 'Supplier', model: 'Supplier'})
    })
    .then(order => {
        if(!order){
            res.status(404).send({message:"No hay "});
        }else{                        
            res.status(200).send({order})
            console.log(order);
        }
        })  
}


function getPurchaseBySupplier(req, res){
    //utilizada para mostrar las ordenes de compra generadas por proveedor y ademas con filtro de fechas
    let supplierId = req.params.id; 
    let companyId = req.params.company;
    let f1=new Date(req.params.fecha1);
    let f2=new Date(req.params.fecha2);
    var ObjectID = require('mongodb').ObjectID
    let antCod=0;
    let now= new Date();
    let fecha=now.getTime();
    var date = new Date(fecha);
   
    // date.setMonth(date.getMonth() - 1/2);
    date.setDate(date.getDate() -15); //con esta funció
    let fecha1=now.toISOString().substring(0, 10);
    let fecha2=date.toISOString().substring(0, 10);
    
    try{

        PurchaseOrder.aggregate([
            {  $match: {Supplier:ObjectID(supplierId)}},
        
            {
                $lookup: {
                    from:"purchaseorderdetails",
                   
                    let:{ordenId:"$_id" },
                    pipeline: [
                        { $match:
                            { $expr:
                               
                                    { $eq: [ "$PurchaseOrder",  "$$ordenId" ] }
                                   
                                }
                            }
    
                    ],
                    as:"detalles",
                    
                },
                
                  
                
            }, 
            
        ]).then(result => {
            var order = result.filter(function (item) {
                let fecha=new Date(item.CreationDate);
               
                return fecha>=f2 && fecha<=f1;   //con el filtro valido que las fechas se encuentren en el rango indicado por el usuario
              });
            res.status(200).send(order);
            
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
    getPurchaseOrders,
    createPurchaseOrder,
    getPurchaseDetails,
    updatePurchaseOrder,
    // deletePurchase,
    changePurchaseState,
    // getLastMonthPurchase,
    // getThisMonthPurchase,
    getPurchaseOrdersClosed,
    exportPruchaseOrder,
    getClosedPurchaseDetails,
    // getPurchaseOrdersBySupplier,
    getPurchaseBySupplier
}

