const moment = require("moment");
const purchaseInvoice = require("../models/purchaseInvoice.model");
const purchaseInvoiceDetail = require("../models/purchaseInvoiceDetails.model");
const invoiceTaxes = require("../models/invoiceTaxes.model");
const company = require("../models/company.model");
const productEntry = require("../models/productEntries.model");
const productEntryDetails = require("../models/invoiceEntriesDetails.model");
const supplier = require("../models/supplier.model");
const purchaseOrder = require("../models/purchaseOrder.model");
const PaymentToSupplier = require('../models/paymentstoSuppliers.model');
const product= require('../models/product.model');
const inventoryTraceability = require("../models/inventorytraceability.model");
const MovementTypes = require("../models/movementtype.model");

const inventory = require('../models/inventory.model')

function getSuppliersInvoices(req, res){
    const { id,company, profile} = req.params;
    console.log("FACTURA COMPR");
    var ObjectID = require('mongodb').ObjectID
    if(profile==="Admin"){
        console.log("ENTRO A ADMIN");
        purchaseInvoice.find().populate({path: 'Supplier', model: 'Supplier', match:{Company: ObjectID(company)},
        populate: {path: 'SupplierType', model: 'SupplierType'}}).sort({CodInvoice:-1})
        .then(facturas => {
            if(!facturas){
                res.status(404).send({message:"No hay "});
            }else{
                console.log(facturas);
                var invoices = facturas.filter(function (item) {
                    return item.Supplier!==null;
                  });
                res.status(200).send({invoices})
            }
        });
    }else{
        purchaseInvoice.find({User:id}).populate({path: 'Supplier', model: 'Supplier', match:{Company: company},
        populate: {path: 'SupplierType', model: 'SupplierType'}}).sort({CodInvoice:-1})
        .then(facturas => {
            if(!facturas){
                res.status(404).send({message:"No hay "});
            }else{

                var invoices = facturas.filter(function (item) {
                    return item.Supplier!==null;
                  });
                res.status(200).send({invoices});
            }
        });
    }

}

//creacion de factura CON orden de compra
async function createSupplierInvoice(req, res){
    const invoice= new purchaseInvoice();
    const entryData1=new productEntry();


    const updateDeuda={};
    let companyId = req.params.company;

    let invoiceDetalle=req.body.details; //acá se obtiene el array de los productos nuevos es decir que NO eran parte de la orden de venta
    let dePurchaseOrder=req.body.ordenAnt; //acá se obtienen los productos que si formaban parte de la orden de venta
    let addTaxes=req.body.impuestos;  //se obtienen los impuestos que se aplicaron en la factura

    let diasEntrega=req.body.dias;  //los días de entrega del proveedor
    let fechaInvoice=req.body.InvoiceDate; //dia de facturación

    let now= new Date();
    let creacion=now.toISOString().substring(0, 10); //obtención de la fecha del sistema

    console.log(creacion);
    var date = new Date(fechaInvoice);
    console.log("fecha factura",date);

    date.setDate(date.getDate() + diasEntrega); //con esta función calculo la fecha aproximada de entrega
    console.log("dia de entrega", date);
    const {PurchaseOrder,InvoiceDate,Supplier,InvoiceNumber,CreationDate,Total,User,
    DeliverDay,Description,InvoiceComments,PurchaseNumber,tipoProveedor,SupplierName} = req.body;


    let codigo=0;
    let codigoEntradas=0;

    //para generar correlativo de factura
    let codInvoice=await purchaseInvoice.findOne({Company: companyId}).sort({CodInvoice:-1})  //para obtener el correlativo por compañia
    .populate({path: 'Supplier', model: 'Supplier', match:{Company: companyId}}).then(function(doc){
            if(doc){
                    if(doc.CodInvoice!==null){
                return(doc.CodInvoice)
            }
        }
    });
    //para generar el correctivo del ingreso en caso de que sea requerido (correlativo por empresa)
    let codEntry=await productEntry.findOne({Company:companyId}).sort({CodEntry:-1})
    .then(function(doc){
            if(doc){
                    if(doc.CodEntry!==null){
                return(doc.CodEntry)
            }
        }
    });

    //verificar si compania tiene ingreso requerido (variable booleana)
    let requiredIncome=await company.findById(companyId) //esta variable la mando a llamar luego que se ingreso factura
    .then(income => {
        if(!income){
            res.status(404).send({message:"No hay "});
        }else{
           return(income.RequieredIncome)
        }
    });

    //para verificar si la empresa tiene activo el costo promedio (variable booleana)
    let averageCost=await company.findById(companyId) //esta variable la mando a llamar luego que se ingreso factura
    .then(income => {
        if(!income){
            res.status(404).send({message:"No hay "});
        }else{
           return(income.AverageCost)
        }
    });
    console.log("COSTO PROMEDOP",averageCost);

    //obteniendo deuda actual con proveedor
    let deudaAct=await supplier.findById(Supplier) //esta variable la mando a llamar luego que se ingreso factura
    .then(deuda => {
        if(!deuda){
            res.status(404).send({message:"No hay "});
        }else{
           return(deuda.DebsToPay)
        }
    });

   //generando codigo (sumando  1 al obtenido)
    if(!codInvoice){
        codigo =1;
    }else {codigo=codInvoice+1}

    if(!codEntry){
        codigoEntradas =1;
    }else {codigoEntradas=codEntry+1}

    //creacion de objeto para ser insertado
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
    invoice.Company=companyId;
    invoice.Recibida=!requiredIncome?true:false;
    // invoice.Recibida=false;
    invoice.CodInvoice=codigo;

    updateDeuda.DebsToPay=parseFloat(deudaAct)+parseFloat(Total); //variable utilizada para recalcular deuda

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
                let invoiceN=invoiceStored.InvoiceNumber;
                //actualizar deuda
                supplier.findByIdAndUpdate({_id:Supplier},updateDeuda,(err,updateDeuda)=>{
                    if(err){
                        // res.status(500).send({message: "Error del Servidor."});
                        console.log(err);
                    }
                    else{
                        console.log("**********SE ACTUALIZO LA DEUDA*****************");
                    }
                });
                if(invoiceDetalle.length>0){
                    invoiceDetalle.map(async item => {
                    details.push({ //creacion de arreglo para guardar los detalles de la factura (nuevos productos)
                        ProductName:item.Name,
                        PurchaseInvoice:invoiceId,
                        Quantity:parseFloat(item.Quantity) ,
                        Discount:parseFloat(item.Discount),
                        Price:parseFloat(item.Price),
                        Inventory :item.Inventory,
                        SubTotal: parseFloat(item.Quantity*item.Price)- parseFloat((item.Quantity*item.Price)*item.Discount),
                        Ingresados:0,
                        State:false,
                        Measure:item.Measures,
                        CodProduct:item.codproducts,
                        SupplierName:SupplierName,
                        Product:item.ProductId
                    })
                })
                }
                if(dePurchaseOrder.length > 0){
                   dePurchaseOrder.map(async item => {
                    deOrden.push({ //creacion de arreglo para guardar los detalles de la factura (productos que venian en la orden de compra)
                        ProductName:item.ProductName,
                        PurchaseInvoice:invoiceId,
                        Quantity:parseFloat(item.Quantity) ,
                        Discount:parseFloat(item.Discount),
                        Price:parseFloat(item.Price),
                        Inventory :item.Inventory._id,
                        SubTotal: parseFloat(item.Quantity*item.Price)- parseFloat((item.Quantity*item.Price)*item.Discount),
                        Ingresados:0,
                        State:false,
                        Measure:item.Measure,
                        CodProduct:item.CodProduct,
                        SupplierName:SupplierName,
                        Product:item.Inventory.Product._id

                    })
                })
                }
                if(addTaxes.length>0){  //creando arreglo para insertar los impuestos
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
                    invoiceTaxes.insertMany(impuestos) //insertando el detalle de impuestos de la factura
                    .then(function () {

                        console.log("INSERTADOS");

                    })
                    .catch(function (err) {
                        console.log(err);
                    });
                }
                if(!requiredIncome){  //ingreso requerido=false quiere decir que las entredas se hacen junto con la factura
                    console.log('ide de la facuta',invoiceId);

                    //creacion de objeto para el registro de la entrada de producto
                    entryData1.EntryDate=creacion;
                    entryData1.User=User;
                    entryData1.Comments="Ingreso automatico "+creacion;
                    entryData1.State=true;
                    entryData1.CodEntry=codigoEntradas;
                    entryData1.Company=companyId;
                    entryData1.PurchaseInvoice=invoiceId;
                    entryData1.Supplier=SupplierName;
                    entryData1.InvoiceNumber=InvoiceNumber;
                    entryData1.save((err, entryStored)=>{
                        if(err){
                            console.log(err);

                        }else {
                            if(!entryStored){
                                console.log('no se ingreso entrada');

                            }
                            else{
                                let productEntryID=entryStored._id;
                                purchaseInvoiceDetail.find({PurchaseInvoice: invoiceId}) //mando a llamar los detalles de la factura porque estos pasaran a ser tambien los detalles de la salida
                                .then(detalle => {
                                    if(!detalle){
                                        res.status(404).send({message:"No hay "});
                                    }else{
                                        console.log(detalle);
                                        detalle.map(async item=>{ //obtenido los detalles procedo a crear el arreglo
                                        entryDataDetail.push({
                                            PurchaseInvoiceDetail:item._id,
                                            ProductEntry:productEntryID,
                                            Quantity:item.Quantity,
                                            Inventory:item.Inventory,
                                            ProductName:item.ProductName,
                                            Price:item.Price,
                                            Measure:item.Measure,
                                            CodProduct:item.CodProduct,
                                            Product:item.Product
                                             });
                                             purchaseInvoiceDetail.findByIdAndUpdate({_id: item._id},{ //tengo que indicar la cantidad de prodcutos que fueron ingresados
                                                Ingresados:parseFloat(item.Quantity),                  //en esta caso los productos se ingresan en su totalidad
                                                State:true
                                            })
                                            .catch(err => {console.log(err);});

                                            let inStock=await inventory.findOne({_id:item.Inventory},'Stock')  //variabble para conocer la cantidad actudal de productos disponibles (stck)
                                            .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                            console.log('EN STOCK:',inStock);
                                            inventory.findByIdAndUpdate({_id:item.Inventory},{
                                                Stock:parseFloat(inStock.Stock + item.Quantity),  //como se trata de un ingreso a la cantidad actual le sumo la cantidad que se ingresara de productos
                                            })                                                    //la cantidad hace referencia a la cantidad registrada en el detalle de la factura
                                            .catch(err => {console.log(err);});
                                         })
                                        productEntryDetails.insertMany(entryDataDetail).then(async function (entries){  //ingreso de los detalles de la entrada
                                            console.log("movimiento de inventario");
                                            let movementId=await MovementTypes.findOne({Name:'ingreso'},['_id'])
                                                .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

                                                //TODO MOVIMIENTO DE INVENTARIO SE TIENE QUE REGISTRAR
                                            const inventorytraceability= new inventoryTraceability();
                                            entries.map(async (item) =>{
                                                inventorytraceability.Quantity=item.Quantity;
                                                inventorytraceability.Product=item.Product;
                                                inventorytraceability.WarehouseDestination=item.Inventory; //destino (INVENTARIO)
                                                inventorytraceability.MovementType=movementId._id;
                                                inventorytraceability.MovDate=creacion;
                                                inventorytraceability.WarehouseOrigin=null; //origen (INVENTARIO)
                                                inventorytraceability.User=User;
                                                inventorytraceability.Company=companyId;
                                                inventorytraceability.DocumentId=productEntryID;
                                                inventorytraceability.ProductDestiny=null;
                                                inventorytraceability.DocumentNumber=invoiceN;  //acá se coloca el id del documnto que genero ese movimientos en esta caso el movimiento fue generado por una factura por eso se coloca el id de la factura
                                                inventorytraceability.DocType="Factura Compra";  //descripcion que le indique al usuario que se trato de una factura de compra
                                                inventorytraceability.Cost=parseFloat(item.Quantity)*parseFloat(item.Price);
                                                inventorytraceability.save((err, traceabilityStored)=>{
                                                    if(err){
                                                        console.log(err);
                                                    }else {
                                                        if(!traceabilityStored){
                                                            // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                                            console.log(traceabilityStored);
                                                        }
                                                        else{
                                                            //   res.status(200).send({orden: traceabilityStored});
                                                        }
                                                    }
                                            });

                                            })
                                        })
                                        .catch(function (err) {
                                            console.log(err);
                                        });
                                    }
                                });



                            }
                        }
                    });

                    if(averageCost){  //EN CASO QUE LA EMPRESA TENGA HABILIADO EL COSTO PROMEDIO
                        console.log('COMPAÑIA CON CO0STO PRODMEDIO ACTIVO');
                        if(dePurchaseOrder.length > 0){  //PARA LOS PRDDUCTOS QUE VIENE EN LA ORDEN DE COMPRA
                              dePurchaseOrder.map(async item => {
                                console.log(item.totalImpuestos);
                                console.log(item.total);
                                console.log(item.Price);
                                console.log(item.Inventory.Stock);
                                //CALCULO DEL COSTO PROMEDIO
                                let facturaProveedor=tipoProveedor==='CreditoFiscal'? item.totalImpuestos:item.total;
                                let fact1=(item.Inventory.Stock*item.Price)+facturaProveedor;
                                let fact2=parseFloat(item.Inventory.Stock)+parseFloat(item.Quantity);
                                console.log(fact2);
                                console.log(fact1);
                                costo=parseFloat((fact1)/(fact2));
                                let costoprom={
                                    AverageCost : parseFloat(averageCost?parseFloat(costo):
                                    (item.proveedorType==='CreditoFiscal'? item.totalImpuestos:item.total ))

                                }
                                //FIN DEL CALCULO
                                console.log('costo promedio prodcutos orden',costo);
                                product.updateMany({_id: item.Inventory._id},costoprom)     //ACTUALIZAMOS EL COSTO PROMEDIO DEL PRODUCTO
                                .then(function () {
                                    console.log("Se actualizo costo promedio de orden");
                                })
                                .catch(function (err) {
                                    console.log(err);
                                });

                            })
                        }

                        if(invoiceDetalle.length>0){
                            invoiceDetalle.map(item => { //PARA LOS PRODUCTOS NUEVOS
                                console.log(item.totalImpuestos);
                                console.log(item.total);
                                console.log(item.Price);
                                console.log('stock',item.Stock);
                                //CALCULO DEL COSTO PROMEDIO
                                let facturaProveedor=tipoProveedor==='CreditoFiscal'? item.totalImpuestos:item.total;
                                let fact1=parseFloat((item.Stock*item.Price)+facturaProveedor);
                                let fact2=parseFloat(item.Stock)+parseFloat(item.Quantity);
                                console.log('fact1',fact2);
                                console.log('fact2',fact1);
                                costo=parseFloat((fact1)/(fact2));
                                let costoprom={
                                    AverageCost : parseFloat(averageCost?parseFloat(costo):
                                    (tipoProveedor==='CreditoFiscal'? item.totalImpuestos:item.total ))

                                }
                                //FIN DEL CALCULO
                                console.log('costo promedio prodcutos nuevows',costo);

                                product.updateMany({_id: item.ProductId},costoprom)    //ACTUALIZAMOS EL VALOR DEL COSTO PROMEDIO
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

               //CAMBIAMOS EL ESTADO DE LA ORDEN DE COMPRA A FACTURADA
                purchaseOrder.findByIdAndUpdate({_id:PurchaseOrder},{State:'Facturada'},(err,updateDeuda)=>{
                    if(err){
                        res.status(500).send({message: "Error del Servidor."});
                        console.log(err);
                    }
                });
               //ACTUALIZAMOS LA DEUDA CON EL PROVEEDOR
                let totalDeuda=parseFloat(Total)+parseFloat(deudaAct);
                supplier.findByIdAndUpdate({_id:Supplier},{DebsToPay:(totalDeuda).toFixed(2)},(err,updateDeuda)=>{
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

async function createNewSupplierInvoice(req, res){  //creacion de factura sin orden de compra
    const invoice= new purchaseInvoice();
    const entryData=new productEntry();

    let companyId = req.params.company;
    let userId = req.params.id;
    let invoiceDetalle=req.body.details; //detalle de los productos que componen la factura
    let addTaxes=req.body.impuestos;

    let diasEntrega=req.body.dias;
    let fechaInvoice=req.body.InvoiceDate;

    let now= new Date();
    let creacion=now.toISOString().substring(0, 10);

    console.log(invoiceDetalle);
    var date = new Date(fechaInvoice);
   console.log("fecha factura",date);
   date.setDate(date.getDate() + diasEntrega); //calculo de le fecha de entrega
   console.log("dia de entrega", date);


    const {PurchaseOrder,InvoiceDate,Supplier,InvoiceNumber,Total,User
        ,Description,InvoiceComments,PurchaseNumber,tipoProveedor,SupplierName} = req.body;
    //para generar el correctivo del ingreso en caso de que sea requerido (correlativo por compañia )
    let codEntry=await productEntry.findOne({Company:companyId}).sort({CodEntry:-1})
    .then(function(doc){
            if(doc){
                    if(doc.CodEntry!==null){
                return(doc.CodEntry)
            }
        }
    });

    let codInvoice=await purchaseInvoice.findOne({Company: companyId}).sort({CodInvoice:-1})  //codigo correlativo de la factura por compañia
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
    //verificar si la compañia tiene habilitado el calculo de costo promedio
    let averageCost=await company.findById(companyId) //esta variable la mando a llamar luego que se ingreso factura
    .then(income => {
        if(!income){
            res.status(404).send({message:"No hay "});
        }else{
           return(income.AverageCost)
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

   //geneacion del correlativo
    if(!codInvoice){
        codigo =1;
    }else {codigo=codInvoice+1}

    if(!codEntry){
        codigoEntradas =1;
    }else {codigoEntradas=codEntry+1}



    let details=[];
    let impuestos=[];
    let entryDataDetail=[];

    //creando objeto a insertar
    invoice.PurchaseOrder=PurchaseOrder?PurchaseOrder:null;
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
    invoice.Company=companyId;

    invoice.Recibida=!requiredIncome?true:false;
    // invoice.Recibida=false;
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
                let invoiceN=invoiceStored.InvoiceNumber;
                 console.log(invoiceStored);
                if(invoiceDetalle.length>0){
                    invoiceDetalle.map(async item => {
                    details.push({   //creacion del arreglo de objetos (detalle de prodcutos de la factura)
                        ProductName:item.Name,
                        PurchaseInvoice:invoiceId,
                        Quantity:parseFloat(item.Quantity) ,
                        Discount:parseFloat(item.Discount),
                        Price:parseFloat(item.Price),
                        Inventory :item.Inventory,
                        SubTotal: parseFloat(item.Quantity*item.Price)- parseFloat((item.Quantity*item.Price)*item.Discount),
                        Ingresados:0,
                        State:0,
                        Measure:item.Measures,
                        CodProduct:item.codproducts,
                        SupplierName:SupplierName,
                        Product:item.ProductId
                    })
                })
                }
                if(addTaxes.length>0){  // creacion de arreglo para ingresas los impuestos
                    addTaxes.map(async item => {
                        impuestos.push({
                            PurchaseInvoice:invoiceId,
                            Taxes:item.id,
                            Monto:item.monto
                    })
                })
                }

                if(details.length>0){   //guardando detalles de  la factura (productios)
                    purchaseInvoiceDetail.insertMany(details)
                    .then(function () {

                        console.log("INSERTADOS");

                    })
                    .catch(function (err) {
                        console.log(err);
                    });
                }
                if(impuestos.length>0){
                    invoiceTaxes.insertMany(impuestos)  //guardando impuestos
                    .then(function () {

                        console.log("INSERTADOS");

                    })
                    .catch(function (err) {
                        console.log(err);
                    });
                }

                if(!requiredIncome){    //si ingreso requerido =falso entonces se registra entrada de producto al generar la factura
                    entryData.EntryDate=creacion;
                    entryData.User=User;
                    entryData.Comments="Ingreso automatico "+creacion;
                    entryData.State=true;
                    entryData.CodEntry=codigoEntradas;
                    entryData.Company=companyId;
                    entryData.PurchaseInvoice=invoiceId;
                    entryData.Supplier=SupplierName;
                    entryData.InvoiceNumber=InvoiceNumber;
                    entryData.save((err, entryStored)=>{
                        if(err){
                            console.log(err);

                        }else {
                            if(!entryStored){
                                console.log('no se ingreso entrada');

                            }
                            else{
                                let productEntryID=entryStored._id;
                                purchaseInvoiceDetail.find({PurchaseInvoice: invoiceId})  //obtenemos detalle de factura para proceder a ingresarlo como detalles del ingreso
                                .then(detalle => {
                                    if(!detalle){
                                        res.status(404).send({message:"No hay "});
                                    }else{
                                        detalle.map(async item=>{
                                         entryDataDetail.push({  //creando arreglo de  los detalles obtenidos
                                            PurchaseInvoiceDetail:item._id,
                                            ProductEntry:productEntryID,
                                            Quantity:item.Quantity,
                                            Inventory:item.Inventory,
                                            Measure:item.Measure,
                                            CodProduct:item.CodProduct,
                                            ProductName:item.ProductName,
                                            Product:item.Product,
                                            Price:item.Price
                                             });

                                             //cambiamos la cantidad de productos ingresados en el detalle de la factura

                                            purchaseInvoiceDetail.findByIdAndUpdate({_id: item._id},{
                                                Ingresados:parseFloat(item.Quantity),  //la cantidad es la totalidad
                                                State:true
                                            })
                                            .catch(err => {console.log(err);});

                                            let inStock=await inventory.findOne({_id:item.Inventory},'Stock')  //stock actual del producto
                                            .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                            console.log('EN STOCK:',inStock);
                                            inventory.findByIdAndUpdate({_id:item.Inventory},{  //ingresamos a inventario el producto
                                                Stock:parseFloat(inStock.Stock + item.Quantity),
                                            })
                                            .catch(err => {console.log(err);});
                                         })
                                        productEntryDetails.insertMany(entryDataDetail).then(async function (entries) {
                                            console.log("movimiento de inventario");
                                            console.log(entries);
                                            let movementId=await MovementTypes.findOne({Name:'ingreso'},['_id'])
                                                .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                            const inventorytraceability= new inventoryTraceability();
                                            let transInventario=[];
                                            entries.map(async (item) =>{
                                                transInventario.push({  ///llenaamos arreglo para registrar el movimiento
                                                  Quantity:item.Quantity,
                                                  Product:item.Product,
                                                  WarehouseDestination:item.Inventory, //destino
                                                  MovementType:movementId._id,
                                                  MovDate:creacion,
                                                  WarehouseOrigin:null, //origen
                                                  User:User,
                                                  Company:companyId,
                                                  DocumentId:productEntryID,
                                                  ProductDestiny:null,
                                                  Cost:parseFloat(item.Quantity)*parseFloat(item.Price),
                                                  DocumentNumber:invoiceN,
                                                  DocType:"Factura Compra" ,
                                                })



                                            })
                                            inventoryTraceability.insertMany(transInventario).then(async function (entries) {
                                                if(!entries){
                                                      console.log("NO INSERTO TRANSACCION DE INVENTARIO");
                                                }else {

                                                        console.log(entries);

                                                }
                                             });

                                        })
                                        .catch(function (err) {
                                            console.log(err);
                                        });
                                    }
                                });




                            }
                        }
                    });

                    if(averageCost){  //si la compañia tiene habilitado el costo promedio
                

                        if(invoiceDetalle.length>0){
                            invoiceDetalle.map(item => {
                                console.log(item.totalImpuestos);
                                console.log(item.total);
                                console.log(item.Price);
                                console.log('stock',item.Stock);
                                //CALCULO DEL COSTO PROMEDIO
                                let facturaProveedor=tipoProveedor==='CreditoFiscal'? item.totalImpuestos:item.total;
                                let fact1=parseFloat((item.Stock*item.Price)+facturaProveedor);
                                let fact2=parseFloat(item.Stock)+parseFloat(item.Quantity);
                                console.log('fact1',fact2);
                                console.log('fact2',fact1);
                                costo=parseFloat((fact1)/(fact2));
                                let costoprom={
                                    AverageCost : parseFloat(averageCost?parseFloat(costo):
                                    (tipoProveedor==='CreditoFiscal'? item.totalImpuestos:item.total ))

                                }
                                console.log('costo promedio prodcutos nuevows',costo);
                                //fin
                                product.updateMany({_id: item.ProductId},costoprom)  //actualizamos costo promedio
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

                //actualizamos deuda con el proveedor
                let totalDeuda=parseFloat(Total)+parseFloat(deudaAct);
                supplier.findByIdAndUpdate({_id:Supplier},{DebsToPay:(totalDeuda).toFixed(2)},(err,updateDeuda)=>{
                    if(err){
                        // res.status(500).send({message: "Error del Servidor."});
                        console.log(err);
                        console.log(err);
                    }else{
                        console.log("DEUDA ACTUATILZADA",updateDeuda);
                    }
                });

                res.status(200).send({ invoiceStored});
            }
        }
    });
}

function getInvoiceDetails(req, res){
    //estas funciones se usan más que todo cuando se tiene un select y se selecciona una factura o al momento de editarlar para que se muestren sus detalles
    let invoiceId = req.params.id;
    purchaseInvoiceDetail.find({PurchaseInvoice:invoiceId}).populate({path: 'Inventory', model: 'Inventory',
    populate:({path: 'Bodega', model: 'Bodega', match:{Name:'Principal'}}),
    populate:({path: 'Product',model:'Product',
    populate:{path: 'Measure',model:'Measure'}}
    )}).populate({path: 'PurchaseInvoice', model:'PurchaseInvoice'})
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
    let invoiceDetalle=req.body.details; //detalle de productos nuevos
    let detailsAnt=req.body.ordenAnt;  //se obtiene los detalles que viene de la orden
    let companyId=req.body.Company;
    let updateInvoice={};
    let tipoProveedor=req.body.tipoProveedor;
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
     
     //verificar tiene costo promedio habilitado
     let averageCost=await company.findById(companyId) //esta variable la mando a llamar luego que se ingreso factura
     .then(income => {
         if(!income){
             res.status(404).send({message:"No hay "});
         }else{
            return(income.AverageCost)
         }
     });
     let existPago=await PaymentToSupplier.findOne({PurchaseInvoice:invoiceId}).catch(err => {console.log(err);});
     if(existPago!==null){
        console.log('tiene pafgos');
        res.status(500).send({message: "Esta factura contiene pagos registrados"});
    }else{
                purchaseInvoice.findByIdAndUpdate({_id:invoiceId},updateInvoice,async (err,invoiceUpdate)=>{
                if(err){
                    res.status(500).send({message: "Error del Servidor."});
                   
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

                            detailsAnt.map(async item => { //generando arreglo de los elementos de la orden de compra
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
                            invoiceDetalle.map(async item => {  //detalles nuevos
                            detalle.push({
                                ProductName:item.Name,
                                PurchaseInvoice:invoiceId,
                                Quantity:parseFloat(item.Quantity) ,
                                Discount:parseFloat(item.Discount),
                                Price:parseFloat(item.Price),
                                Inventory :item.Inventory,
                                Measure:item.Measures,
                                CodProduct:item.codproducts,
                                SubTotal: parseFloat(item.Quantity*item.Price)- parseFloat((item.Quantity*item.Price)*item.Discount),
                            })
                            });
                            console.log(detalle);
                            if(detalle.length>0){
                                purchaseInvoiceDetail.insertMany(detalle)
                                .then(async function (detalleStored) {
                                    console.log(detalleStored);
                                    console.log("INSERTADOS");
                                    if(!requiredIncome){
                                        let entryDataDetail=[];

                                       let entryId=await productEntry.findOne({PurchaseInvoice:invoiceId})
                                        .then(entry=>{
                                           if(entry!==null){
                                               return entry._id;
                                           }else {return null}

                                        }).catch(err => {console.log(err);})
                                        console.log('id de la entrada:' ,entryId);
                                       if(entryId!==null){
                                        detalleStored.map(async item=>{
                                            entryDataDetail.push({  //arreglo para rgistrar entrada de producto
                                                PurchaseInvoiceDetail:item._id,
                                                ProductEntry:entryId,
                                                Quantity:item.Quantity,
                                                Inventory:item.Inventory,
                                                ProductName:item.ProductName,
                                                Price:item.Price,
                                                Measure:item.Measure,
                                                CodProduct:item.CodProduct,
                                                    });
                                                })
                                            console.log(entryDataDetail);
                                            productEntryDetails.insertMany(entryDataDetail)
                                            .catch(function (err) {
                                                console.log(err);
                                            });

                                       }
                                       

                                       //calculo de costo promedio se hace tanto para el arreglo que contiene los productos de la orden y los nuevos
                                       if(averageCost){
                                        console.log('COMPAÑIA CON CO0STO PRODMEDIO ACTIVO');
                                        if(detailsAnt.length > 0){
                                            detailsAnt.map(async item => {
                                                console.log(item.totalImpuestos);
                                                console.log(item.total);
                                                console.log(item.Price);
                                                console.log(item.Inventory.Stock);
                                                let facturaProveedor=tipoProveedor==='CreditoFiscal'? item.totalImpuestos:item.total;
                                                let fact1=(item.Inventory.Stock*item.Price)+facturaProveedor;
                                                let fact2=parseFloat(item.Inventory.Stock)+parseFloat(item.Quantity);
                                                console.log(fact2);
                                                console.log(fact1);
                                                costo=parseFloat((fact1)/(fact2));
                                                let costoprom={
                                                    AverageCost : parseFloat(averageCost?parseFloat(costo):
                                                    (tipoProveedor==='CreditoFiscal'? item.totalImpuestos:item.total ))

                                                }
                                                console.log('costo promedio prodcutos orden',costo);
                                                console.log('productId',item.Inventory.Product._id);
                                                product.updateMany({_id: item.Inventory.Product._id},costoprom)
                                                .then(function () {
                                                    console.log("Se actualizo costo promedio de orden");
                                                })
                                                .catch(function (err) {
                                                    console.log(err);
                                                });

                                            })
                                        }

                                        if(invoiceDetalle.length>0){
                                            invoiceDetalle.map(item => {
                                                console.log(item.totalImpuestos);
                                                console.log(item.total);
                                                console.log(item.Price);
                                                console.log('stock',item.Stock);
                                                let facturaProveedor=tipoProveedor==='CreditoFiscal'? item.totalImpuestos:item.total;
                                                let fact1=parseFloat((item.Stock*item.Price)+facturaProveedor);
                                                let fact2=parseFloat(item.Stock)+parseFloat(item.Quantity);
                                                console.log('fact1',fact2);
                                                console.log('fact2',fact1);
                                                costo=parseFloat((fact1)/(fact2));
                                                let costoprom={
                                                    AverageCost : parseFloat(averageCost?parseFloat(costo):
                                                    (tipoProveedor==='CreditoFiscal'? item.totalImpuestos:item.total ))

                                                }
                                                console.log('costo promedio prodcutos nuevows',costo);

                                                product.updateMany({_id: item.ProductId},costoprom)
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


                    res.status(200).send({invoice: invoiceUpdate});
                    }
                }
            });
    }

}

async function changeInvoiceState(req, res){
    let purchaseId = req.params.id;
    let companyId=req.params.company
    let state=req.body;
    console.log(state);
    console.log(purchaseId);

    //verificar ingreso requerido
    let requiredIncome=await company.findById(companyId) //esta variable la mando a llamar luego que se ingreso factura
    .then(income => {
        if(!income){
            res.status(404).send({message:"No hay "});
        }else{
           return(income.RequieredIncome)
        }
    });
    let existPago=await PaymentToSupplier.findOne({PurchaseInvoice:purchaseId}).catch(err => {console.log(err);});
    let existIngreso=await productEntry.findOne({PurchaseInvoice:purchaseId}).catch(err => {console.log(err);});

    console.log(existIngreso);
    console.log(existPago);
    
    //para validar que no se eliminen facturas que ya tienen pagos registrados
    if(existPago!==null  ){
        console.log('tiene pagos');
        if(existPago!==null){
             res.status(500).send({message: "Esta factura contiene pagos registrados"});
        }


    }
    else{
        purchaseInvoice.findByIdAndUpdate({_id:purchaseId},state,async (err,invoiceUpdate)=>{
            if(err){
                res.status(500).send({message: "Error del Servidor."});

            } else {
                if(!invoiceUpdate){
                    res.status(404).send({message: "No se actualizo registro"});
                }
                else{

                    if(invoiceUpdate.PurchaseOrder!==null){  //para cambiar el estado de la orden de compra ya que si se elimina la factura la orden de compra tiene que habilitarse para generar una factura a partir de ella si es que asi lo desea
                            purchaseOrder.findByIdAndUpdate({_id:invoiceUpdate.PurchaseOrder},{State:'Cerrada'},(err,updateDeuda)=>{
                            if(err){
                                res.status(500).send({message: "Error del Servidor."});
                                console.log(err);
                            }
                        });
                    }
                    if(!requiredIncome){  //ingreso no requerido
                        let invoiceId=invoiceUpdate._id;

                        let entry=await productEntry.findOne({PurchaseInvoice:invoiceId})  //obtenemos entreda registrada con esa factura
                        .then(function(doc){
                            if(doc){
                                    return(doc);
                            }
                        });
                        let entryDetail=await productEntryDetails.find({ProductEntry:entry._id}) //obtenemos los detalles de la entrada
                        .then(function(doc){
                            if(doc){
                                    return(doc);
                            }
                        });
                        entryDetail.map(async item => {
                            let ingresados=null;
                            let inStock=await inventory.findOne({_id:item.Inventory},'Stock')  //obtenemos el detalle actual del stock
                            .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

                            if(item.PurchaseInvoiceDetail!==null){  //obtenemos cuantos prodcutos han sido ingresados hasta el momento de ese producto en la factura
                                ingresados=await purchaseInvoiceDetail.findOne({_id:item.PurchaseInvoiceDetail})
                            .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                            }

                            let cantidad=0.0;
                            let ingresoUpdate=0.0;
                            console.log('INGRESADOS');
                            console.log(inStock);
                            console.log('+++++++++++++++');
                            //actualizar el stock y los ingresados dentro del detalle de la factura
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
                                         
                                        //actualizando la cantidad de productos ingresados
                                        purchaseInvoiceDetail.findByIdAndUpdate({_id:item.PurchaseInvoiceDetail},{
                                            Ingresados:parseFloat(ingresoUpdate),
                                            State:false
                                        })
                                        .catch(err => {console.log(err);});
                                        
                                        //se cambia no recibida la factura
                                        purchaseInvoice.findByIdAndUpdate({_id:ingresados.PurchaseInvoice},{
                                            Recibida:false,
                                        })
                                        .catch(err => {console.log(err);});
                                        
                                        //se cambia el estado de la entrada 
                                        productEntry.findByIdAndUpdate({_id:item.ProductEntry},{
                                            State:false,
                                        })
                                        .catch(err => {console.log(err);});
                                }

                            }
                            else{
                                cantidad=parseFloat(inStock.Stock-item.Quantity);
                                inventory.findByIdAndUpdate({_id:item.Inventory},{ //actualizamos el stock del inventario
                                    Stock:parseFloat(cantidad),
                                }).then(up=>{console.log(up)})
                                .catch(err => {console.log(err);});

                                productEntry.findByIdAndUpdate({_id:item.ProductEntry},{  //se cambia estado de la entrada
                                    State:false,
                                })
                                .catch(err => {console.log(err);});
                            }

                    })
                                console.log(entryDetail);
                            }

                    res.status(200).send(invoiceUpdate)
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
            //verificar mov de inventario
          }
        }
      });

}

function getSuppliersInvoicesNoPagada(req, res){

   
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

   
    purchaseInvoice.find({Recibida:false,User:req.params.id}).populate({path: 'Supplier', model: 'Supplier'})
    .then(invoices => {
        if(!invoices){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({invoices})
        }
    });
}

function getInvoiceSupplierExport(req, res){
    purchaseInvoiceDetail.find()
    .populate({path: 'PurchaseInvoice', model:'PurchaseInvoice',
     populate:({path: 'Supplier', model: 'Supplier'})
    })
    .then(details => {
        if(!details){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({details})
        }
    });
}

function getPaymentToSuppliers(req, res){
    const { id } = req.params;
    supplier.aggregate([

            {  $match:
                { $expr:

                        { $ne: [ "$DebsToPay",  0 ] },


                }
            },
            {
                $lookup: {
                from: "companies" ,
                let: {companyId: "$Company"},
                pipeline: [
                    { $match:
                        { $expr:
                            { $and:
                            [
                                { $eq: [ "$_id",  "$$companyId" ] },
                                { _id:id }
                            ]
                            }
                        }
                    },

                ],
                as: "company"
            }
        },
        {

            $lookup: {
                from: "purchaseinvoices" ,
                let: {supplierId: "$_id"},
                pipeline: [
                    { $match:
                        { $expr:
                            { $and:
                            [
                                { $eq: [ "$Supplier",  "$$supplierId" ] },
                                { $eq: [ "$Pagada", false ] },
                                { $ne: [ "$State",  "Anulada" ] },
                            ]
                            }
                        }
                    },
                    {$lookup: {
                        from: "paymentsuppliers" ,
                        let: {invoiceId: "$_id"},
                        pipeline: [
                            { $match:
                                { $expr:

                                            { $eq: [ "$PurchaseInvoice",  "$$invoiceId" ] }

                                    }
                            },

                        ],
                        as: "pagos"
                    }
                }

                ],
                as: "invoices",

            }
        },


    ])
     .then(result => {
         if(!result){
             res.status(404).send({message:"No hay "});
         }else{
            var ObjectID = require('mongodb').ObjectID
            console.log(result);
            var invoice = result.filter(function (item) {
                return (item.Company).toString()===id;
              });
             res.status(200).send({invoice})
         }
     });
}

function getInvoicesBySupplier(req, res){
    //obtener facturas por proveedor con filtrado por fecha
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
    date.setDate(date.getDate() -15);
    let fecha1=now.toISOString().substring(0, 10);
    let fecha2=date.toISOString().substring(0, 10);

    try{

        purchaseInvoice.aggregate([
            {  $match: {Supplier:ObjectID(supplierId)}},

            {
                $lookup: {
                    from:"purchaseinvoicedetails",

                    let:{ordenId:"$_id" },
                    pipeline: [
                        { $match:
                            { $expr:

                                    { $eq: [ "$PurchaseInvoice",  "$$ordenId" ] }

                                }
                            }

                    ],
                    as:"detalles",

                },



            },

        ]).then(result => {
            var order = result.filter(function (item) { //funcion filter para obteneer solo las facturas que se encuentren en el rango de fecha
                let fecha=new Date(item.CreationDate);
                
                return fecha>=f2 && fecha<=f1;
              });
              console.log(order);
            res.status(200).send(order);

        })
    }catch(error) {
      
        res.status(500).json({
            message: "Error!",
            error: error
        });
    }
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
    getInfoInvoice,
    getInvoiceSupplierExport,
    getPaymentToSuppliers,
    getInvoicesBySupplier
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

// //     let codigoPurchase=await PurchaseInvoice.max('codInvoice',{  //codigo factura=correlativo
// //         include: [
// //             {
// //                  model: Supplier,
// //                  attributes: ['ID_Supplier','Name'],
// //                  where: {ID_Company:companyId},

// //              }
// //             ],
// //             where: {ID_User:userId},

// //     }).then(function(orden) {

// //        return orden;
// //     });

// //     if(!codigoPurchase){
// //         codigo =1;
// //     }else {codigo=codigoPurchase+1}

// //     let supplierId=req.body.ID_Supplier
// //     let deudaProveedor=await Supplier.findAll({
// //         where:{	ID_Supplier:supplierId},
// //         attributes: ['DebsToPay']
// //     });
// //     console.log(deudaProveedor);
// //     for(let i=0; i<deudaProveedor.length;i++){
// //        deuda=deudaProveedor[i].dataValues.DebsToPay;
// //     }


// //     try{
// //         let details={};
// //         let deOrden={};
// //         let impuestos={};
// //         let entryProduct={};
// //         let invoiceEntriesD={};
// //         //asignando valores
// //         orden.ID_PurchaseOrder=req.body.PurchaseOrder;
// //         orden.InvoiceDate=req.body.InvoiceDate;
// //         orden.ID_Supplier=req.body.ID_Supplier;
// //         orden.InvoiceNumber=req.body.InvoiceNumber;
// //         orden.CreationDate= creacion;
// //         orden.Total=req.body.Total;
// //         orden.ID_User=req.body.ID_User;
// //         orden.DeliverDay=date;
// //         orden.State='Creada';
// //         orden.PurchaseNumber=req.body.PurchaseNumber;
// //         orden.Comments=req.body.Description;
// //         orden.InvoiceComments	=req.body.InvoiceComments;
// //         orden.Pagada=false;
// //         orden.Recibida=requiredIncome.length > 0?true:false;
// //         orden.codInvoice=codigo;
// //         console.log(orden);
// //         // Save to MySQL database
// //     PurchaseInvoice.create(orden)  //Creacion de factura #1
// //       .then(async result => {
// //         res.status(200).json(result);
// //         let idPurchase=result.ID_PurchaseInvoice;
// //         //agregando deuda a proveedor de
// //         let updateDeuda={
// //             DebsToPay: parseFloat(deuda)+parseFloat(req.body.Total)
// //         };

// //         let updateDeudaProveedor = await Supplier.update(updateDeuda,
// //             {
// //               where: {ID_Supplier:supplierId},
// //               attributes: ['DebsToPay']
// //             }
// //           );
// //           //id de la factura recien creada
// //         if(idPurchase){
// //             if(addTaxes.length > 0){
// //                 for(const item of addTaxes){
// //                     impuestos.ID_PurchaseInvoice =idPurchase;
// //                     impuestos.ID_Taxes =item.id;
// //                     impuestos.Monto=item.monto;
// //                     InvoiceTaxes.create(impuestos).catch(err => {return err.message})
// //                 }
// //             }

// //             if(purchaseDetalle.length > 0){    //se crea a partir de la orden de compra
// //                 for(const item of purchaseDetalle){
// //                     console.log(item.Name);
// //                     details.ProductName=item.Name;
// //                     details.ID_PurchaseInvoice=idPurchase;
// //                     details.Quantity=parseFloat(item.Quantity) ;
// //                     details.Discount=parseFloat(item.Discount);
// //                     details.Price=parseFloat(item.Price);
// //                     details.ID_Inventory =item.ID_Inventory;
// //                     details.Ingresados=requiredIncome.length > 0?parseFloat(item.Quantity):0;
// //                     details.State=requiredIncome.length > 0?1:0;
// //                     details.SubTotal=parseFloat((item.Quantity*item.Price)-(item.Quantity*item.Price)*item.Discount)
// //                     console.log(details);
// //                     PurchaseInvoiceDetails.create(details).then(async result=>{
// //                         if(!result){
// //                             res.status(500).send({message:"Error al ingresar el detalle de la orden"});
// //                         }

// //                     }).catch(err=>{
// //                         console.log(err);
// //                      return err.message;
// //                  });
// //                  }
// //                  if(requiredIncome.length > 0){
// //                     entryProduct.EntryDate=creacion;
// //                     entryProduct.ID_User=userId;
// //                     entryProduct.Comments="Ingreso generado automaticamente "+creacion;
// //                     entryProduct.State=0;
// //                     entryProduct.codentry=codIngreso;
// //                     console.log(entryProduct);
// //                     ProductEntries.create(entryProduct).then(async result=>{
// //                        let entryId=result.ID_ProductEntry;
// //                        if(entryId){
// //                           const factDetalle=await PurchaseInvoiceDetails.findAll({where:{ID_PurchaseInvoice:idPurchase}}).then(function(result){
// //                            return result;
// //                           });
// //                           console.log(factDetalle);
// //                           Object.assign({},factDetalle);


// //                         for(var i=0;i<factDetalle.length;i++){
// //                             console.log(factDetalle[i].dataValues. ID_PurchaseInvoiceDetail);
// //                             let inventarioId=factDetalle[i].dataValues.ID_Inventory;
// //                             let cantidadI=factDetalle[i].dataValues.Quantity;
// //                             invoiceEntriesD.ID_PurchaseInvoiceDetail=factDetalle[i].dataValues.ID_PurchaseInvoiceDetail;
// //                             invoiceEntriesD.ID_ProductEntry=entryId;
// //                             invoiceEntriesD.Quantity=factDetalle[i].dataValues.Quantity;
// //                             invoiceEntriesD.ID_Inventory=factDetalle[i].dataValues.ID_Inventory;
// //                             InvoiceEntriesDetails.create(invoiceEntriesD).then(async result => {
// //                                 let invenrotyExist = await  Inventory.findAll({
// //                                     include: [
// //                                         {
// //                                            model:Product,
// //                                            attributes: [],
// //                                            on: {
// //                                             ID_Products: sequelize.where(sequelize.col("ec_inventory.ID_Products"), "=", sequelize.col("crm_products.ID_Products"))
// //                                            }
// //                                         }
// //                                     ],
// //                                     attributes: ['Stock'],
// //                                     where: {ID_Inventory:inventarioId}
// //                                 }).then(orders => {
// //                                     return orders
// //                                 });
// //                                 cantidad=parseFloat(invenrotyExist[0].dataValues.Stock) + parseFloat(cantidadI);
// //                                 console.log(cantidad);
// //                                 let updateStock={
// //                                     Stock :cantidad

// //                                 }
// //                                 let inventario = await Inventory.update(updateStock,
// //                                     {
// //                                       where: {ID_Inventory : inventarioId, ID_Bodega:8},
// //                                       attributes: ['Stock','inventory']
// //                                     }
// //                                   );
// //                             });
// //                         }

// //                        }
// //                     })

// //                 }
// //             }
// //             if(dePurchaseOrder.length > 0){
// //                 for(const item of dePurchaseOrder){
// //                 deOrden.ProductName=item.ec_purchasedetail.ProductName;
// //                 deOrden.ID_PurchaseInvoice =idPurchase;
// //                 deOrden.Quantity=parseFloat(item.ec_purchasedetail.Quantity) ;
// //                 deOrden.Discount=parseFloat(item.ec_purchasedetail.Discount);
// //                 deOrden.Price=parseFloat(item.crm_products.BuyPrice);
// //                 deOrden.ID_Inventory =item.ID_Inventory;
// //                 deOrden.Ingresados=requiredIncome.length > 0?parseFloat(item.ec_purchasedetail.Quantity):0;
// //                 deOrden.State=requiredIncome.length > 0?1:0;
// //                 deOrden.SubTotal=parseFloat((item.ec_purchasedetail.Quantity*item.crm_products.BuyPrice)-(item.ec_purchasedetail.Quantity*item.crm_products.BuyPrice)*item.ec_purchasedetail.Discount);
// //                 PurchaseInvoiceDetails.create(deOrden).then(async result=>{
// //                     if(!result){res.status(500).send({message:"Error al ingresar el detalle de la orden"});}
// //                     }).catch(err=>{
// //                         console.log(err);
// //                     return err.message;
// //                     });

// //                 }
// //                 if(requiredIncome.length > 0){
// //                     entryProduct.EntryDate=creacion;
// //                     entryProduct.ID_User=userId;
// //                     entryProduct.Comments="Ingreso generado automaticamente "+creacion;
// //                     entryProduct.State=0;
// //                     entryProduct.codentry=codIngreso;
// //                     console.log(entryProduct);
// //                     ProductEntries.create(entryProduct).then(async result=>{
// //                        let entryId=result.ID_ProductEntry;
// //                        if(entryId){
// //                           const factDetalle=await PurchaseInvoiceDetails.findAll({where:{ID_PurchaseInvoice:idPurchase}}).then(function(result){
// //                            return result;
// //                           });
// //                           console.log(factDetalle);
// //                           Object.assign({},factDetalle);


// //                         for(var i=0;i<factDetalle.length;i++){
// //                             console.log(factDetalle[i].dataValues. ID_PurchaseInvoiceDetail);
// //                             let inventarioId=factDetalle[i].dataValues.ID_Inventory;
// //                             let cantidadI=factDetalle[i].dataValues.Quantity;
// //                             invoiceEntriesD.ID_PurchaseInvoiceDetail=factDetalle[i].dataValues.ID_PurchaseInvoiceDetail;
// //                             invoiceEntriesD.ID_ProductEntry=entryId;
// //                             invoiceEntriesD.Quantity=factDetalle[i].dataValues.Quantity;
// //                             invoiceEntriesD.ID_Inventory=factDetalle[i].dataValues.ID_Inventory;
// //                             InvoiceEntriesDetails.create(invoiceEntriesD).then(async result => {
// //                                 let invenrotyExist = await  Inventory.findAll({
// //                                     include: [
// //                                         {
// //                                            model:Product,
// //                                            attributes: [],
// //                                            on: {
// //                                             ID_Products: sequelize.where(sequelize.col("ec_inventory.ID_Products"), "=", sequelize.col("crm_products.ID_Products"))
// //                                            }
// //                                         }
// //                                     ],
// //                                     attributes: ['Stock'],
// //                                     where: {ID_Inventory:inventarioId}
// //                                 }).then(orders => {
// //                                     return orders
// //                                 });
// //                                 cantidad=parseFloat(invenrotyExist[0].dataValues.Stock) + parseFloat(cantidadI);
// //                                 console.log(cantidad);
// //                                 let updateStock={
// //                                     Stock :cantidad

// //                                 }
// //                                 let inventario = await Inventory.update(updateStock,
// //                                     {
// //                                       where: {ID_Inventory : inventarioId, ID_Bodega:8},
// //                                       attributes: ['Stock','inventory']
// //                                     }
// //                                   );
// //                             });
// //                         }

// //                        }
// //                     })

// //                 }

// //             }

// //         }
// //         else {
// //             res.status(500).send({message:"Error al ingresar orden de compra"});
// //         }
// //       }).catch(err=>{
// //         console.log(err);
// //      return err.message;
// //  });
// //     }catch(error){
// //         res.status(500).json({
// //             message: "Fail!",
// //             error: error.message
// //         });
// //     }
// // }

// // async function createNewSupplierInvoice(req, res){
// //     let orden = {};
// //     let now= new Date();
// //     let creacion=now.getTime();
// //     let purchaseDetalle=req.body.details;
// //     let addTaxes=req.body.impuestos;
// //     let companyId = req.params.company;
// //     let userId = req.params.id;
// //     let codigo=0;      //correlativo de la factura
// //     let codIngreso=0; //correlativo del ingreso
// //     let deuda=0;
// //     let diasEntrega=req.body.dias;
// //     let fechaInvoice=req.body.InvoiceDate;

// //     var date = new Date(fechaInvoice);
// //     console.log(date);
// //     // date.setMonth(date.getMonth() - 1/2);
// //     date.setDate(date.getDate() + diasEntrega);
// //     console.log("HOLA");
// //     console.log(date);
// //     console.log(diasEntrega);
// //     console.log(companyId);
// //     let requiredIncome=await Company.findByPk(companyId,{attributes:['RequiredIncome'], where:{RequiredIncome:false}}).then(function(result){return result});
// //     console.log(requiredIncome);

// //     if(requiredIncome.length > 0){
// //         let entrycod=await ProductEntries.max('codentry',{

// //             where: {ID_User:userId}

// //     }).then(function(orden) {

// //        return orden;
// //     });

// //     if(!entrycod){
// //         codIngreso =1;
// //     }else {codIngreso=entrycod+1}

// //     console.log("INGRESO NO REQUERIDOOOOOOO");
// //     }
// //     console.log(codIngreso);
// //     let codigoPurchase=await PurchaseInvoice.max('codInvoice',{
// //         include: [
// //             {
// //                 model: PurchaseOrder,
// //                 include: [
// //                     {
// //                         model:Supplier,
// //                         attributes: ['ID_Supplier','Name'],
// //                         where: {ID_Company:companyId},
// //                     }
// //                 ]

// //              }
// //             ],
// //             where: {ID_User:userId},

// //     }).then(function(orden) {

// //        return orden;
// //     });

// //     if(!codigoPurchase){
// //         codigo =1;
// //     }else {codigo=codigoPurchase+1}

// //     let supplierId=req.body.ID_Supplier
// //     let deudaProveedor=await Supplier.findAll({
// //         where:{	ID_Supplier:supplierId},
// //         attributes: ['DebsToPay']
// //     });
// //     console.log(deudaProveedor);
// //     for(let i=0; i<deudaProveedor.length;i++){
// //        deuda=deudaProveedor[i].dataValues.DebsToPay;
// //     }

// //     try{
// //         let details={};
// //         let deOrden={};
// //         let impuestos={};
// //         let entryProduct={};
// //         let invoiceEntriesD={};
// //         //asignando valores
// //         orden.InvoiceDate=req.body.InvoiceDate;
// //         orden.ID_Supplier=req.body.ID_Supplier;
// //         orden.InvoiceNumber=req.body.InvoiceNumber;
// //         orden.CreationDate= creacion;
// //         orden.Total=req.body.Total;
// //         orden.ID_User=req.body.ID_User;
// //         orden.DeliverDay=date;
// //         orden.State='Creada';
// //         orden.InvoiceComments	=req.body.InvoiceComments;
// //         orden.Pagada=false;
// //         orden.Recibida=requiredIncome.length > 0?true:false;
// //         orden.codInvoice=codigo;
// //         orden.Comments='';
// //         console.log(orden);
// //         // Save to MySQL database
// //     PurchaseInvoice.create(orden)
// //       .then(async result => {
// //         res.status(200).json(result);
// //         let idPurchase=result.ID_PurchaseInvoice;
// //         let updateDeuda={
// //             DebsToPay: parseFloat(deuda)+parseFloat(req.body.Total)
// //         };

// //         let updateDeudaProveedor = await Supplier.update(updateDeuda,
// //             {
// //               where: {ID_Supplier:supplierId},
// //               attributes: ['DebsToPay']
// //             }
// //           );
// //         if(idPurchase){
// //             if(addTaxes.length > 0){
// //                 for(const item of addTaxes){
// //                     impuestos.ID_PurchaseInvoice =idPurchase;
// //                     impuestos.ID_Taxes =item.id;
// //                     impuestos.Monto=item.monto;
// //                     InvoiceTaxes.create(impuestos).catch(err => {return err.message})
// //                 }

// //             }
// //             if(purchaseDetalle.length > 0){
// //                 for(const item of purchaseDetalle){
// //                     console.log(item.Name);
// //                     details.ProductName=item.Name;
// //                     details.ID_PurchaseInvoice=idPurchase;
// //                     details.Quantity=parseFloat(item.Quantity) ;
// //                     details.Discount=parseFloat(item.Discount);
// //                     details.Price=parseFloat(item.Price);
// //                     details.ID_Inventory =item.ID_Inventory;
// //                     details.Ingresados=requiredIncome.length > 0?parseFloat(item.Quantity):0;
// //                     details.State=requiredIncome.length  > 0?1:0;
// //                     details.SubTotal=parseFloat((item.Quantity*item.Price)-(item.Quantity*item.Price)*item.Discount)
// //                     console.log(details);
// //                     PurchaseInvoiceDetails.create(details).then(async result=>{
// //                         if(!result){res.status(500).send({message:"Error al ingresar el detalle de la orden"});}
// //                     }).catch(err=>{
// //                         console.log(err);
// //                      return err.message;
// //                  });
// //                  }
// //                  if(requiredIncome.length > 0){
// //                     entryProduct.EntryDate=creacion;
// //                     entryProduct.ID_User=userId;
// //                     entryProduct.Comments="Ingreso generado automaticamente "+creacion;
// //                     entryProduct.State=0;
// //                     entryProduct.codentry=codIngreso;
// //                     console.log(entryProduct);
// //                     ProductEntries.create(entryProduct).then(async result=>{
// //                        let entryId=result.ID_ProductEntry;
// //                        if(entryId){
// //                           const factDetalle=await PurchaseInvoiceDetails.findAll({where:{ID_PurchaseInvoice:idPurchase}}).then(function(result){
// //                            return result;
// //                           });
// //                           console.log(factDetalle);
// //                           Object.assign({},factDetalle);


// //                         for(var i=0;i<factDetalle.length;i++){
// //                             console.log(factDetalle[i].dataValues. ID_PurchaseInvoiceDetail);
// //                             let inventarioId=factDetalle[i].dataValues.ID_Inventory;
// //                             let cantidadI=factDetalle[i].dataValues.Quantity;
// //                             invoiceEntriesD.ID_PurchaseInvoiceDetail=factDetalle[i].dataValues.ID_PurchaseInvoiceDetail;
// //                             invoiceEntriesD.ID_ProductEntry=entryId;
// //                             invoiceEntriesD.Quantity=factDetalle[i].dataValues.Quantity;
// //                             invoiceEntriesD.ID_Inventory=factDetalle[i].dataValues.ID_Inventory;
// //                             InvoiceEntriesDetails.create(invoiceEntriesD).then(async result => {
// //                                 let invenrotyExist = await  Inventory.findAll({
// //                                     include: [
// //                                         {
// //                                            model:Product,
// //                                            attributes: [],
// //                                            on: {
// //                                             ID_Products: sequelize.where(sequelize.col("ec_inventory.ID_Products"), "=", sequelize.col("crm_products.ID_Products"))
// //                                            }
// //                                         }
// //                                     ],
// //                                     attributes: ['Stock'],
// //                                     where: {ID_Inventory:inventarioId}
// //                                 }).then(orders => {
// //                                     return orders
// //                                 });
// //                                 cantidad=parseFloat(invenrotyExist[0].dataValues.Stock) + parseFloat(cantidadI);
// //                                 console.log(cantidad);
// //                                 let updateStock={
// //                                     Stock :cantidad

// //                                 }
// //                                 let inventario = await Inventory.update(updateStock,
// //                                     {
// //                                       where: {ID_Inventory : inventarioId, ID_Bodega:8},
// //                                       attributes: ['Stock','inventory']
// //                                     }
// //                                   );
// //                             });
// //                         }

// //                        }
// //                     })

// //                 }
// //             }


// //         }
// //         else {
// //             res.status(500).send({message:"Error al ingresar orden de compra"});
// //         }
// //       }).catch(err=>{
// //         console.log(err);
// //      return err.message;
// //  });
// //     }catch(error){
// //         res.status(500).json({
// //             message: "Fail!",
// //             error: error.message
// //         });
// //     }
// // }


// //                     }
// //                 },
// //                 {
// //                     model: Product,
// //                     attributes: ['codproducts','ID_Measure','BuyPrice','ID_Products'],
// //                     on:{
// //                         ID_Products: sequelize.where(sequelize.col("ec_inventory.ID_Products"), "=", sequelize.col("crm_products.ID_Products")),
// //                     },
// //                         {
// //                             model:Measure,
// //                             attributes: ['Name'],
// //                             on: {
// //                                ID_Measure: sequelize.where(sequelize.col("crm_products.ID_Measure"), "=", sequelize.col("crm_products->crm_measures.ID_Measure")),

//     let orden={};
//     let details={};

//     var date = new Date(fechaInvoice);
//     console.log(date);
//     // date.setMonth(date.getMonth() - 1/2);
//     date.setDate(date.getDate() + diasEntrega);
//     console.log("HOLA");
//     console.log(date);
//     console.log(diasEntrega);
//     //asignando valores
//     const {Comments,DeliverDay,ID_PurchaseInvoice,InvoiceComments,InvoiceDate,Total,State,InvoiceNumber}= req.body;
//     console.log(purchaseDetalle);
// =======
// //     let detailsAnt=req.body.ordenAnt;
// //     let orden={};
// //     let details={};
// //     //asignando valores
// //     const {Comments,DeliverDay,ID_PurchaseInvoice,InvoiceComments,InvoiceDate,Total,State,InvoiceNumber}= req.body;
// //     console.log(purchaseDetalle);
// >>>>>>> mongodb

// //     try{
// //         let ordenExist = await PurchaseInvoice.findByPk(purchaseId,{ attributes:['ID_PurchaseInvoice']});

// //         if(!ordenExist){
// //            // retornamos el resultado al cliente
// //             res.status(404).json({
// //                 message: "No se encuentra el cliente con ID = " + purchaseId,
// //                 error: "404"
// //             });
// //         } else {
// //             // actualizamos nuevo cambio en la base de datos, definición de
// //             let updatedObject = {

// //                Comments: Comments,
// //                DeliverDay: DeliverDay,
// //                InvoiceComments: InvoiceComments,
// //                InvoiceDate: InvoiceDate,
// //                InvoiceNumber: InvoiceNumber,
// //                Total: Total,
// //                State: State,
// //             }

// //             let result = await PurchaseInvoice.update(updatedObject,
// //                               {
// //                                 where: {ID_PurchaseInvoice : purchaseId},
// //                                 attributes: ['ID_PurchaseInvoice']
// //                               }
// //                             );


// //             if (result) {

// //                 if(detailsAnt.length > 0) {

// //                     for(const item of detailsAnt ){
// //                         let update={
// //                            Quantity: item.ec_purchaseinvoicedetail.Quantity,
// //                            Discount:item.ec_purchaseinvoicedetail.Discount,
// //                            Price:item.crm_product.BuyPrice,
// //                            SubTotal: parseFloat((item.crm_product.BuyPrice*item.ec_purchaseinvoicedetail.Quantity)-
// //                            (item.crm_product.BuyPrice*item.ec_purchaseinvoicedetail.Quantity)*item.ec_purchaseinvoicedetail.Discount)
// //                         }

// //                         let resultUpdateD = await PurchaseInvoiceDetails.update(update,
// //                             {
// //                               returning: true,
// //                               where: {[Op.and]: [
// //                                 { ID_PurchaseInvoiceDetail: item.ec_purchaseinvoicedetail.ID_PurchaseInvoiceDetail },
// //                                 { ID_PurchaseInvoice:item.ec_purchaseinvoicedetail.ID_PurchaseInvoice}
// //                               ]},
// //                               attributes: ['ID_PurchaseInvoiceDetail']
// //                             }
// //                           );
// //                     }
// //                 }
// //                  if(purchaseDetalle.length>0){  //agregando nuevo detalle a la orden ya existente
// //                     console.log("AGREGAAAAANDOOOOO");
// //                     console.log(req.body.details);
// //                     for(const item of purchaseDetalle ){
// //                         let detalleNuevo={
// //                            Quantity: item.Quantity,
// //                            Discount:item.Discount,
// //                            Price:item.Price,
// //                            SubTotal: parseFloat((item.Price*item.Quantity)-
// //                            (item.Price*item.Quantity)*item.Discount),
// //                            ProductName: item.Name,
// //                            ID_Inventory:item.ID_Inventory,
// //                            ID_PurchaseInvoice:purchaseId
// //                         }
// //                         console.log(detalleNuevo);
// //                         PurchaseInvoiceDetails.create(detalleNuevo).then(async result=>{
// //                             console.log(result);
// //                             if(!result){res.status(500).send({message:"Error al ingresar el detalle de la orden"});}
// //                         }).catch(err=>{
// //                             console.log(err);
// //                          return err.message;
// //                      });
// //                     }
// //                 }

// //             }

// //             // retornamos el resultado al cliente
// //             if(!result) {
// //                 res.status(500).json({
// //                     message: "Error -> No se puede actualizar el cliente con ID = " + req.params.id,
// //                     error: "No se puede actualizar",
// //                 });
// //             }

// //             res.status(200).json(result);
// //         }
// //     } catch(error){
// //         res.status(500).json({
// //             message: "Error -> No se puede actualizar el cliente con ID = " + req.params.id,
// //             error: error.message
// //         });
// //     }
// // }


// // async function deleteInvoiceDetail(req, res){
// //     console.log(req.params.id);

// //     try{
// //         let detailId = req.params.id;
// //         let detalle= await PurchaseInvoiceDetails.findByPk(detailId,{ attributes:['ID_PurchaseInvoiceDetail']});
// //         console.log(detalle);
// //         if(!detalle){
// //             res.status(404).json({
// //                 message: "La compañia con este ID no existe = " + detailId,
// //                 error: "404",
// //             });
// //         } else {
// //             await detalle.destroy();
// //             res.status(200).send({
// //                 message:"Compañia eliminada con exito"
// //             });
// //         }
// //     } catch(error) {
// //         res.status(500).json({
// //             message: "Error -> No se puede eliminar el detalle de la orden con el ID = " + req.params.id,
// //             error: error.message
// //         });
// //     }
// // }

// // async function changeInvoiceState(req, res){

// <<<<<<< HEAD
//     let purchaseId = req.params.id;
//     console.log(purchaseId);
//     const {estado,PurchaseOrderId} = req.body;  //
//    console.log(PurchaseOrderId);
//     try{
//         let purchase = await PurchaseInvoice.findByPk(purchaseId,{
//             attributes: ['ID_PurchaseInvoice','ID_PurchaseOrder']});

//         if(!purchase){
//            // retornamos el resultado al cliente
//             res.status(404).json({
//                 message: "No se encuentra el cliente con ID = " + purchaseId,
//                 error: "404"
//             });
//         } else {
// =======
// //     let purchaseId = req.params.id;
// //     console.log(purchaseId);
// //     const {estado} = req.body;  //

// //     try{
// //         let purchase = await PurchaseInvoice.findByPk(purchaseId,{
// //             attributes: ['ID_PurchaseInvoice','ID_PurchaseOrder']});
// //         console.log(purchase.State);
// //         if(!purchase){
// //            // retornamos el resultado al cliente
// //             res.status(404).json({
// //                 message: "No se encuentra el cliente con ID = " + purchaseId,
// //                 error: "404"
// //             });
// //         } else {
// >>>>>>> mongodb

// //             // actualizamos nuevo cambio en la base de datos, definición de
// //             let updatedObject = {

// <<<<<<< HEAD
//                 State:estado
//             }

//             let result = await purchase.update(updatedObject,
//                 {
//                 returning: true,
//                 where: {ID_PurchaseInvoice  : purchaseId},
//                 attributes:['ID_PurchaseInvoice' ]
//                 }
//             ).then(async result =>{
//                 if(PurchaseOrderId!==null){
//                     console.log("ORDEN");
//                     let purchaseorder = await PurchaseOrder.findByPk(PurchaseOrderId,{
//                        attributes: ['ID_PurchaseOrder']});
//                        console.log(purchaseorder);
//                    let updateOrden = {

//                        State:'Cerrada'
//                    }

//                    let resultorden = await purchaseorder.update(updateOrden,
//                        {
//                        returning: true,
//                        where: {ID_PurchaseOrder  : PurchaseOrderId},
//                        attributes:['ID_PurchaseOrder' ]
//                        }
//                    );
//                    console.log(resultorden);
//                 }
//             });


//              if(PurchaseOrder!==null){
//                  console.log("ORDEN");
//                  let purchaseorder = await PurchaseOrder.findByPk(PurchaseOrder,{
//                     attributes: ['ID_PurchaseOrder']});
//                     console.log(purchaseorder);
//                 let updateOrden = {

//                     State:'Cerrada'
//                 }

//                 let resultorden = await purchaseorder.update(updateOrden,
//                     {
//                     returning: true,
//                     where: {ID_PurchaseOrder  : PurchaseOrder},
//                     attributes:['ID_PurchaseOrder' ]
//                     }
//                 );
//                 console.log(resultorden);
//              }

//             // retornamos el resultado al cliente
//             if(!result) {
//                 res.status(500).json({
//                     message: "Error -> No se puede actualizar el usuario con ID = " + req.params.id,
//                     error: "No se puede actualizar",
//                 });
//             }
// =======
// //                 State:estado
// //             }
// //             console.log(updatedObject);    //agregar proceso de encriptacion
// //             let result = await purchase.update(updatedObject,
// //                               {
// //                                 returning: true,
// //                                 where: {ID_PurchaseInvoice  : purchaseId},
// //                                 attributes:['ID_PurchaseInvoice' ]
// //                               }
// //                             );
// >>>>>>> mongodb

// //             // retornamos el resultado al cliente
// //             if(!result) {
// //                 res.status(500).json({
// //                     message: "Error -> No se puede actualizar el usuario con ID = " + req.params.id,
// //                     error: "No se puede actualizar",
// //                 });
// //             }

// //             res.status(200).json(result);
// //         }
// //     } catch(error){
// //         res.status(500).json({
// //             message: "Error -> No se puede actualizar el usuario con ID = " + req.params.id,
// //             error: error.message
// //         });
// //     }
// // }
// // //no recibidas
// // function getSuppliersInvoicesPendientes(req, res){
// //     let userId = req.params.id;
// //     let companyId = req.params.company;
// //     let antCod=0;

// //     try{
// //         PurchaseInvoice.findAll({
// //              include: [
// //             {
// //                     model: Supplier,
// //                     attributes: ['ID_Supplier','Name'],
// //                     where: {ID_Company:companyId, },
// //                     on:{

// //                         ID_Supplier: sequelize.where(sequelize.col("ec_purchaseinvoice.ID_Supplier"), "=", sequelize.col("crm_suppliers.ID_Supplier")),

// //                      }
// //                 }]

// //             ,
// //             where: {ID_User:userId,Recibida:false},

// //           })
// //         .then(invoices => {
// //             res.status(200).send({invoices});

// //         })
// //     }catch(error) {
// //         // imprimimos a consola
// //         console.log(error);

// //         res.status(500).json({
// //             message: "Error!",
// //             error: error
// //         });
// //     }
// // }

// // function getSuppliersInvoicesNoPagada(req, res){
// //     let userId = req.params.id;
// //     let companyId = req.params.company;
// //     let antCod=0;
// //     console.log(userId);
// //     console.log(companyId);
// //     try{
// //         PurchaseInvoice.findAll({
// //              include: [
// //             {
// //                     model: Supplier,
// //                     attributes: ['ID_Supplier','Name'],
// //                     where: {ID_Company:companyId},
// //                     on:{

// //                         ID_Supplier: sequelize.where(sequelize.col("ec_purchaseinvoice.ID_Supplier"), "=", sequelize.col("crm_suppliers.ID_Supplier")),

// //                      }
// //                 }
// //             ]
// //             ,
// //             where: {ID_User:userId,
// //             Pagada:false},

// //           })
// //         .then(invoices => {
// //             res.status(200).send({invoices});

// //         })
// //     }catch(error) {
// //         // imprimimos a consola
// //         console.log(error);

// //         res.status(500).json({
// //             message: "Error!",
// //             error: error
// //         });
// //     }
// // }


// // function getInfoInvoice(req, res){
// //     let userId = req.params.id;
// //     let invoiceid = req.params.invoice;
// //     let companyId = req.params.company
// //     let antCod=0;

// //     try{
// //         PurchaseInvoice.findAll({
// //              include: [
// //             {
// //                     model: Supplier,
// //                     attributes: ['ID_Supplier','Name'],
// //                     where: {ID_Company:companyId},
// //                     on:{

// //                         ID_Supplier: sequelize.where(sequelize.col("ec_purchaseinvoice.ID_Supplier"), "=", sequelize.col("crm_suppliers.ID_Supplier")),

// //                      }
// //                 }]

// //             ,
// //             where: {ID_User:userId, ID_PurchaseInvoice:invoiceid},

// //           })
// //         .then(invoices => {
// //             res.status(200).send({invoices});

// //         })
// //     }catch(error) {
// //         // imprimimos a consola
// //         console.log(error);

// //         res.status(500).json({
// //             message: "Error!",
// //             error: error
// //         });
// //     }
// // }

// // module.exports={
// //     getSuppliersInvoices,
// //     createSupplierInvoice,
// //     createNewSupplierInvoice,
// //     updateInvoicePurchase,
// //     getInvoiceDetails,
// //     deleteInvoiceDetail,
// //     changeInvoiceState,
// //     getSuppliersInvoicesPendientes,
// //     getSuppliersInvoicesNoPagada,
// //     getInfoInvoice
// // }