const productEntry = require("../models/productEntries.model");
const productEntryDetails = require("../models/invoiceEntriesDetails.model");
const inventory = require("../models/inventory.model");
const purchaseInvoiceDetails= require("../models/purchaseInvoiceDetails.model");
const purchaseInvoice= require("../models/purchaseInvoice.model");
const supplier = require("../models/supplier.model");
const company = require("../models/company.model");
const product = require("../models/product.model");


function getEntries(req, res){
   const { id } = req.params;
//    productEntry.find({User:id}).populate({path: 'Company', model: 'Company'}).populate('members')
    productEntry.aggregate([
        {
            $lookup: {
                from:"entrydetails",
                localField:"_id",
                foreignField:"ProductEntry",
                // let:{idiv:"Inventory" },
                // pipeline:[
                //     // { "$match": { "$expr": { "$eq": ["$_id", "$$idiv"] }}},,
                //     {
                //         $lookup: {
                //             from:"inventories",
                //             as:"children"
                //         }
                //     }
                // ],
                as:"detalles",
                
            }
        }, 
       

    ])
    // productEntry.aggregate([
    //     { $lookup: {
    //       from: "entrydetails",
    //       let: { "companyId": "$PurchaseInvoiceDetail" },
    //       pipeline: [
           
    //         { $lookup: {
    //           from: "purchaseinvoicedetails",
    //         //   let: { "industry_id": "$_id" },
    //         // localField:"_id",
    //         // foreignField:"Product",
    //           pipeline: [
    //             { $match: { $expr: { $eq: [ "$_id", "$$companyId" ] } } },
    //             { 
    //                 $lookup: {
    //                     from: "purchaseinvoices",
    //                     let: { "idsup":"$Supplier"},
    //                     pipeline: [
    //                     { $match: { $expr: { $eq: [ "$_id", "$$idsup" ] } } },

    //                         {
    //                             $lookup: {
    //                                 from: "suppliers",
    //                                 localField:"_id",
    //                                 foreignField:"Supplier",
    //                                 // pipeline: [
    //                                 //     {
    //                                 //         from: "suppliertypes",
    //                                 //           localField:"_id",
    //                                 //          foreignField:"SupplierType",
    //                                 //          as: "tipo"
    //                                 //     }
    //                                 // ],
    //                                 as:"supplier"
    //                             }
    //                         }
    //                     ],
    //                     as:"purchase"
    //                 }
    //             }
    //           ],
    //           as: "purchasedetail"
    //         }},
           
    //       ],
    //       as: "entryDetail"
    //     }},
      
    //   ])
    // .exec(function(err, entries) {
    //     if(!entries){
    //         res.status(404).send({message:"No hay d"});
    //     }else{
            
    //         res.status(200).send({entries})
    //     }
    // });
    .then(entries =>{
        res.status(200).send({entries})
    })
}

async function createProductEntry(req, res){
    const entryData=new productEntry();
    const entryDataDetail=[];
    let companyId = req.params.company;
    let detalles=req.body.entries;
    let inventaryUpdate={};

    const {Company,User,PurchaseInvoiceId,Comments,EntryDate,SupplierId,SupplierName} = req.body;
      //para generar el correctivo del ingreso en caso de que sea requerido
      let codEntry=await productEntry.findOne({Company:Company}).sort({CodEntry:-1})
      .then(function(doc){
              if(doc){
                      if(doc.CodEntry!==null){
                  return(doc.CodEntry)
              }
          }  
      });

      if(!codEntry){
        codigoEntradas =1;
    }else {codigoEntradas=codEntry+1}
    
    let averageCost=await company.findById(Company) //esta variable la mando a llamar luego que se ingreso factura
    .then(income => {
        if(!income){
            res.status(404).send({message:"No hay "});
        }else{
           return(income.AverageCost) 
        }
    });
    console.log('COSTO PROMEDIO',averageCost);
    let tipoProveedor=await supplier.findById(SupplierId).populate({path: 'SupplierType',model:'SupplierType'})
    .then(tipo => {
        if(!tipo){
            res.status(404).send({message:"No hay "});
        }else{
           return(tipo.SupplierType.Name) 
        }
    });
    console.log(tipoProveedor);

    entryData.EntryDate=EntryDate;
    entryData.User=User;
    entryData.Comments=Comments;
    entryData.State=true;
    entryData.CodEntry=codigoEntradas;
    entryData.Company=Company;
    entryData.PurchaseInvoice=null;
    entryData.Supplier=SupplierName;
    entryData.save(async (err, entryStored)=>{
        if(err){
            res.status(500).send({message: "Error del Servidor."});

        }else {
            if(!entryStored){
                res.status(404).send({message: "No se agrego registro."});

            }
            else{
                let entryid=entryStored._id;
                let actualizado=false;
                if(detalles.length>0){
                    console.log('registro detalle');
                    detalles.map(async item=>{
                        entryDataDetail.push({
                            PurchaseInvoiceDetail:item.PurchaseInvoiceIdDetail,
                            ProductEntry:entryid,
                            Quantity:item.Quantity,
                            Inventory:item.Inventory,
                            ProductName:item.Nombre,
                            Price:item.Price,
                            Measure:item.Measure,
                            CodProduct:item.codigo,
                             });
                         });
                         productEntryDetails.insertMany(entryDataDetail)
                         .then(async function (detalle) {
                            console.log('INSERTADOS');
                          
                            detalle.map(async item => {
                                
                                let invenrotyExist=await inventory.findOne({_id:item.Inventory},'Stock')
                                .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                
                                let proIngresados=await purchaseInvoiceDetails.findOne({_id:item.PurchaseInvoiceDetail},'Ingresados')
                                .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                let quantityInvoice=await purchaseInvoiceDetails.findOne({_id:item.PurchaseInvoiceDetail},'Quantity')
                                .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                console.log(quantityInvoice);
                                let cantidad=0.0;
                                let ingresos=0.0;
                                let productRestante=0.0;
                                cantidad=parseFloat(invenrotyExist.Stock) + parseFloat(item.Quantity);
                                ingresos=parseFloat(proIngresados.Ingresados) + parseFloat(item.Quantity);
                             
                                let updateIngresados={};
                                console.log('inventario',item.Inventory);
                                console.log('cantidad',cantidad);
                                console.log('cantidad de detalle',item.Quantity);
                                console.log('ingresos',ingresos);
                                console.log('defactactua',quantityInvoice.Quantity);
                               
                                //cambiando estados e ingresos de  detalle factur
                                if(proIngresados!==null){
                                    if(parseFloat(ingresos)===parseFloat(quantityInvoice.Quantity)){
                                        console.log('COMPLETADO INGRESO');
                                       await purchaseInvoiceDetails.updateMany({_id:item.PurchaseInvoiceDetail},{
                                            Ingresados:ingresos,
                                            State:true
                                        }).catch(err => {console.log(err);})
                                        
                                    }
                                     else{
                                    console.log('NO COMPLETADO INGRESO');
    
                                    await purchaseInvoiceDetails.updateMany({_id:item.PurchaseInvoiceDetail},{
                                        Ingresados:ingresos,
                                        State:false
                                    }).catch(err => {console.log(err);})
                                    
                                   }
                                   actualizado=true;
                                } 
                             

                                //actualizando el stock
                                inventory.findByIdAndUpdate({_id:item.Inventory},{
                                    Stock:parseFloat(cantidad),
                                }).then(inventory => {console.log(inventory);})
                                .catch(err => {console.log(err);});
                                //contando 
                                if(actualizado){
                                    let completados=await  purchaseInvoiceDetails.count({State: true, PurchaseInvoice:PurchaseInvoiceId} ).then(c => {
                                        return c
                                      });
                                   
                                      let registrados=await purchaseInvoiceDetails.countDocuments({PurchaseInvoice:PurchaseInvoiceId }, function (err, count) {
                                       console.log(count); return (count)
                                      });
                                      console.log('PURCHASE INVOICE',PurchaseInvoiceId);
                                      console.log('completados',completados);
                                      console.log('todos',registrados);
                                      //validando si todos los productos estan ingresados
                                      if(parseInt(completados)===parseInt(registrados)){
                                        console.log("cambiando");
                                        purchaseInvoice.findByIdAndUpdate({_id:PurchaseInvoiceId},{
                                            Recibida:true,
                                        })
                                        .catch(err => {console.log(err);}); 
                                      
                                    }
                                }
                            });
                      
                               
                               

                            
                           
                        })
                         .catch(function (err) {
                             console.log(err);
                         });
                }
                 
                res.status(202).send({orden: entryStored});
                
            }
        }
    })

    if (averageCost) {
        console.log('COSTO PROMEDIO');
        if(detalles.length>0){
            detalles.map(item => {
                console.log(item.totalImpuestos);
                console.log(item.total);
                console.log(item.Price);
                console.log('stock',item.Stock);
                let facturaProveedor=tipoProveedor==='CreditoFiscal'? item.totalImpuestos:item.total;
                let fact1=parseFloat((item.Stock*item.Price)+parseFloat(facturaProveedor));
                let fact2=parseFloat(item.Stock)+parseFloat(item.Quantity);
                console.log('fact2',fact2);
                console.log('fact1',fact1);
                costo=parseFloat((fact1)/(fact2));
                let costoprom={
                    AverageCost : parseFloat(averageCost?parseFloat(costo): 
                    (tipoProveedor==='CreditoFiscal'? item.totalImpuestos:item.total )) 
                    
                }
                console.log('costo promedio prodcutos nuevows',costo);
                
                product.updateMany({_id: item.ID_Products},costoprom)    
                .then(function () { 
                    console.log("Se actualizo costo promedio nuevo");
                })
                .catch(function (err) {
                    console.log(err);
                });  
            })
        }
        
    }

}

async function createProductEntryWithoutInvoice(req, res){
    const entryData=new productEntry();
    const entryDataDetail=[];
    let companyId = req.params.company;
    let detalles=req.body.entries;
    let inventaryUpdate={};

    const {Company,User,PurchaseInvoiceId,Comments,EntryDate,SupplierId,SupplierName} = req.body;
      //para generar el correctivo del ingreso en caso de que sea requerido
      let codEntry=await productEntry.findOne({Company:Company}).sort({CodEntry:-1})
      .then(function(doc){
              if(doc){
                      if(doc.CodEntry!==null){
                  return(doc.CodEntry)
              }
          }  
      });

      if(!codEntry){
        codigoEntradas =1;
    }else {codigoEntradas=codEntry+1}
     
    let averageCost=await company.findById(Company) //esta variable la mando a llamar luego que se ingreso factura
    .then(income => {
        if(!income){
            res.status(404).send({message:"No hay "});
        }else{
           return(income.AverageCost) 
        }
    });
    console.log('COSTO PROMEDIO',averageCost);
    let tipoProveedor=await supplier.findById(SupplierId).populate({path: 'SupplierType',model:'SupplierType'})
    .then(tipo => {
        if(!tipo){
            res.status(404).send({message:"No hay "});
        }else{
           return(tipo.SupplierType.Name) 
        }
    });
    entryData.EntryDate=EntryDate;
    entryData.User=User;
    entryData.Comments=Comments;
    entryData.State=true;
    entryData.CodEntry=codigoEntradas;
    entryData.Company=Company;
    entryData.PurchaseInvoice=null;
    entryData.Supplier=SupplierName;
  
    entryData.InvoiceNumber='';

    entryData.save(async (err, entryStored)=>{
        if(err){
            res.status(500).send({message: "Error del Servidor."});

        }else {
            if(!entryStored){
                res.status(404).send({message: "No se agrego registro."});

            }
            else{
                let entryid=entryStored._id;
                let actualizado=false;
                if(detalles.length>0){
                    console.log('registro detalle');
                    detalles.map(async item=>{
                        entryDataDetail.push({
                                PurchaseInvoiceDetail:item.PurchaseInvoiceIdDetail?item.PurchaseInvoiceIdDetail:null,
                                ProductEntry:entryid,
                                Quantity:item.Quantity,
                                Inventory:item.Inventory,
                                ProductName:item.Name,
                                Price:item.Price,
                                Measure:item.Measures,
                                CodProduct:item.codproducts,
                             });
                         });
                         productEntryDetails.insertMany(entryDataDetail)
                         .then(async function (detalle) {
                            console.log('INSERTADOS');
                          
                            detalle.map(async item => {
                                
                                let invenrotyExist=await inventory.findOne({_id:item.Inventory},'Stock')
                                .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                
                            
                                let cantidad=0.0;
                                let ingresos=0.0;
                                let productRestante=0.0;
                                cantidad=parseFloat(invenrotyExist.Stock) + parseFloat(item.Quantity);
                               
                             
                                let updateIngresados={};
                                console.log('inventario',item.Inventory);
                                console.log('cantidad',cantidad);
                                
                               
                            
                             

                                //actualizando el stock
                                inventory.findByIdAndUpdate({_id:item.Inventory},{
                                    Stock:parseFloat(cantidad),
                                })
                                .catch(err => {console.log(err);});
                                //contando 
                            
                            });
                      
                               
                               

                            
                           
                        })
                         .catch(function (err) {
                             console.log(err);
                         });
                }
                if (averageCost) {
                    console.log('COSTO PROMEDIO');
                    if(detalles.length>0){
                        detalles.map(item => {
                            console.log(item.totalImpuestos);
                            console.log(item.total);
                            console.log(item.Price);
                            console.log('stock',item.Stock);
                            let facturaProveedor=tipoProveedor==='CreditoFiscal'? item.totalImpuestos:item.total;
                            let fact1=parseFloat((item.Stock*item.Price)+parseFloat(facturaProveedor));
                            let fact2=parseFloat(item.Stock)+parseFloat(item.Quantity);
                            console.log('fact2',fact2);
                            console.log('fact1',fact1);
                            costo=parseFloat((fact1)/(fact2));
                            let costoprom={
                                AverageCost : parseFloat(averageCost?parseFloat(costo): 
                                (tipoProveedor==='CreditoFiscal'? item.totalImpuestos:item.total )) 
                                
                            }
                            console.log('costo promedio prodcutos nuevows',costo);
                            
                            product.updateMany({_id: item.ID_Products},costoprom)    
                            .then(function () { 
                                console.log("Se actualizo costo promedio nuevo");
                            })
                            .catch(function (err) {
                                console.log(err);
                            });  
                        })
                    }
                    
                }
            
                res.status(200).send({Entry: entryStored});
            }
        }
    })


}

function getProductEntries(req, res){
    let invoiceId = req.params.id;
    productEntryDetails.find({ProductEntry:invoiceId}).populate({path: 'Inventory', model: 'Inventory', 
    populate:{path: 'Product', model: 'Product',populate:{path: 'Measure', model: 'Measure'}}})
    .then(supplier => {
        if(!supplier){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({supplier})
        }
    }); 
}

async function anularProductEntry(req, res){
    let entryId= req.params.id;

    productEntry.findByIdAndUpdate(entryId,{State:false},async (err, entryUpdate)=>{
        if(err){
            res.status(500).send({message: "Error del Servidor."});

        }else {
            if(!entryUpdate){
                res.status(404).send({message: "No se agrego registro."});

            }
            else{
                let invoiceId=entryUpdate.PurchaseInvoice;
                console.log(entryUpdate);
                let entryDetail=await productEntryDetails.find({ProductEntry:entryId})
                .then(function(doc){
                    if(doc){
                            return(doc);
                    }
                });
                let invoiceDetail=await purchaseInvoiceDetails.find({PurchaseInvoice:invoiceId})
                .then(function(doc){
                    if(doc){
                            return(doc);
                    }
                });
                console.log(entryDetail);
                entryDetail.map(async item =>{
                    let ingresados=null;
                    let inStock=await inventory.findOne({_id:item.Inventory},'Stock')
                    .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                    if(item.PurchaseInvoiceDetail!==null){
                        ingresados=await purchaseInvoiceDetails.findOne({_id:item.PurchaseInvoiceDetail})
                    .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                    } 
                   
                    let cantidad=0.0;
                    let ingresoUpdate=0.0;
                    console.log('INGRESADOS');
                    console.log(inStock);
                    console.log('+++++++++++++++');
                    if(ingresados!==null){
                        console.log(ingresados.Ingresados);
                        console.log(inStock.Stock);
                            if(inStock.Stock>=ingresados.Ingresados){
                                console.log('SE ACTUALIZO STOCK');
                                cantidad=parseFloat(inStock.Stock-item.Quantity); 
                                if(ingresados.Ingresados>=item.Quantity){
                                    ingresoUpdate=parseFloat(ingresados.Ingresados-item.Quantity)
                                }
                                
                                console.log('cantidad',cantidad);
                                console.log('ingresos',ingresoUpdate);
                                inventory.findByIdAndUpdate({_id:item.Inventory},{
                                    Stock:parseFloat(cantidad),
                                })
                                .catch(err => {console.log(err);});

                                purchaseInvoiceDetails.findByIdAndUpdate({_id:item.PurchaseInvoiceDetail},{
                                    Ingresados:parseFloat(ingresoUpdate),
                                    State:false
                                })
                                .catch(err => {console.log(err);});

                                purchaseInvoice.findByIdAndUpdate({_id:ingresados.PurchaseInvoice},{
                                    Recibida:false,
                                })
                                .catch(err => {console.log(err);});

                                productEntry.findByIdAndUpdate({_id:item.ProductEntry},{
                                    State:false,
                                })
                                .catch(err => {console.log(err);});
                        }
                  
                    }
                    else{
                        cantidad=parseFloat(inStock.Stock-item.Quantity); 
                        inventory.findByIdAndUpdate({_id:item.Inventory},{
                            Stock:parseFloat(cantidad),
                        }).then(up=>{console.log(up)})
                        .catch(err => {console.log(err);});

                        productEntry.findByIdAndUpdate({_id:item.ProductEntry},{
                            State:false,
                        })
                        .catch(err => {console.log(err);});
                    }
                    
                });
               res.status(200).json(entryUpdate);

            }
        }

    })
 
}

module.exports={
    getEntries,
    createProductEntry,
    getProductEntries,
    anularProductEntry,
    createProductEntryWithoutInvoice
}
// const db = require('../config/db.config.js');;
// const { Op } = require("sequelize");

// const sequelize = require('sequelize');

// const ProductEntries=db.ProductEntries;
// const InvoiceEntriesDetails = db.InvoiceEntriesDetails;
// const PurchaseInvoiceDetails = db.PurchaseInvoiceDetails;
// const PurchaseInvoice= db.PurchaseInvoice;
// const Inventory = db.Inventory;
// const Product = db.Product;
// const Measure = db.Measure;
// const Company = db.Company;

// function getEntries(req, res){
//     // Buscamos informacion para llenar el modelo de 
//     let userId=req.params.id;
//     try{
//         ProductEntries.findAll({
//             where: {
//                 ID_User: userId
//             },
//             include: [{
//                 model: InvoiceEntriesDetails,
//                 on:{
                   
//                     ID_ProductEntry: sequelize.where(sequelize.col("ec_invoiceentry.ID_ProductEntry"), "=", sequelize.col("ec_productentry.ID_ProductEntry")),
                    
//                  },
//                 include: [{
//                     model:PurchaseInvoiceDetails,
//                     attributes: ['Quantity','ID_PurchaseInvoice'],
//                     // incluce:[{
//                     //     model:PurchaseInvoice,
//                     //     attributes: ['Comments'],
                        
//                     // }], 
//                     on:{
//                         ID_PurchaseInvoiceDetail: sequelize.where(sequelize.col("ec_invoiceentry->ec_purchaseinvoicedetails.ID_PurchaseInvoiceDetail"), "=", sequelize.col("ec_invoiceentry.ID_PurchaseInvoiceDetail")),
//                     }
//                 }]
//             }
//         ]

//         })
//         .then(entries => {
//             res.status(200).send({entries});
          
//         })
//     }catch(error) {
//         // imprimimos a consola
//         console.log(error);

//         res.status(500).json({
//             message: "Error en query!",
//             error: error
//         });
//     }
// }

// async function createProductEdddntry(req,res){
//     let entry = {};
//     let userId = req.body.ID_User; 
//     let codigo=0;
//     let detalles=req.body.entries;
//     let companyId = req.params.id;
//     let entrycod=await ProductEntries.max('codentry',{ 
            
//             where: {ID_Company:companyId},
            
        
//     }).then(function(orden) {
        
//        return orden;
//     });
    
//     if(!entrycod){
//         codigo =1;
//     }else {codigo=entrycod+1}
    
//     try{
//         let addEntry={};
        
//         // Construimos el modelo del objeto company para enviarlo como body del request
//         entry.EntryDate = req.body.EntryDate;
//         entry.ID_User =req.body.ID_User;
//         entry.Comments = req.body.Comments;
//         entry.codentry=codigo;
//         entry.ID_Company=req.body.ID_Company;
//         entry.State=1;
       
    
//         ProductEntries.create(entry)
//         .then(result => {    
//             res.status(200).json(result);
//             let entryid=result.ID_ProductEntry;
           
//             if(detalles.length>0){
//                  for(const item of detalles){
//                     addEntry.ID_PurchaseInvoiceDetail=item.ID_PurchaseInvoiceDetail;
//                     addEntry.Quantity=item.Quantity;
//                     addEntry.ID_Inventory=item.ID_Inventory;
//                     addEntry.ID_ProductEntry = entryid;
//                     addEntry.ID_Products=item.ID_Products;
//                     addEntry.State=0;
//                     InvoiceEntriesDetails.create(addEntry).then(async result=>{                   
//                         if(!result){
//                             res.status(500).send({message:"Error al ingresar el detalle de la orden"});
                           
//                         }else{
                           
//                             let invenrotyExist = await  Inventory.findAll({
//                                 include: [
//                                     {
//                                        model:Product,
//                                        attributes: [],
//                                        on: {
//                                         ID_Products: sequelize.where(sequelize.col("ec_inventory.ID_Products"), "=", sequelize.col("crm_products.ID_Products"))
//                                        }
//                                     }
//                                 ],
//                                 attributes: ['Stock'],
//                                 where: {ID_Inventory:item.ID_Inventory}
//                             }).then(orders => {
//                                 return orders
//                             });
//                             let proIngresados = await  PurchaseInvoiceDetails.findAll({          
//                                 attributes: ['Ingresados'],
//                                 where: {ID_PurchaseInvoiceDetail:item.ID_PurchaseInvoiceDetail}
//                             }).then(orders => {
//                                 return orders
//                             });

//                             var cantidad=0.0;
//                             var ingresos=0.0;
//                             console.log(invenrotyExist);
//                             cantidad=parseFloat(invenrotyExist[0].dataValues.Stock) + parseFloat(item.Quantity);
//                             ingresos=parseFloat(proIngresados[0].dataValues.Ingresados) + parseFloat(item.Quantity);
//                             let updateIngresados={};
                            
//                             console.log(parseFloat(ingresos));
//                             if(parseFloat(ingresos)===parseFloat(item.Cantidad)){
//                                 // let purchase={
//                                 //    Recibida:1
//                                 // };
//                                 // let result2 = await PurchaseInvoice.update(purchase,
//                                 //     {             
//                                 //       where: {ID_PurchaseInvoice : item.PuchaseInvoice},
//                                 //       attributes: ['ID_PurchaseInvoice']
//                                 //     }
//                                 //   );
//                                   updateIngresados={
//                                     Ingresados:parseFloat(ingresos),
//                                     State:1
//                                 };
//                                 let resul = await PurchaseInvoiceDetails.update(updateIngresados,
//                                     {             
//                                       where: {ID_PurchaseInvoiceDetail : item.ID_PurchaseInvoiceDetail},
//                                       attributes: ['ID_PurchaseInvoiceDetail']
//                                     }
//                                   )
//                             }
//                             else{
//                                 updateIngresados={
//                                     Ingresados:parseFloat(ingresos),
//                                     State:0
//                                 };
//                                 let result2 = await PurchaseInvoiceDetails.update(updateIngresados,
//                                     {             
//                                       where: {ID_PurchaseInvoiceDetail : item.ID_PurchaseInvoiceDetail},
//                                       attributes: ['ID_PurchaseInvoiceDetail']
//                                     }
//                                   )
//                             }
                                     
//                            let updateStock={
//                                  Stock :parseFloat(cantidad)
                                    
//                              }
                            
//                               console.log(updateStock);
                           
//                               let inventario = await Inventory.update(updateStock,
//                                 {             
//                                   where: {ID_Inventory : item.ID_Inventory, ID_Bodega:8},
//                                   attributes: ['Stock','inventory']
//                                 }
//                               );
//                               //contando 
//                               let completados=await  PurchaseInvoiceDetails.count({ where: {'State': {[Op.gt]: 0}, 'ID_PurchaseInvoice':item.PuchaseInvoice} }).then(c => {
//                                 return c
//                               });
//                               let todos=await  PurchaseInvoiceDetails.count({ where: {'ID_PurchaseInvoice':item.PuchaseInvoice} }).then(c => {
//                                 return c
//                               });
//                               console.log(completados);
//                               console.log(todos);
//                               if(parseInt(completados)===parseInt(todos)){
//                                   console.log("cambiando");
//                                 let purchase={
//                                     Recibida:1
//                                  };
//                                  let result2 = await PurchaseInvoice.update(purchase,
//                                      {             
//                                        where: {ID_PurchaseInvoice : item.PuchaseInvoice},
//                                        attributes: ['ID_PurchaseInvoice']
//                                      }
//                                    );
//                               }
//                         }
//                        }).catch(err=>{
//                         console.log(err);
//                      return err.message;
//                  });
//                  }
//             }
           
//         });          
        

//         // Save to MySQL database
       
//     }catch(error){
//         res.status(500).json({
//             message: "Fail!",
//             error: error.message
//         });
//     }
// }

function getProductEntriccces(req,res){
    let invoiceId = req.params.id; 
    try{
        Inventory.findAll({
            include: [
                {
                    model: PurchaseInvoiceDetails,
                    include:[{
                        model:InvoiceEntriesDetails,
                        attributes: ['ID_ProductEntry'],
                        on:{
                   
                            ID_PurchaseInvoiceDetail: sequelize.where(sequelize.col("ec_purchaseinvoicedetail.ID_PurchaseInvoiceDetail"), "=", sequelize.col("ec_purchaseinvoicedetail->ec_invoiceentry.ID_PurchaseInvoiceDetail")),
                         //    Ingresados:{[Op.gt]: 0}
                         },
                         include:[{
                             model:ProductEntries,
                             on:{
                   
                                ID_ProductEntry: sequelize.where(sequelize.col("ec_purchaseinvoicedetail->ec_invoiceentry.ID_ProductEntry"), 
                                "=", sequelize.col("ec_purchaseinvoicedetail->ec_invoiceentry->ec_productentries.ID_ProductEntry")),
                             //    Ingresados:{[Op.gt]: 0}
                             },
                         }]
                    }],
                    attributes: ['ID_PurchaseInvoiceDetail','ID_PurchaseInvoice','Quantity','Discount','ProductName','SubTotal','ID_Inventory','Ingresados','State'],
                    on:{
                   
                       ID_Inventory: sequelize.where(sequelize.col("ec_purchaseinvoicedetail.ID_Inventory"), "=", sequelize.col("ec_inventory.ID_Inventory")),
                    //    Ingresados:{[Op.gt]: 0}
                    },
                   
                
                },
                {
                    model: Product,
                    include: [
                        {
                            model:Measure,
                            attributes: ['Name'],
                            on: {
                               ID_Measure: sequelize.where(sequelize.col("crm_products.ID_Measure"), "=", sequelize.col("crm_products->crm_measures.ID_Measure")),
                              
                           }
                        }
                    ],
                    attributes: ['codproducts','ID_Measure','BuyPrice','ID_Products'],
                    on:{
                        ID_Products: sequelize.where(sequelize.col("ec_inventory.ID_Products"), "=", sequelize.col("crm_products.ID_Products")),
                    },
                    
                    
                }
            ],
            attributes: ['ID_Inventory'],
            where:{
                ID_PurchaseInvoice: sequelize.where(sequelize.col("ec_purchaseinvoicedetail.ID_PurchaseInvoice"), "=", invoiceId),
                ID_Bodega:8
            }
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


async function anularggggProductEntry(req,res){
    let entryId = req.params.id; 
    console.log(entryId);
   
    try{
        let entry = await ProductEntries.findByPk(entryId,{
            attributes: ['ID_ProductEntry']});
    

        if(!entry){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el cliente con ID = " + entryId,
                error: "404"
            });
        } else {    
            let invoiceEntryD=await InvoiceEntriesDetails.findAll({where: {ID_ProductEntry: entryId}}).then(function(result){return result});
            
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = { 
               
                State:0          
            }
             //agregar proceso de encriptacion
            let result = await entry.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_ProductEntry  : entryId},
                                attributes:['ID_ProductEntrys' ]
                              }
                            );

            // retornamos el resultado al cliente
            if(!result) {
                res.status(500).json({
                    message: "Error -> No se puede actualizar el usuario con ID = " + req.params.id,
                    error: "No se puede actualizar",
                });
            }
            if(result){
                let invoiceDetailId=null;
               for(var i=0; i<invoiceEntryD.length; i++){
                   invoiceDetailId =await invoiceEntryD[i].dataValues.ID_PurchaseInvoiceDetail;
                  console.log(invoiceDetailId);
                  let invoiceDetails=await PurchaseInvoiceDetails.findAll({ where:{ID_PurchaseInvoiceDetail:invoiceDetailId}})
                  .then(await function(result){return result});
                    for(var j=0; j<invoiceDetails.length; j++){
                      let purchaseInvoiceId = await invoiceDetails[j].dataValues.ID_PurchaseInvoice;
                      let inventoryId= await invoiceDetails[j].dataValues.ID_Inventory;
                      let ingresados= await invoiceDetails[j].dataValues.Ingresados;
                      let cantidad=0;
                      console.log(ingresados);
                      let invenrotyExist = await  Inventory.findAll({
                        include: [
                            {
                               model:Product,
                               attributes: [],
                               on: {
                                ID_Products: sequelize.where(sequelize.col("ec_inventory.ID_Products"), "=", sequelize.col("crm_products.ID_Products"))
                               }
                            }
                        ],
                        attributes: ['Stock'],
                        where: {ID_Inventory:inventoryId}
                    }).then(orders => {
                        return orders
                    });
                    console.log(invenrotyExist[0].dataValues.Stock);
                    console.log(ingresados);
                    cantidad=parseFloat(invenrotyExist[0].dataValues.Stock) - parseFloat(ingresados);
                    console.log(cantidad);
                    //CAMBIO DE ESTADO DE ORDEN DE DETALLE DE FACTURA
                    updateIngresados={
                        Ingresados:0,
                        State:0
                    };
                    let resul = await PurchaseInvoiceDetails.update(updateIngresados,
                        {             
                          where: {ID_PurchaseInvoiceDetail : invoiceDetailId},
                          attributes: ['ID_PurchaseInvoiceDetail']
                        }
                      );
                    //editar estado de la FACTURAS
                    let updateInvoice={
                        Recibida:0
                    };
                    let invoiceEditado = await PurchaseInvoice.update(updateInvoice,
                        {             
                          where: {ID_PurchaseInvoice : purchaseInvoiceId},
                          attributes: ['ID_PurchaseInvoice']
                        }
                      );
                      let updateStock={
                        Stock :cantidad
                           
                    }
                    let inventario = await Inventory.update(updateStock,
                        {             
                          where: {ID_Inventory : inventoryId, ID_Bodega:8},
                          attributes: ['Stock']
                        }
                      );
                  }
               }
            }

            res.status(200).json(result);
        }
    } catch(error){
        res.status(500).json({
            message: "Error -> No se puede actualizar el usuario con ID = " + req.params.id,
            error: error.message
        });
    }
}


async function createProductEntryWifggthoutInvoice(req,res){
    let entry = {};
    let userId = req.body.ID_User; 
    let codigo=0;
    let detalles=req.body.entries;
    let companyId = req.body.ID_Company;
    console.log(companyId);
    let entrycod=await ProductEntries.max('codentry',{ 
            
            where: {ID_Company:companyId},
            
        
    }).then(function(orden) {
        
       return orden;
    });
    
    if(!entrycod){
        codigo =1;
    }else {codigo=entrycod+1}
    
    try{
        let addEntry={};
        
        // Construimos el modelo del objeto company para enviarlo como body del request
        entry.EntryDate = req.body.EntryDate;
        entry.ID_User =req.body.ID_User;
        entry.Comments = req.body.Comments;
        entry.codentry=codigo;
        entry.ID_Company=req.body.ID_Company;
        entry.State=1;
       
    
        ProductEntries.create(entry)
        .then(result => {  
          let entryId=result.ID_ProductEntry;
          console.log(entryId);
          if(detalles.length>0){
            for(const item of detalles){
                let inventario=item.ID_Inventory;
                addEntry.ID_ProductEntry=entryId;
                addEntry.Quantity =item.Quantity;
                addEntry.ID_Inventory=item.ID_Inventory;
                console.log(addEntry);
                InvoiceEntriesDetails.create(addEntry).then(async result=>{                   
                    if(!result){
                        res.status(500).send({message:"Error al ingresar el detalle de la orden"});
                       
                    }else{
                        let invenrotyExist = await  Inventory.findAll({
                            include: [
                                {
                                   model:Product,
                                   attributes: [],
                                   on: {
                                    ID_Products: sequelize.where(sequelize.col("ec_inventory.ID_Products"), "=", sequelize.col("crm_products.ID_Products"))
                                   }
                                }
                            ],
                            attributes: ['Stock'],
                            where: {ID_Inventory:inventario}
                        }).then(orders => {
                            return orders
                        });
                        console.log(invenrotyExist);
                        let cantidad=parseFloat(invenrotyExist[0].dataValues.Stock) + parseFloat(item.Quantity);
                        console.log(cantidad);

                        let updateStock={
                            Stock :parseFloat(cantidad)
                               
                        }
                       
                         console.log(updateStock);
                      
                         let actInventario = await Inventory.update(updateStock,
                           {             
                             where: {ID_Inventory : inventario, ID_Bodega:8},
                             attributes: ['Stock']
                           }
                         );

                    }
                }).catch(error=>{console.log(error);})
            }
        }
         }).catch(err => {console.log(err);})

    }
    catch(err) {
        console.log(err);
    }
}


// module.exports={
//     getEntries,
//     createProductEntry,
//     getProductEntries,
//     anularProductEntry,
//     createProductEntryWithoutInvoice
// }