const purchaseInvoice = require("../models/purchaseInvoice.model");
const purchaseInvoiceDetail = require("../models/purchaseInvoiceDetails.model");
const invoiceTaxes = require("../models/invoiceTaxes.model");
const company = require("../models/company.model");
const productEntry = require("../models/productEntries.model");
const productEntryDetails = require("../models/invoiceEntriesDetails.model");
const supplier = require("../models/supplier.model");
const purchaseOrder = require("../models/purchaseOrder.model");
const PaymentToSupplier= require('../models/paymentstoSuppliers.model')

function getSuppliersInvoices(req, res){
    const { id,company } = req.params;
   purchaseInvoice.find({User:id}).populate({path: 'Supplier', model: 'Supplier', match:{Company: company},
    populate: {path: 'SupplierType', model: 'SupplierType'}})
    .then(invoices => {
        if(!invoices){
            res.status(404).send({message:"No hay "});
        }else{
            
            res.status(200).send({invoices})
        }
    });
}

async function createSupplierInvoice(req, res){
    const invoice= new purchaseInvoice();
    const entryData1=new productEntry();
    const entryData=new productEntry();

    const updateDeuda={};
    let companyId = req.params.company;
    let userId = req.params.id; 
    let invoiceDetalle=req.body.details;
    let dePurchaseOrder=req.body.ordenAnt;
    let addTaxes=req.body.impuestos;
     
    let diasEntrega=req.body.dias;
    let fechaInvoice=req.body.InvoiceDate;
    
    let now= new Date();
    let creacion=now.getTime();
    var date = new Date(fechaInvoice);
   
   
    date.setDate(date.getDate() + diasEntrega);
   
    const {PurchaseOrder,InvoiceDate,Supplier,InvoiceNumber,CreationDate,Total,User,
    DeliverDay,Description,InvoiceComments,PurchaseNumber} = req.body;

    const invoiceDetails=req.body.details;
    const detalle=[];
    let codigo=0;
    let codigoEntradas=0;

    //para generar correlativo de factura
    let codInvoice=await purchaseInvoice.findOne().sort({CodInvoice:-1})
    .populate({path: 'Supplier', model: 'Supplier', match:{Company: companyId}}).then(function(doc){
            if(doc){
                    if(doc.CodInvoice!==null){
                return(doc.CodInvoice)
            }
        }  
    });
    //para generar el correctivo del ingreso en caso de que sea requerido
    let codEntry=await productEntry.findOne({Company:companyId}).sort({CodEntry:-1})
    .then(function(doc){
            if(doc){
                    if(doc.CodEntry!==null){
                return(doc.CodEntry)
            }
        }  
    });
    //verificar si compania tiene ingreso requerido
    let requiredIncome=await company.findById(companyId) //esta variable la mando a llamar luego que se ingreso factura
    .then(income => {
        if(!income){
            res.status(404).send({message:"No hay "});
        }else{
           return(income.RequieredIncome) 
        }
    });
    
    //obteniendo deuda actual con proveedor
    let deudaAct=await supplier.findById(Supplier) //esta variable la mando a llamar luego que se ingreso factura
    .then(deuda => {
        if(!deuda){
            res.status(404).send({message:"No hay "});
        }else{
           return(deuda.DebsToPay) 
        }
    });
    

    if(!codInvoice){
        codigo =1;
    }else {codigo=codInvoice+1}

    if(!codEntry){
        codigoEntradas =1;
    }else {codigoEntradas=codEntry+1}

    invoice.PurchaseOrder=PurchaseOrder;
    invoice.InvoiceDate=InvoiceDate;
    invoice.Supplier=Supplier;
    invoice.InvoiceNumber=InvoiceNumber;
    invoice.CreationDate= creacion;
    invoice.Total=Total;
    invoice.User=User;
    invoice.DeliverDay=date;
    invoice.State='Creada'; 
    invoice.PurchaseNumber=PurchaseNumber;
    invoice.Comments=Description; 
    invoice.InvoiceComments	=InvoiceComments;
    invoice.Pagada=false;
    invoice.Recibida=!requiredIncome?true:false;
    // invoice.Recibida=false;
    invoice.CodInvoice=codigo;
    
    updateDeuda.DebsToPay=parseFloat(deudaAct)+parseFloat(Total);

    //a utilizar para formar objectos
    let details=[];
    let deOrden=[];
    let impuestos=[];
   
    let entryDataDetail=[];
    let invoiceId=null;
    invoice.save(async (err, invoiceStored)=>{
        if(err){
            res.status(500).send({message: err});

        }else {
            if(!invoiceStored){
                res.status(500).send({message: err});

            }
            else{
                invoiceId=invoiceStored._id;
                //actualizar deuda 
                supplier.findByIdAndUpdate({_id:Supplier},updateDeuda,(err,updateDeuda)=>{
                    if(err){
                        res.status(500).send({message: "Error del Servidor."});
                        console.log(err);
                    }
                });
                if(invoiceDetalle.length>0){
                    invoiceDetalle.map(async item => {
                    details.push({
                        ProductName:item.Name,
                        PurchaseInvoice:invoiceId,
                        Quantity:parseFloat(item.Quantity) ,
                        Discount:parseFloat(item.Discount),
                        Price:parseFloat(item.Price),
                        Inventory :item.Inventory,
                        SubTotal: parseFloat(item.Quantity*item.Price)- parseFloat((item.Quantity*item.Price)*item.Discount),
                        Ingresados:0,
                        State:0
                    })
                })
                }
                if(dePurchaseOrder.length > 0){
                   dePurchaseOrder.map(async item => { 
                    deOrden.push({
                        ProductName:item.ProductName,
                        PurchaseInvoice:invoiceId,
                        Quantity:parseFloat(item.Quantity) ,
                        Discount:parseFloat(item.Discount),
                        Price:parseFloat(item.Price),
                        Inventory :item.Inventory._id,
                        SubTotal: parseFloat(item.Quantity*item.Price)- parseFloat((item.Quantity*item.Price)*item.Discount),
                        Ingresados:0,
                        State:0
                    })
                }) 
                }
                if(addTaxes.length>0){
                    addTaxes.map(async item => {
                        impuestos.push({
                            PurchaseInvoice:invoiceId,
                            Taxes:item.id,
                            Monto:item.monto
                    })
                })
                }
                if(details.length>0){  //insertando detalles  de los nuevos elementos 
                    purchaseInvoiceDetail.insertMany(details)
                    .then(function (detalle) {
                        console.log("Ingresando entrada");
                      
                        console.log("INSERTADOS");
                        
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
                }
                if(deOrden.length>0){    //insertando detalles de los detalles de la orden
                    purchaseInvoiceDetail.insertMany(deOrden)
                    .then(function (detalle) {
                        console.log('ingresando detalle');
                      
                        console.log("INSERTADOS de la orden");
                        
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
                }
                if(impuestos.length>0){
                    invoiceTaxes.insertMany(impuestos)
                    .then(function () {
                        
                        console.log("INSERTADOS");
                        
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
                }
                if(!requiredIncome){   
                    entryData1.EntryDate=creacion;
                    entryData1.User=User;
                    entryData1.Comments="Ingreso automatico "+creacion;
                    entryData1.State=true;
                    entryData1.CodEntry=codigoEntradas;
                    entryData1.Company=companyId;
                    entryData1.save((err, entryStored)=>{
                        if(err){
                            console.log(err);
                
                        }else {
                            if(!entryStored){
                                console.log('no se ingreso entrada');
                
                            }
                            else{
                                let productEntryID=entryStored._id;
                                purchaseInvoiceDetail.find({PurchaseInvoice: invoiceId})
                                .then(detalle => {
                                    if(!detalle){
                                        res.status(404).send({message:"No hay "});
                                    }else{
                                        detalle.map(async item=>{
                                        entryDataDetail.push({
                                            PurchaseInvoiceDetail:item._id,
                                            ProductEntry:productEntryID,
                                            Quantity:item.Quantity,
                                            Inventory:item.Inventory
                                             });
                                         })
                                        productEntryDetails.insertMany(entryDataDetail)
                                        .catch(function (err) {
                                            console.log(err);
                                        });
                                    }
                                });
                                
                                
                                
                            }
                        }
                    });
                                
                }
            
                purchaseOrder.findByIdAndUpdate({_id:PurchaseOrder},{State:'Facturada'},(err,updateDeuda)=>{
                    if(err){
                        res.status(500).send({message: "Error del Servidor."});
                        console.log(err);
                    }
                });
               
                let totalDeuda=parseFloat(Total)+parseFloat(deudaAct);
                supplier.findByIdAndUpdate({_id:Supplier},{DebsToPay:totalDeuda},(err,updateDeuda)=>{
                    if(err){
                        res.status(500).send({message: "Error del Servidor."});
                        console.log(err);
                    }
                });
                res.status(200).send({invoice: invoiceStored});
            }
        }
    });

  
}

async function createNewSupplierInvoice(req, res){
    const invoice= new purchaseInvoice();
    const entryData=new productEntry();

    let companyId = req.params.company;
    let userId = req.params.id; 
    let invoiceDetalle=req.body.details;
    let addTaxes=req.body.impuestos;
     
    let diasEntrega=req.body.dias;
    let fechaInvoice=req.body.InvoiceDate;
    
    let now= new Date();
    let creacion=now.getTime();
    var date = new Date(fechaInvoice);
   
    console.log('INGRESO000000000000000000000000000');
    
    date.setDate(date.getDate() + diasEntrega);
    const {PurchaseOrder,InvoiceDate,Supplier,InvoiceNumber,Total,User
        ,Description,InvoiceComments,PurchaseNumber} = req.body;
    //para generar el correctivo del ingreso en caso de que sea requerido
    let codEntry=await productEntry.findOne({Company:companyId}).sort({CodEntry:-1})
    .then(function(doc){
            if(doc){
                    if(doc.CodEntry!==null){
                return(doc.CodEntry)
            }
        }  
    });

    let codInvoice=await purchaseInvoice.findOne().sort({CodInvoice:-1})
    .populate({path: 'Supplier', model: 'Supplier', match:{Company: companyId}}).then(function(doc){
            if(doc){
                    if(doc.CodInvoice!==null){
                return(doc.CodInvoice)
            }
        }  
    });
    //verificar si compania tiene ingreso requerido
    let requiredIncome=await company.findById(companyId) //esta variable la mando a llamar luego que se ingreso factura
    .then(income => {
        if(!income){
            res.status(404).send({message:"No hay "});
        }else{
           return(income.RequieredIncome) 
        }
    });
    //obteniendo deuda actual con proveedor
    let deudaAct=await supplier.findById(Supplier) //esta variable la mando a llamar luego que se ingreso factura
    .then(deuda => {
        if(!deuda){
            res.status(404).send({message:"No hay "});
        }else{
           return(deuda.DebsToPay) 
        }
    });


    if(!codInvoice){
        codigo =1;
    }else {codigo=codInvoice+1}

    if(!codEntry){
        codigoEntradas =1;
    }else {codigoEntradas=codEntry+1}
    
   
  
    let details=[];
    let impuestos=[];
    let entryDataDetail=[];
    invoice.PurchaseOrder=PurchaseOrder;
    invoice.InvoiceDate=InvoiceDate;
    invoice.Supplier=Supplier;
    invoice.InvoiceNumber=InvoiceNumber;
    invoice.CreationDate= creacion;
    invoice.Total=Total;
    invoice.User=User;
    invoice.DeliverDay=date;
    invoice.State='Creada'; 
    invoice.PurchaseNumber=PurchaseNumber;
    invoice.Comments=Description; 
    invoice.InvoiceComments	=InvoiceComments;
    invoice.Pagada=false;
    // invoice.Recibida=requiredIncome.length > 0?true:false;
    invoice.Recibida=false;
    invoice.CodInvoice=codigo;

    

    invoice.save((err, invoiceStored)=>{
        if(err){
            console.log(err);
            res.status(500).send({message: err});

        }else {
            if(!invoiceStored){
                res.status(500).send({message: err});

            }
            else{
                let invoiceId=invoiceStored._id;
               
                 console.log(invoiceStored);
                if(invoiceDetalle.length>0){
                    invoiceDetalle.map(async item => {
                    details.push({
                        ProductName:item.Name,
                        PurchaseInvoice:invoiceId,
                        Quantity:parseFloat(item.Quantity) ,
                        Discount:parseFloat(item.Discount),
                        Price:parseFloat(item.Price),
                        Inventory :item.Inventory,
                        SubTotal: parseFloat(item.Quantity*item.Price)- parseFloat((item.Quantity*item.Price)*item.Discount),
                        Ingresados:0,
                        State:0
                    })
                })
                }
                if(addTaxes.length>0){
                    addTaxes.map(async item => {
                        impuestos.push({
                            PurchaseInvoice:invoiceId,
                            Taxes:item.id,
                            Monto:item.monto
                    })
                })
                }
              
                if(details.length>0){
                    purchaseInvoiceDetail.insertMany(details)
                    .then(function () {
                        
                        console.log("INSERTADOS");
                        
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
                }
                if(impuestos.length>0){
                    invoiceTaxes.insertMany(impuestos)
                    .then(function () {
                        
                        console.log("INSERTADOS");
                        
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
                }

                if(!requiredIncome){   
                    entryData.EntryDate=creacion;
                    entryData.User=User;
                    entryData.Comments="Ingreso automatico "+creacion;
                    entryData.State=true;
                    entryData.CodEntry=codigoEntradas;
                    entryData.Company=companyId;
                    entryData.save((err, entryStored)=>{
                        if(err){
                            console.log(err);
                
                        }else {
                            if(!entryStored){
                                console.log('no se ingreso entrada');
                
                            }
                            else{
                                let productEntryID=entryStored._id;
                                purchaseInvoiceDetail.find({PurchaseInvoice: invoiceId})
                                .then(detalle => {
                                    if(!detalle){
                                        res.status(404).send({message:"No hay "});
                                    }else{
                                        detalle.map(async item=>{
                                        entryDataDetail.push({
                                            PurchaseInvoiceDetail:item._id,
                                            ProductEntry:productEntryID,
                                            Quantity:item.Quantity,
                                            Inventory:item.Inventory
                                             });
                                         })
                                        productEntryDetails.insertMany(entryDataDetail)
                                        .catch(function (err) {
                                            console.log(err);
                                        });
                                    }
                                });
                                
                                
                                
                            }
                        }
                    });
                                
                }
                let totalDeuda=parseFloat(Total)+parseFloat(deudaAct);
                supplier.findByIdAndUpdate({_id:Supplier},{DebsToPay:totalDeuda},(err,updateDeuda)=>{
                    if(err){
                        res.status(500).send({message: "Error del Servidor."});
                        console.log(err);
                    }
                });
          
                res.status(200).send({ invoiceStored});
            }
        }
    });
}

function getInvoiceDetails(req, res){
    let invoiceId = req.params.id; 
    purchaseInvoiceDetail.find({PurchaseInvoice:invoiceId}).populate({path: 'Inventory', model: 'Inventory',
    populate:({path: 'Bodega', model: 'Bodega', match:{Name:'Principal'}}),
    populate:({path: 'Product',model:'Product',
    populate:{path: 'Measure',model:'Measure'}}
    )})
    .then(details => {
        if(!details){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({details})
        }
    });
}

async function updateInvoicePurchase(req, res){
    let invoiceId = req.params.id;
    let invoiceDetalle=req.body.details;
    let detailsAnt=req.body.ordenAnt;
    let companyId=req.body.Company;
    let updateInvoice={};
    let entryDataDetail=[];
    
    updateInvoice.Supplier=req.body.Supplier;
    updateInvoice.DeliverDay=req.body.DeliverDay;
    updateInvoice.Comments=req.body.Comments;
    updateInvoice.InvoiceNumber=req.body.InvoiceNumber;
    updateInvoice.Total=req.body.Total;
    updateInvoice.InvoiceComments=req.body.InvoiceComments;
    
    let detallePrev={};
    let detalle=[];
    let idEntry;

     //verificar si compania tiene ingreso requerido
     let requiredIncome=await company.findById(companyId) //esta variable la mando a llamar luego que se ingreso factura
     .then(income => {
         if(!income){
             res.status(404).send({message:"No hay "});
         }else{
            return(income.RequieredIncome) 
         }
     });

    purchaseInvoice.findByIdAndUpdate({_id:invoiceId},updateInvoice,async (err,invoiceUpdate)=>{
        if(err){
            res.status(500).send({message: "Error del Servidor."});
            console.log(err);
        } else {
            if(!invoiceUpdate){
                
                res.status(404).send({message: "No se actualizo registro"});
            }
            else{
               
                let codInvoice;
                let idd=await purchaseInvoiceDetail.find({PurchaseInvoice: invoiceId}).then(function(doc){
                    if(doc){
                            if(doc.CodInvoice!==null){
                        return(doc._id)
                    }
                }  
            });
                console.log('id',idd);
                if(detailsAnt.length > 0) {
                    
                    detailsAnt.map(async item => {  
                       codDetail=item._id;
                       detallePrev.ProductName=item.ProductName;
                       detallePrev.Quantity=parseFloat(item.Quantity) ,
                       detallePrev.Discount=parseFloat(item.Discount),
                       detallePrev.Price=parseFloat(item.Price),
                       detallePrev.Inventory =item.Inventory._id,
                       purchaseInvoiceDetail.updateMany({_id: item._id ,PurchaseInvoice:invoiceId},detallePrev)
                           .then(function () { 
                               console.log("Actualizados");
                           })
                           .catch(function (err) {
                               console.log(err);
                           });  
                           productEntryDetails.findOneAndUpdate({PurchaseInvoiceDetail:item._id},{
                               Quantity:parseFloat(item.Quantity),
                               Inventory :item.Inventory._id
                           }).then(( data)=>{
                               
                           console.log(data);
                               return(data.ProductEntry)}).catch(function (err) {
                               console.log(err);
                           }) 
                           
                           console.log('ENTRADA',idEntry);
                          
                           
                    });
                   
                    console.log('-------');
                    console.log('ENTRADA',idEntry);
                    console.log('ENTRADA',codInvoice);
                    console.log('-------');
               }

               if(invoiceDetalle.length>0){
                    invoiceDetalle.map(async item => {
                       detalle.push({
                           ProductName:item.Name,
                           PurchaseInvoice:invoiceId,
                           Quantity:parseFloat(item.Quantity) ,
                           Discount:parseFloat(item.Discount),
                           Price:parseFloat(item.Price),
                           Inventory :item.Inventory,
                       })
                    });
                    console.log(detalle);
                       if(detalle.length>0){
                        purchaseInvoiceDetail.insertMany(detalle)
                           .then(function (detalleStored) {
                               console.log(detalleStored);
                               console.log("INSERTADOS");
                            //    detalleStored.map(async item=>{
                            //     entryDataDetail.push({
                            //         PurchaseInvoiceDetail:item._id,
                            //         ProductEntry:entryId,
                            //         Quantity:item.Quantity,
                            //         Inventory:item.Inventory
                            //             });
                            //         })
                            //     console.log(entryDataDetail);
                            //     productEntryDetails.insertMany(entryDataDetail)
                            //     .catch(function (err) {
                            //         console.log(err);
                            //     });
                            
                               
                           })
                           .catch(function (err) {
                               console.log(err);
                           });
                       }
               }
               console.log(codDetail);
               productEntry.find({PurchaseInvoiceDetail:codDetail}).then(entry=>{
                   console.log('entrdas');
                   console.log(entry);
               })

            //    if(!requiredIncome){   
            //     entryData.EntryDate=creacion;
            //     entryData.User=User;
            //     entryData.Comments="Ingreso automatico "+creacion;
            //     entryData.State=true;
            //     entryData.CodEntry=codigoEntradas;
            //     entryData.Company=companyId;
            //     entryData.save((err, entryStored)=>{
            //         if(err){
            //             console.log(err);
            
            //         }else {
            //             if(!entryStored){
            //                 console.log('no se ingreso entrada');
            
            //             }
            //             else{
            //                 let productEntryID=entryStored._id;
            //                 purchaseInvoiceDetail.find({PurchaseInvoice: invoiceId})
            //                 .then(detalle => {
            //                     if(!detalle){
            //                         res.status(404).send({message:"No hay "});
            //                     }else{
            //                         detalle.map(async item=>{
            //                         entryDataDetail.push({
            //                             PurchaseInvoiceDetail:item._id,
            //                             ProductEntry:productEntryID,
            //                             Quantity:item.Quantity,
            //                             Inventory:item.Inventory
            //                              });
            //                          })
            //                         productEntryDetails.insertMany(entryDataDetail)
            //                         .catch(function (err) {
            //                             console.log(err);
            //                         });
            //                     }
            //                 });
                            
                            
                            
            //             }
            //         }
            //     });
                            
            //   }
              res.status(200).send({invoice: invoiceUpdate});
            }
        }
    });
}
async function changeInvoiceState(req, res){
    let purchaseId = req.params.id;
    let state=req.body;
    console.log(state);
    let existPago=await PaymentToSupplier.findOne({PurchaseInvoice:purchaseId}).catch(err => {console.log(err);});
    console.log(existPago);
    if(existPago!==null){
        console.log('tiene pafgos');
        res.status(500).send({message: "Esta factura contiene pagos registrados"});
    }else{
        purchaseInvoice.findByIdAndUpdate({_id:purchaseId},state,(err,purchaseUpdate)=>{
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
 
}

function deleteInvoiceDetail(req, res){
    console.log('elimianrdetalle',req.params.id);
    let detalleid=req.params.id;
    purchaseInvoiceDetail.findByIdAndDelete(detalleid, (err, userDeleted) => {
        if (err) {
          res.status(500).send({ message: "Error del servidor." });
        } else {
          if (!userDeleted) {
            res.status(404).send({ message: "Detalle no encontrado" });
          } else {
            res.status(200).send({ userDeleted});
            console.log(userDeleted);
          }
        }
      });

}

function getSuppliersInvoicesNoPagada(req, res){

    console.log(req.params.id);
    // PaymentToSupplier.find().populate({path: 'User', model: 'User',match:{_id:req.params.id}})
    // .populate({path: 'PurchaseInvoice', model: 'PurchaseInvoice',match:{Pagada:false}, populate:{path: 'Supplier', model: 'Supplier'}})
    purchaseInvoice.find({Pagada:false,User:req.params.id}).populate({path: 'Supplier', model: 'Supplier'})
    .then(invoices => {
        if(!invoices){
            res.status(404).send({message:"No hay "});
        }else{
           
            res.status(200).send({invoices})
        }
    });
}
function getInfoInvoice(req, res){
    let userId = req.params.id; 
    let invoiceid = req.params.invoice;
    let companyId = req.params.company;
  
  
    purchaseInvoice.find({_id:invoiceid}).populate({path: 'User', model: 'User',match:{_id:userId}})
    .populate({path: 'Supplier', model: 'Supplier'}).populate('PaymentSupplierd').populate('books.$*.PaymentSupplier')
    .then(invoices => {
        if(!invoices){
            res.status(404).send({message:"No hay "});
        }else{
            console.log(invoices);
            res.status(200).send({invoices})
        }
    });

}
function getSuppliersInvoicesPendientes(req, res){
   
    console.log(req.params.id);
    // PaymentToSupplier.find().populate({path: 'User', model: 'User',match:{_id:req.params.id}})
    // .populate({path: 'PurchaseInvoice', model: 'PurchaseInvoice',match:{Pagada:false}, populate:{path: 'Supplier', model: 'Supplier'}})
    purchaseInvoice.find({Recibida:false,User:req.params.id}).populate({path: 'Supplier', model: 'Supplier'})
    .then(invoices => {
        if(!invoices){
            res.status(404).send({message:"No hay "});
        }else{
           
            res.status(200).send({invoices})
        }
    });
}
module.exports={
    getSuppliersInvoices,
    createSupplierInvoice,
    createNewSupplierInvoice,
    updateInvoicePurchase,
    getInvoiceDetails,
    deleteInvoiceDetail,
    changeInvoiceState,
    getSuppliersInvoicesPendientes,
    getSuppliersInvoicesNoPagada,
    getInfoInvoice
}

// const db = require('../config/db.config.js');;
// const sequelize = require('sequelize');
// const { Op, or } = require("sequelize");


// const PurchaseInvoice=db.PurchaseInvoice;
// const PurchaseOrder = db.PurchaseOrder;
// const PurchaseDetails= db.PurchaseDetails;
// const Supplier = db.Supplier;
// const PurchaseInvoiceDetails = db.PurchaseInvoiceDetails;
// const Inventory = db.Inventory;
// const Product = db.Product;
// const Measure = db.Measure;
// const InvoiceTaxes=db.InvoiceTaxes;
// const Company = db.Company;
// const ProductEntries=db.ProductEntries;
// const InvoiceEntriesDetails = db.InvoiceEntriesDetails;

// function getSuppliersInvoices(req, res){
//     let userId = req.params.id; 
//     let companyId = req.params.company;
//     let antCod=0;
    
//     try{
//         PurchaseInvoice.findAll({    
//              include: [
//             {
//                     model: Supplier,
//                     attributes: ['ID_Supplier','Name'],
//                     where: {ID_Company:companyId},
//                     on:{
                   
//                         ID_Supplier: sequelize.where(sequelize.col("ec_purchaseinvoice.ID_Supplier"), "=", sequelize.col("crm_suppliers.ID_Supplier")),
                     
//                      }
//                 }]
                 
//             ,
//             where: {ID_User:userId},
           
//           })
//         .then(invoices => {
//             res.status(200).send({invoices});
            
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
// async function createSupplierInvoice(req, res){
//     let invoice = {};
//     let now= new Date();
//     let creacion=now.getTime();
//     let purchaseDetalle=req.body.details;
//     let dePurchaseOrder=req.body.ordenAnt;
//     let addTaxes=req.body.impuestos;
//     let companyId = req.params.company;
//     let diasEntrega=req.body.dias;
//     let fechaInvoice=req.body.InvoiceDate;
//     let userId = req.params.id; 
//     let codigo=0;      //correlativo de la factura
//     let codIngreso=0; //correlativo del ingreso
//     let deuda=0;
    
//     //calculo fecha 
//     var date = new Date(fechaInvoice);
   
//     // date.setMonth(date.getMonth() - 1/2);
//     date.setDate(date.getDate() + diasEntrega);
//     console.log("HOLA");
    
//     let requiredIncome=await Company.findAll({attributes:['RequiredIncome'], where:{RequiredIncome:false,ID_Company:companyId}}).
//     then(function(result){return result});
    
    

//     if(requiredIncome.length > 0){
//         let entrycod=await ProductEntries.max('codentry',{ 
       
//             where: {ID_User:userId}
        
//     }).then(function(orden) {
        
//        return orden;
//     });
    
//     if(!entrycod){
//         codIngreso =1;
//     }else {codIngreso=entrycod+1}

//     console.log("INGRESO NO REQUERIDOOOOOOO");
//     }
//     // console.log(codIngreso);

//     let codigoPurchase=await PurchaseInvoice.max('codInvoice',{  //codigo factura=correlativo
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

//     let supplierId=req.body.ID_Supplier
//     let deudaProveedor=await Supplier.findAll({ 
//         where:{	ID_Supplier:supplierId},
//         attributes: ['DebsToPay']
//     });
//     console.log(deudaProveedor);
//     for(let i=0; i<deudaProveedor.length;i++){
//        deuda=deudaProveedor[i].dataValues.DebsToPay;
//     }
    
    
//     try{
//         let details={};
//         let deOrden={};
//         let impuestos={};
//         let entryProduct={};
//         let invoiceEntriesD={};
//         //asignando valores 
//         orden.ID_PurchaseOrder=req.body.PurchaseOrder;
//         orden.InvoiceDate=req.body.InvoiceDate;
//         orden.ID_Supplier=req.body.ID_Supplier;
//         orden.InvoiceNumber=req.body.InvoiceNumber;
//         orden.CreationDate= creacion;
//         orden.Total=req.body.Total;
//         orden.ID_User=req.body.ID_User;
//         orden.DeliverDay=date;
//         orden.State='Creada'; 
//         orden.PurchaseNumber=req.body.PurchaseNumber;
//         orden.Comments=req.body.Description; 
//         orden.InvoiceComments	=req.body.InvoiceComments;
//         orden.Pagada=false;
//         orden.Recibida=requiredIncome.length > 0?true:false;
//         orden.codInvoice=codigo;
//         console.log(orden);
//         // Save to MySQL database
//     PurchaseInvoice.create(orden)  //Creacion de factura #1
//       .then(async result => {    
//         res.status(200).json(result);
//         let idPurchase=result.ID_PurchaseInvoice;
//         //agregando deuda a proveedor de
//         let updateDeuda={
//             DebsToPay: parseFloat(deuda)+parseFloat(req.body.Total)
//         };
        
//         let updateDeudaProveedor = await Supplier.update(updateDeuda,
//             {             
//               where: {ID_Supplier:supplierId},
//               attributes: ['DebsToPay']
//             }
//           );
//           //id de la factura recien creada
//         if(idPurchase){
//             if(addTaxes.length > 0){
//                 for(const item of addTaxes){
//                     impuestos.ID_PurchaseInvoice =idPurchase;
//                     impuestos.ID_Taxes =item.id;
//                     impuestos.Monto=item.monto;
//                     InvoiceTaxes.create(impuestos).catch(err => {return err.message})
//                 }  
//             }
            
//             if(purchaseDetalle.length > 0){    //se crea a partir de la orden de compra
//                 for(const item of purchaseDetalle){
//                     console.log(item.Name);
//                     details.ProductName=item.Name;
//                     details.ID_PurchaseInvoice=idPurchase;
//                     details.Quantity=parseFloat(item.Quantity) ;
//                     details.Discount=parseFloat(item.Discount);
//                     details.Price=parseFloat(item.Price);
//                     details.ID_Inventory =item.ID_Inventory;
//                     details.Ingresados=requiredIncome.length > 0?parseFloat(item.Quantity):0;
//                     details.State=requiredIncome.length > 0?1:0;
//                     details.SubTotal=parseFloat((item.Quantity*item.Price)-(item.Quantity*item.Price)*item.Discount)
//                     console.log(details);
//                     PurchaseInvoiceDetails.create(details).then(async result=>{
//                         if(!result){
//                             res.status(500).send({message:"Error al ingresar el detalle de la orden"});
//                         }
                        
//                     }).catch(err=>{
//                         console.log(err);
//                      return err.message;
//                  });
//                  }
//                  if(requiredIncome.length > 0){
//                     entryProduct.EntryDate=creacion;
//                     entryProduct.ID_User=userId;
//                     entryProduct.Comments="Ingreso generado automaticamente "+creacion;
//                     entryProduct.State=0;
//                     entryProduct.codentry=codIngreso;
//                     console.log(entryProduct);
//                     ProductEntries.create(entryProduct).then(async result=>{
//                        let entryId=result.ID_ProductEntry;
//                        if(entryId){
//                           const factDetalle=await PurchaseInvoiceDetails.findAll({where:{ID_PurchaseInvoice:idPurchase}}).then(function(result){
//                            return result;
//                           }); 
//                           console.log(factDetalle);
//                           Object.assign({},factDetalle);
                       
                        
//                         for(var i=0;i<factDetalle.length;i++){
//                             console.log(factDetalle[i].dataValues. ID_PurchaseInvoiceDetail);
//                             let inventarioId=factDetalle[i].dataValues.ID_Inventory;
//                             let cantidadI=factDetalle[i].dataValues.Quantity;
//                             invoiceEntriesD.ID_PurchaseInvoiceDetail=factDetalle[i].dataValues.ID_PurchaseInvoiceDetail;
//                             invoiceEntriesD.ID_ProductEntry=entryId;
//                             invoiceEntriesD.Quantity=factDetalle[i].dataValues.Quantity;
//                             invoiceEntriesD.ID_Inventory=factDetalle[i].dataValues.ID_Inventory;
//                             InvoiceEntriesDetails.create(invoiceEntriesD).then(async result => {
//                                 let invenrotyExist = await  Inventory.findAll({
//                                     include: [
//                                         {
//                                            model:Product,
//                                            attributes: [],
//                                            on: {
//                                             ID_Products: sequelize.where(sequelize.col("ec_inventory.ID_Products"), "=", sequelize.col("crm_products.ID_Products"))
//                                            }
//                                         }
//                                     ],
//                                     attributes: ['Stock'],
//                                     where: {ID_Inventory:inventarioId}
//                                 }).then(orders => {
//                                     return orders
//                                 });
//                                 cantidad=parseFloat(invenrotyExist[0].dataValues.Stock) + parseFloat(cantidadI);
//                                 console.log(cantidad);
//                                 let updateStock={
//                                     Stock :cantidad
                                       
//                                 }
//                                 let inventario = await Inventory.update(updateStock,
//                                     {             
//                                       where: {ID_Inventory : inventarioId, ID_Bodega:8},
//                                       attributes: ['Stock','inventory']
//                                     }
//                                   );
//                             });
//                         }
                       
//                        }
//                     })
                    
//                 }
//             }
//             if(dePurchaseOrder.length > 0){
//                 for(const item of dePurchaseOrder){
//                 deOrden.ProductName=item.ec_purchasedetail.ProductName;
//                 deOrden.ID_PurchaseInvoice =idPurchase;
//                 deOrden.Quantity=parseFloat(item.ec_purchasedetail.Quantity) ;
//                 deOrden.Discount=parseFloat(item.ec_purchasedetail.Discount);
//                 deOrden.Price=parseFloat(item.crm_products.BuyPrice);
//                 deOrden.ID_Inventory =item.ID_Inventory;
//                 deOrden.Ingresados=requiredIncome.length > 0?parseFloat(item.ec_purchasedetail.Quantity):0;
//                 deOrden.State=requiredIncome.length > 0?1:0;
//                 deOrden.SubTotal=parseFloat((item.ec_purchasedetail.Quantity*item.crm_products.BuyPrice)-(item.ec_purchasedetail.Quantity*item.crm_products.BuyPrice)*item.ec_purchasedetail.Discount);
//                 PurchaseInvoiceDetails.create(deOrden).then(async result=>{
//                     if(!result){res.status(500).send({message:"Error al ingresar el detalle de la orden"});}
//                     }).catch(err=>{
//                         console.log(err);
//                     return err.message;
//                     });
                    
//                 }
//                 if(requiredIncome.length > 0){
//                     entryProduct.EntryDate=creacion;
//                     entryProduct.ID_User=userId;
//                     entryProduct.Comments="Ingreso generado automaticamente "+creacion;
//                     entryProduct.State=0;
//                     entryProduct.codentry=codIngreso;
//                     console.log(entryProduct);
//                     ProductEntries.create(entryProduct).then(async result=>{
//                        let entryId=result.ID_ProductEntry;
//                        if(entryId){
//                           const factDetalle=await PurchaseInvoiceDetails.findAll({where:{ID_PurchaseInvoice:idPurchase}}).then(function(result){
//                            return result;
//                           }); 
//                           console.log(factDetalle);
//                           Object.assign({},factDetalle);
                       
                        
//                         for(var i=0;i<factDetalle.length;i++){
//                             console.log(factDetalle[i].dataValues. ID_PurchaseInvoiceDetail);
//                             let inventarioId=factDetalle[i].dataValues.ID_Inventory;
//                             let cantidadI=factDetalle[i].dataValues.Quantity;
//                             invoiceEntriesD.ID_PurchaseInvoiceDetail=factDetalle[i].dataValues.ID_PurchaseInvoiceDetail;
//                             invoiceEntriesD.ID_ProductEntry=entryId;
//                             invoiceEntriesD.Quantity=factDetalle[i].dataValues.Quantity;
//                             invoiceEntriesD.ID_Inventory=factDetalle[i].dataValues.ID_Inventory;
//                             InvoiceEntriesDetails.create(invoiceEntriesD).then(async result => {
//                                 let invenrotyExist = await  Inventory.findAll({
//                                     include: [
//                                         {
//                                            model:Product,
//                                            attributes: [],
//                                            on: {
//                                             ID_Products: sequelize.where(sequelize.col("ec_inventory.ID_Products"), "=", sequelize.col("crm_products.ID_Products"))
//                                            }
//                                         }
//                                     ],
//                                     attributes: ['Stock'],
//                                     where: {ID_Inventory:inventarioId}
//                                 }).then(orders => {
//                                     return orders
//                                 });
//                                 cantidad=parseFloat(invenrotyExist[0].dataValues.Stock) + parseFloat(cantidadI);
//                                 console.log(cantidad);
//                                 let updateStock={
//                                     Stock :cantidad
                                       
//                                 }
//                                 let inventario = await Inventory.update(updateStock,
//                                     {             
//                                       where: {ID_Inventory : inventarioId, ID_Bodega:8},
//                                       attributes: ['Stock','inventory']
//                                     }
//                                   );
//                             });
//                         }
                       
//                        }
//                     })
                    
//                 }
               
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

// async function createNewSupplierInvoice(req, res){
//     let orden = {};
//     let now= new Date();
//     let creacion=now.getTime();
//     let purchaseDetalle=req.body.details;
//     let addTaxes=req.body.impuestos;
//     let companyId = req.params.company;
//     let userId = req.params.id; 
//     let codigo=0;      //correlativo de la factura
//     let codIngreso=0; //correlativo del ingreso
//     let deuda=0;
//     let diasEntrega=req.body.dias;
//     let fechaInvoice=req.body.InvoiceDate;

//     var date = new Date(fechaInvoice);
//     console.log(date);
//     // date.setMonth(date.getMonth() - 1/2);
//     date.setDate(date.getDate() + diasEntrega);
//     console.log("HOLA");
//     console.log(date);
//     console.log(diasEntrega);
//     console.log(companyId);
//     let requiredIncome=await Company.findByPk(companyId,{attributes:['RequiredIncome'], where:{RequiredIncome:false}}).then(function(result){return result});
//     console.log(requiredIncome);
   
//     if(requiredIncome.length > 0){
//         let entrycod=await ProductEntries.max('codentry',{ 
       
//             where: {ID_User:userId}
        
//     }).then(function(orden) {
        
//        return orden;
//     });
    
//     if(!entrycod){
//         codIngreso =1;
//     }else {codIngreso=entrycod+1}

//     console.log("INGRESO NO REQUERIDOOOOOOO");
//     }
//     console.log(codIngreso);
//     let codigoPurchase=await PurchaseInvoice.max('codInvoice',{ 
//         include: [
//             {
//                 model: PurchaseOrder,
//                 include: [
//                     {
//                         model:Supplier,
//                         attributes: ['ID_Supplier','Name'],
//                         where: {ID_Company:companyId},
//                     }
//                 ]
                 
//              }
//             ],
//             where: {ID_User:userId}, 
        
//     }).then(function(orden) {
        
//        return orden;
//     });
    
//     if(!codigoPurchase){
//         codigo =1;
//     }else {codigo=codigoPurchase+1}
    
//     let supplierId=req.body.ID_Supplier
//     let deudaProveedor=await Supplier.findAll({ 
//         where:{	ID_Supplier:supplierId},
//         attributes: ['DebsToPay']
//     });
//     console.log(deudaProveedor);
//     for(let i=0; i<deudaProveedor.length;i++){
//        deuda=deudaProveedor[i].dataValues.DebsToPay;
//     }
    
//     try{
//         let details={};
//         let deOrden={};
//         let impuestos={};
//         let entryProduct={};
//         let invoiceEntriesD={};
//         //asignando valores 
//         orden.InvoiceDate=req.body.InvoiceDate;
//         orden.ID_Supplier=req.body.ID_Supplier;
//         orden.InvoiceNumber=req.body.InvoiceNumber;
//         orden.CreationDate= creacion;
//         orden.Total=req.body.Total;
//         orden.ID_User=req.body.ID_User;
//         orden.DeliverDay=date;
//         orden.State='Creada'; 
//         orden.InvoiceComments	=req.body.InvoiceComments;
//         orden.Pagada=false;
//         orden.Recibida=requiredIncome.length > 0?true:false;
//         orden.codInvoice=codigo;
//         orden.Comments='';
//         console.log(orden);
//         // Save to MySQL database
//     PurchaseInvoice.create(orden)
//       .then(async result => {    
//         res.status(200).json(result);
//         let idPurchase=result.ID_PurchaseInvoice;
//         let updateDeuda={
//             DebsToPay: parseFloat(deuda)+parseFloat(req.body.Total)
//         };
        
//         let updateDeudaProveedor = await Supplier.update(updateDeuda,
//             {             
//               where: {ID_Supplier:supplierId},
//               attributes: ['DebsToPay']
//             }
//           );
//         if(idPurchase){
//             if(addTaxes.length > 0){
//                 for(const item of addTaxes){
//                     impuestos.ID_PurchaseInvoice =idPurchase;
//                     impuestos.ID_Taxes =item.id;
//                     impuestos.Monto=item.monto;
//                     InvoiceTaxes.create(impuestos).catch(err => {return err.message})
//                 }
               
//             }
//             if(purchaseDetalle.length > 0){
//                 for(const item of purchaseDetalle){
//                     console.log(item.Name);
//                     details.ProductName=item.Name;
//                     details.ID_PurchaseInvoice=idPurchase;
//                     details.Quantity=parseFloat(item.Quantity) ;
//                     details.Discount=parseFloat(item.Discount);
//                     details.Price=parseFloat(item.Price);
//                     details.ID_Inventory =item.ID_Inventory;
//                     details.Ingresados=requiredIncome.length > 0?parseFloat(item.Quantity):0;
//                     details.State=requiredIncome.length  > 0?1:0;
//                     details.SubTotal=parseFloat((item.Quantity*item.Price)-(item.Quantity*item.Price)*item.Discount)
//                     console.log(details);
//                     PurchaseInvoiceDetails.create(details).then(async result=>{
//                         if(!result){res.status(500).send({message:"Error al ingresar el detalle de la orden"});}
//                     }).catch(err=>{
//                         console.log(err);
//                      return err.message;
//                  });
//                  }
//                  if(requiredIncome.length > 0){
//                     entryProduct.EntryDate=creacion;
//                     entryProduct.ID_User=userId;
//                     entryProduct.Comments="Ingreso generado automaticamente "+creacion;
//                     entryProduct.State=0;
//                     entryProduct.codentry=codIngreso;
//                     console.log(entryProduct);
//                     ProductEntries.create(entryProduct).then(async result=>{
//                        let entryId=result.ID_ProductEntry;
//                        if(entryId){
//                           const factDetalle=await PurchaseInvoiceDetails.findAll({where:{ID_PurchaseInvoice:idPurchase}}).then(function(result){
//                            return result;
//                           }); 
//                           console.log(factDetalle);
//                           Object.assign({},factDetalle);
                       
                        
//                         for(var i=0;i<factDetalle.length;i++){
//                             console.log(factDetalle[i].dataValues. ID_PurchaseInvoiceDetail);
//                             let inventarioId=factDetalle[i].dataValues.ID_Inventory;
//                             let cantidadI=factDetalle[i].dataValues.Quantity;
//                             invoiceEntriesD.ID_PurchaseInvoiceDetail=factDetalle[i].dataValues.ID_PurchaseInvoiceDetail;
//                             invoiceEntriesD.ID_ProductEntry=entryId;
//                             invoiceEntriesD.Quantity=factDetalle[i].dataValues.Quantity;
//                             invoiceEntriesD.ID_Inventory=factDetalle[i].dataValues.ID_Inventory;
//                             InvoiceEntriesDetails.create(invoiceEntriesD).then(async result => {
//                                 let invenrotyExist = await  Inventory.findAll({
//                                     include: [
//                                         {
//                                            model:Product,
//                                            attributes: [],
//                                            on: {
//                                             ID_Products: sequelize.where(sequelize.col("ec_inventory.ID_Products"), "=", sequelize.col("crm_products.ID_Products"))
//                                            }
//                                         }
//                                     ],
//                                     attributes: ['Stock'],
//                                     where: {ID_Inventory:inventarioId}
//                                 }).then(orders => {
//                                     return orders
//                                 });
//                                 cantidad=parseFloat(invenrotyExist[0].dataValues.Stock) + parseFloat(cantidadI);
//                                 console.log(cantidad);
//                                 let updateStock={
//                                     Stock :cantidad
                                       
//                                 }
//                                 let inventario = await Inventory.update(updateStock,
//                                     {             
//                                       where: {ID_Inventory : inventarioId, ID_Bodega:8},
//                                       attributes: ['Stock','inventory']
//                                     }
//                                   );
//                             });
//                         }
                       
//                        }
//                     })
                    
//                 }
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

// function getInvoiceDetails(req, res){
//     let invoiceId = req.params.id; 
//     try{
//         Inventory.findAll({
//             include: [
//                 {
//                     model: PurchaseInvoiceDetails,
//                     attributes: ['ID_PurchaseInvoiceDetail','ID_PurchaseInvoice','Quantity','Discount','ProductName','SubTotal','ID_Inventory','Ingresados','State'],
//                     on:{
                   
//                        ID_Inventory: sequelize.where(sequelize.col("ec_purchaseinvoicedetail.ID_Inventory"), "=", sequelize.col("ec_inventory.ID_Inventory")),
                    
//                     }
//                 },
//                 {
//                     model: Product,
//                     attributes: ['codproducts','ID_Measure','BuyPrice','ID_Products'],
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
//                     ]
                    
//                 }
//             ],
//             attributes: ['ID_Inventory'],
//             where:{
//                 ID_PurchaseInvoice: sequelize.where(sequelize.col("ec_purchaseinvoicedetail.ID_PurchaseInvoice"), "=", invoiceId),
//                 ID_Bodega:8
//             }
//         })
//         .then(details => {
//             res.status(200).send({details});
            
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

// async function updateInvoicePurchase(req, res){
   
//     let purchaseId = req.params.id;
    
//     let purchaseDetalle=req.body.details;
//     let detailsAnt=req.body.ordenAnt;
//     let orden={};
//     let details={};
//     //asignando valores 
//     const {Comments,DeliverDay,ID_PurchaseInvoice,InvoiceComments,InvoiceDate,Total,State,InvoiceNumber}= req.body;
//     console.log(purchaseDetalle);
  
//     try{
//         let ordenExist = await PurchaseInvoice.findByPk(purchaseId,{ attributes:['ID_PurchaseInvoice']});
       
//         if(!ordenExist){
//            // retornamos el resultado al cliente
//             res.status(404).json({
//                 message: "No se encuentra el cliente con ID = " + purchaseId,
//                 error: "404"
//             });
//         } else {    
//             // actualizamos nuevo cambio en la base de datos, definición de
//             let updatedObject = {             
              
//                Comments: Comments,
//                DeliverDay: DeliverDay,
//                InvoiceComments: InvoiceComments,
//                InvoiceDate: InvoiceDate,
//                InvoiceNumber: InvoiceNumber,
//                Total: Total,
//                State: State,
//             }
           
//             let result = await PurchaseInvoice.update(updatedObject,
//                               {            
//                                 where: {ID_PurchaseInvoice : purchaseId},
//                                 attributes: ['ID_PurchaseInvoice']
//                               }
//                             );
                            
                            
//             if (result) {
               
//                 if(detailsAnt.length > 0) {
                   
//                     for(const item of detailsAnt ){
//                         let update={
//                            Quantity: item.ec_purchaseinvoicedetail.Quantity,
//                            Discount:item.ec_purchaseinvoicedetail.Discount,
//                            Price:item.crm_product.BuyPrice,
//                            SubTotal: parseFloat((item.crm_product.BuyPrice*item.ec_purchaseinvoicedetail.Quantity)-
//                            (item.crm_product.BuyPrice*item.ec_purchaseinvoicedetail.Quantity)*item.ec_purchaseinvoicedetail.Discount)
//                         }
                      
//                         let resultUpdateD = await PurchaseInvoiceDetails.update(update,
//                             { 
//                               returning: true,                
//                               where: {[Op.and]: [
//                                 { ID_PurchaseInvoiceDetail: item.ec_purchaseinvoicedetail.ID_PurchaseInvoiceDetail },
//                                 { ID_PurchaseInvoice:item.ec_purchaseinvoicedetail.ID_PurchaseInvoice}
//                               ]},
//                               attributes: ['ID_PurchaseInvoiceDetail']
//                             }
//                           );
//                     }
//                 }    
//                  if(purchaseDetalle.length>0){  //agregando nuevo detalle a la orden ya existente
//                     console.log("AGREGAAAAANDOOOOO");
//                     console.log(req.body.details);
//                     for(const item of purchaseDetalle ){
//                         let detalleNuevo={
//                            Quantity: item.Quantity,
//                            Discount:item.Discount,
//                            Price:item.Price,
//                            SubTotal: parseFloat((item.Price*item.Quantity)-
//                            (item.Price*item.Quantity)*item.Discount),
//                            ProductName: item.Name,
//                            ID_Inventory:item.ID_Inventory,
//                            ID_PurchaseInvoice:purchaseId
//                         }
//                         console.log(detalleNuevo);
//                         PurchaseInvoiceDetails.create(detalleNuevo).then(async result=>{
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


// async function deleteInvoiceDetail(req, res){
//     console.log(req.params.id);

//     try{
//         let detailId = req.params.id;
//         let detalle= await PurchaseInvoiceDetails.findByPk(detailId,{ attributes:['ID_PurchaseInvoiceDetail']});
//         console.log(detalle);
//         if(!detalle){
//             res.status(404).json({
//                 message: "La compañia con este ID no existe = " + detailId,
//                 error: "404",
//             });
//         } else {
//             await detalle.destroy();
//             res.status(200).send({
//                 message:"Compañia eliminada con exito"
//             });
//         }
//     } catch(error) {
//         res.status(500).json({
//             message: "Error -> No se puede eliminar el detalle de la orden con el ID = " + req.params.id,
//             error: error.message
//         });
//     }
// }

// async function changeInvoiceState(req, res){
   
//     let purchaseId = req.params.id; 
//     console.log(purchaseId);
//     const {estado} = req.body;  //
  
//     try{
//         let purchase = await PurchaseInvoice.findByPk(purchaseId,{
//             attributes: ['ID_PurchaseInvoice','ID_PurchaseOrder']});
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
//                                 where: {ID_PurchaseInvoice  : purchaseId},
//                                 attributes:['ID_PurchaseInvoice' ]
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
// //no recibidas
// function getSuppliersInvoicesPendientes(req, res){
//     let userId = req.params.id; 
//     let companyId = req.params.company;
//     let antCod=0;
    
//     try{
//         PurchaseInvoice.findAll({    
//              include: [
//             {
//                     model: Supplier,
//                     attributes: ['ID_Supplier','Name'],
//                     where: {ID_Company:companyId, },
//                     on:{
                   
//                         ID_Supplier: sequelize.where(sequelize.col("ec_purchaseinvoice.ID_Supplier"), "=", sequelize.col("crm_suppliers.ID_Supplier")),
                     
//                      }
//                 }]
                 
//             ,
//             where: {ID_User:userId,Recibida:false},
           
//           })
//         .then(invoices => {
//             res.status(200).send({invoices});
            
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

// function getSuppliersInvoicesNoPagada(req, res){
//     let userId = req.params.id; 
//     let companyId = req.params.company;
//     let antCod=0;
//     console.log(userId);
//     console.log(companyId);
//     try{
//         PurchaseInvoice.findAll({    
//              include: [
//             {
//                     model: Supplier,
//                     attributes: ['ID_Supplier','Name'],
//                     where: {ID_Company:companyId},
//                     on:{
                   
//                         ID_Supplier: sequelize.where(sequelize.col("ec_purchaseinvoice.ID_Supplier"), "=", sequelize.col("crm_suppliers.ID_Supplier")),
                    
//                      }
//                 }
//             ]  
//             ,
//             where: {ID_User:userId,
//             Pagada:false},
           
//           })
//         .then(invoices => {
//             res.status(200).send({invoices});
            
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


// function getInfoInvoice(req, res){
//     let userId = req.params.id; 
//     let invoiceid = req.params.invoice;
//     let companyId = req.params.company
//     let antCod=0;
    
//     try{
//         PurchaseInvoice.findAll({    
//              include: [
//             {
//                     model: Supplier,
//                     attributes: ['ID_Supplier','Name'],
//                     where: {ID_Company:companyId},
//                     on:{
                   
//                         ID_Supplier: sequelize.where(sequelize.col("ec_purchaseinvoice.ID_Supplier"), "=", sequelize.col("crm_suppliers.ID_Supplier")),
                     
//                      }
//                 }]
                 
//             ,
//             where: {ID_User:userId, ID_PurchaseInvoice:invoiceid},
           
//           })
//         .then(invoices => {
//             res.status(200).send({invoices});
            
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
//     getSuppliersInvoices,
//     createSupplierInvoice,
//     createNewSupplierInvoice,
//     updateInvoicePurchase,
//     getInvoiceDetails,
//     deleteInvoiceDetail,
//     changeInvoiceState,
//     getSuppliersInvoicesPendientes,
//     getSuppliersInvoicesNoPagada,
//     getInfoInvoice
// }