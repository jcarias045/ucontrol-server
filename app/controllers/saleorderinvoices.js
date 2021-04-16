const moment = require("moment");
const saleOrderInvoice = require("../models/saleorderinvoice.model");
const saleOrderInvoiceDetails = require("../models/saleorderinvoicedetails.model");
const saleOrders=require("../models/saleorder.model");
const saleOrderDetails = require("../models/saleorderdetail.model");
const company = require("../models/company.model");
const inventory=require("../models/inventory.model");
const inventoryTraceability = require("../models/inventorytraceability.model");
const MovementTypes = require("../models/movementtype.model");
const customerInvoice = require("../models/saleorderinvoice.model");
const customer = require("../models/customer.model");
const productOutput = require("../models/productoutput.model");
const productOutputDetail = require("../models/productoutputdetail.model");

function getSaleOrderInvoices(req, res){
    const { id,company } = req.params;
   saleOrderInvoice.find({User:id}).populate({path: 'Customer', model: 'Customer', match:{Company: company}}).sort({CodInvoice:-1})
    .then(invoices => {
        if(!invoices){
            res.status(404).send({message:"No hay "});
        }else{
            
            res.status(200).send({invoices})
        }
    });
}

async function getSaleOrdersClosed(req, res){
    const { id,company } = req.params;
     //verificar si compania tiene ingreso requerido
    //  let quotesOpenop=await Companyreg.findById(company) //esta variable la mando a llamar luego que se ingreso factura
    //  .then(income => {
    //      if(!income){
    //          res.status(404).send({message:"No hay "});
    //      }else{
    //          console.log(income);
    //         return(income.WorksOpenQuote)
    //      }
    //  });


     saleOrders.find({User:id,State:'Cerrada'}).populate({path: 'Customer', model: 'Customer', match:{Company: company}})
    .then(orders => {
        if(!orders){
            res.status(404).send({message:"No hay "});
        }else{

            res.status(200).send({orders})
        }
    });


}


function getSaleOrderInfo(req, res){
    let saleId = req.params.id;
    console.log("obteniendo info");
    saleOrders.find({_id: saleId}).populate({path: 'Customer', model: 'Customer',populate:{ path:'Discount', model:'Discount'}})
    .then(quote => {
        if(!quote){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({quote})
            console.log(quote);
        }
    });
}

function getSaleOrderDetails(req, res){
    let saleId = req.params.id;
    console.log("OBTENIENDO DETALLES");
    saleOrderDetails.find({SaleOrder:saleId}).populate({path: 'Inventory', model: 'Inventory',
    populate:({path: 'Bodega', model: 'Bodega', match:{Name:'Principal'}}),
    populate:({path: 'Product',model:'Product',populate:{path: 'Measure',model:'Measure'}})})

    .then(order => {
        if(!order){
            res.status(404).send({message:"No hay "});
            console.log(order);
        }else{
            res.status(200).send({order})
            console.log(order);
        }
    });
}


async function createSaleOrderInvoiceWithOrder(req, res){

    const SaleOrderInvoice= new saleOrderInvoice();
    const ProductOuput= new productOutput();
    let messageError=false;
    const saledetails=req.body.details;
    
    let dePurchaseOrder=req.body.ordenAnt;
    let addTaxes=req.body.impuestos;
    const detalle=[];
    let outputDataDetail=[];

    let deudor=false;
    moment.locale();
    // let creacion = moment().format('DD/MM/YYYY');
    let now= new Date();
    let fecha=now.getTime();
   
    let creacion=now.toISOString().substring(0, 10);

    const {InvoiceDate,CustomerName,SaleOrderId,CommentsSaleOrder,Total,User,companyId,InvoiceNumber,Customer,Comments,diasCredito,InvoiceComments} = req.body;

    let details=[];
    let deOrden=[];
    let impuestos=[];
   

    let codigo=0;
    let codigoSalidas=0;

    let codigoSaleOrderInvoice=await saleOrderInvoice.findOne().sort({CodInvoice:-1})
    .populate({path: 'Customer', model: 'Customer', match:{Company: companyId}}).then(function(doc){
        console.log(doc);
            if(doc){
                    if(doc.CodInvoice!==null){
                return(doc.CodInvoice)
            }
        }
    });
    //para generar el correctivo del ingreso en caso de que sea requerido
    let codOutput=await productOutput.findOne({Company:companyId}).sort({CodOutput:-1})
    .populate({path: 'Customer', model: 'Customer', match:{Company: companyId}}).then(function(doc){
            if(doc){
                    if(doc.CodOutput!==null){
                return(doc.CodOutput)
            }
        }  
    });
    //obteniendo informacion de la compañia para validar
    let companyParams=await company.findById(companyId) //esta variable la mando a llamar luego que se ingreso factura
    .then(params => {
        if(!params){
            res.status(404).send({message:"No hay "});
        }else{
            return(params)
        }
    });
    console.log(companyParams);

    //Deuda ppor cobrar actual
    let deudaAct=await customer.findOne({_id:Customer}).then(function(doc){
        console.log(doc);
            if(doc){
                    if(doc.AccountsReceivable!==null){
                return(doc.AccountsReceivable)
            }
        }
    });
    console.log("Deuda cliente",deudaAct);

    //Creacion de correlativo de doc

    if(!codigoSaleOrderInvoice){
        codigo =1;
    }else {codigo=codigoSaleOrderInvoice+1}
    
    
    if(!codOutput){
        codigoSalidas =1;
    }else {codigoSalidas=codOutput+1}
    console.log(codOutput);
    console.log("Codigo de salida",codigoSalidas);

        //++++++++++++++ verificando deudas +++++++++++++++++++
        //obtener fecha de facturas relacionadas con el cliente
        let invoices=await customerInvoice.find({Pagada:false, Customer: Customer},'CreationDate')
        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
         console.log(invoices);
        invoices.map(item =>{
            //  let date = moment(item.CreationDate).format('DD/MM/YYYY');
            console.log((item.CreationDate));
            let now= new Date();
            let fecha=now.getTime();
            var date = new Date(item.CreationDate);
            console.log(date);
            date.setDate(date.getDate() + diasCredito);
            let fechaPago=date.toISOString().substring(0, 10);
            let fechaAct=now.toISOString().substring(0, 10);
            console.log('fecha sumada',date.toISOString().substring(0, 10));
            console.log(fechaAct);
            if(fechaPago <= fechaAct){
               deudor=true;
            } else { deudor=false;}

        });

        if(deudor){
           console.log('esta en deuda');
        }else{
          console.log('agregar ingreso');
        }
     //++++++++++++++  FIN  +++++++++++++++++++
    SaleOrderInvoice.CodInvoice=codigo;
    SaleOrderInvoice.Customer=Customer;
    SaleOrderInvoice.Total=Total;
    SaleOrderInvoice.Active=true;
    SaleOrderInvoice.User=User,
    SaleOrderInvoice.CreationDate= creacion;
    SaleOrderInvoice.State='Creada';
    SaleOrderInvoice.InvoiceComments=InvoiceComments;
    SaleOrderInvoice.CommentsofSale=CommentsSaleOrder;
    SaleOrderInvoice.CustomerName=CustomerName;
    SaleOrderInvoice.SaleOrder=SaleOrderId;
    SaleOrderInvoice.InvoiceDate=InvoiceDate;
    SaleOrderInvoice.Pagada=false;
    SaleOrderInvoice.Entregada=!companyParams.RequieredOutput?true:false;
    SaleOrderInvoice.InvoiceNumber=InvoiceNumber;


    if((companyParams.OrderWithWallet && (deudor || !deudor)) || (!companyParams.OrderWithWallet && !deudor) ){
       console.log("Si entro de condicion");
        SaleOrderInvoice.save((err, SaleOrderStored)=>{
            if(err){
                res.status(500).send({message: err});

            }else {
                if(!SaleOrderStored){
                    res.status(500).send({message: "Error al crear factura."});
                    console.log(SaleOrderStored);
                }
                else{
                    console.log("INGRESOO FACT ");
                    console.log(SaleOrderStored);
                    let  invoiceId=SaleOrderStored._id;
                    let quoteId=SaleOrderStored.CustomerQuote;
                    if(invoiceId){
                        console.log("INGRESANDO DETALLES");
               

                     if(dePurchaseOrder.length > 0){
                        dePurchaseOrder.map(async item => { 
                         deOrden.push({
                             ProductName:item.ProductName,
                             SaleOrderInvoice:invoiceId,
                             Quantity:parseFloat(item.Quantity) ,
                             Discount:parseFloat(item.Discount),
                             Price:parseFloat(item.Price),
                             Inventory :item.Inventory._id,
                             SubTotal: parseFloat(item.Quantity*item.Price)- parseFloat((item.Quantity*item.Price)*item.Discount),
                             Entregados:!companyParams.RequieredOutput?item.Quantity:0,
                             State:!companyParams.RequieredOutput?true:false,
                             Measure:item.Measure,
                             CodProduct:item.CodProduct,
                             Product:item.Inventory.Product._id,
                             Entregados:!companyParams.RequieredOutput?item.Quantity:0,
                             iniQuantity:item.Quantity
                            
                         })
                     }) 
                     }
                     if(deOrden.length>0){    //insertando detalles de los detalles de la orden
                        saleOrderInvoiceDetails.insertMany(deOrden)
                        .then(function (detalles) {
                            //si ingreso no requerido 

                            if(detalles){
                                //cuenta por cobrar
                                customer.findByIdAndUpdate({_id:Customer},{
                                    AccountsReceivable:parseFloat(deudaAct)+parseFloat(Total),
                                }).then(function(update){
                                    if(!update){

                                    }
                                    else{}}).catch(err =>{console.log(err)});

                                if(!companyParams.RequieredOutput){
                                    let salidaId=null;
                                    ProductOuput.EntryDate=creacion;
                                    ProductOuput.User=User;
                                    ProductOuput.Comments="Ingreso automatico "+creacion;
                                    ProductOuput.State=true;
                                    ProductOuput.CodOutput=codigoSalidas;
                                    ProductOuput.Company=companyId;
                                    ProductOuput.SaleOrderInvoice=invoiceId;
                                    ProductOuput.Customer=Customer;
                                    ProductOuput.InvoiceNumber=InvoiceNumber;
                                    ProductOuput.save((err, outputStored)=>{
                                        if(err){
                                            console.log(err);
                                
                                        }else {
                                            if(!outputStored){
                                                console.log('no se ingreso entrada');
                                
                                            }
                                            else{
                                                let salidaId=outputStored._id;

                                                  
                                                 detalles.map(async item=>{
                                                
                                                        //obteniendo stock de producto  (bodega principal)
                                                        let infoInventary=await inventory.findOne({_id:item.Inventory},['Stock','Product'])
                                                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                                        console.log('EN STOCK:',infoInventary);

                                                        let productreserved=await inventory.findOne({Product:infoInventary.Product, _id: { $nin: infoInventary._id }},['Stock','Product'])
                                                        .populate({path: 'Bodega', model: 'Bodega', match:{Name:'Reserva'}})
                                                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                                        
                                                        //obteniendo id del movimiento de tipo reserva
                                                        let movementId=await MovementTypes.findOne({Name:'salida'},['_id'])
                                                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

                                                        if(parseFloat(infoInventary.Stock)>=parseFloat(item.Quantity) && !companyParams.AvailableReservation){
                                                                //descontando cantidad que se reservara
                                                                inventory.findByIdAndUpdate({_id:item.Inventory},{
                                                                    Stock:parseFloat(infoInventary.Stock - item.Quantity),
                                                                }).then(function(update){
                                                                    if(!update){

                                                                    }
                                                                    else{
                                                                        outputDataDetail.push({
                                                                            SaleInvoiceDetail:item._id,
                                                                            ProductOutput:salidaId,
                                                                            Quantity:item.Quantity,
                                                                            Inventory:infoInventary._id,
                                                                            ProductName:item.ProductName,
                                                                            Price:item.Price,
                                                                            Measure:item.Measure,
                                                                            CodProduct:item.CodProduct,
                                                                            Product:item.Product
                                                                             });
                                                                        productOutputDetail.insertMany(outputDataDetail) .then(function (outputStored) {
                                                                            console.log("INSERTANDO SALIDA DETALLE");
                                                                            console.log(outputStored);
                                                                                if(outputStored){
                                                                                    const inventorytraceability= new inventoryTraceability();
                                                                                    inventorytraceability.Quantity=item.Quantity;
                                                                                    inventorytraceability.Product=item.Product;
                                                                                    inventorytraceability.WarehouseDestination=null; //destino
                                                                                    inventorytraceability.MovementType=movementId._id;
                                                                                    inventorytraceability.MovDate=creacion;
                                                                                    inventorytraceability.WarehouseOrigin=item.Inventory; //origen
                                                                                    inventorytraceability.User=User;
                                                                                    inventorytraceability.Company=companyId;
                                                                                    inventorytraceability.DocumentId=invoiceId;
                                                                                    inventorytraceability.save((err, traceabilityStored)=>{
                                                                                        if(err){
                                                                                            // res.status(500).send({message: err});
                                    
                                                                                        }else {
                                                                                            if(!traceabilityStored){
                                                                                                // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                                                                                console.log(traceabilityStored);
                                                                                            }
                                                                                            else{
                                    
                                                                                            }
                                                                                        }
                                                                                    });
            
                                                                                }
                                                                        }).catch(err => console.log(err))
                                                                        console.log('id del moviminto de reserva', movementId);
                                                                        //registro de movimiento
                                                                       
                                                                        res.status(200).send({orden: detalles});
                                                                    }
                                                                })
                                                                .catch(err => {console.log(err);});

                                                                //stock de bodega de reserva
                                                                console.log(infoInventary.Product);
                    
                                                        } 
                                                        else if(parseFloat(productreserved.Stock)>=parseFloat(item.Quantity) && companyParams.AvailableReservation){
                                                            console.log("EMPRESA HABILITADA PARA RESERVAS");
                                                            console.log('BODEGA RESERVA');
                                                                console.log(productreserved);

                                                                //actualizando el stock de reserva
                                                                inventory.findByIdAndUpdate({_id:productreserved._id},{
                                                                    Stock:parseFloat(productreserved.Stock - item.Quantity),
                                                                }).then(function(update){
                                                                    if(!update){
                                                                        res.status(500).send({message: "No se actualizo inventario"});
                                                                    }else{
                                                                        outputDataDetail.push({
                                                                            SaleInvoiceDetail:item._id,
                                                                            ProductOutput:salidaId,
                                                                            Quantity:item.Quantity,
                                                                            Inventory:productreserved._id,
                                                                            ProductName:item.ProductName,
                                                                            Price:item.Price,
                                                                            Measure:item.Measure,
                                                                            CodProduct:item.CodProduct,
                                                                            Product:item.Product
                                                                             });
                                                                        productOutputDetail.insertMany(outputDataDetail) .then(function (outputStored) {
                                                                            console.log("INSERTANDO SALIDA DETALLE");
                                                                            console.log(outputStored);
                                                                                if(outputStored){
                                                                                    const inventorytraceability= new inventoryTraceability();
                                                                                    inventorytraceability.Quantity=item.Quantity;
                                                                                    inventorytraceability.Product=item.Product;
                                                                                    inventorytraceability.WarehouseDestination=null; //destino
                                                                                    inventorytraceability.MovementType=movementId._id;
                                                                                    inventorytraceability.MovDate=creacion;
                                                                                    inventorytraceability.WarehouseOrigin=productreserved._id; //origen
                                                                                    inventorytraceability.User=User;
                                                                                    inventorytraceability.Company=companyId;
                                                                                    inventorytraceability.DocumentId=invoiceId;
                                                                                    inventorytraceability.save((err, traceabilityStored)=>{
                                                                                        if(err){
                                                                                        
                                                                                            res.status(500).send({message: "No se actualizo inventario"});
                                                                                        }else {
                                                                                            if(!traceabilityStored){
                                                                                                // // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                                                                                // console.log(traceabilityStored);
                                                                                            }
                                                                                            else{
                                                                                                console.log(traceabilityStored);
                                                                                            }
                                                                                        }
                                                                                    });
                                                                                }
                                                                            }).catch(err => console.log(err));
                                                                      
                                                                        
                                                                    }
                                                                
                                                                })
                                                                .catch(err => {console.log(err);});    
                                                                
                                                        }
                                                        else{

                                                            res.status(500).send({ message: "Verificar Inventario" });
                                                            
                                                        }
                                       
                                        
                                    })


                                            }
                                        }
                                    });
                                  
                                    res.status(200).send({orden: detalles})  
                            }
                            else{
                                res.status(200).send({orden: detalles});
                            }
                            }else{
                                res.status(500).send({ message: "No se registraron detalles" });
                            }
                           
                           
                        })
                        .catch(function (err) {
                            console.log(err);
                        });
                    }
               
                    }


                }
            }
        })

    }
 
    if(!companyParams.OrderWithWallet && deudor){
        res.status(500).send({message: "No se puede registrar orden de venta a cliente"});
    }




}

async function createSaleOrderInvoice(req, res){
    const SaleOrderInvoice= new saleOrderInvoice();
    const ProductOuput= new productOutput();

    let messageError=false;
    const saledetails=req.body.details;
    
    let dePurchaseOrder=req.body.ordenAnt;
    let addTaxes=req.body.impuestos;
    const detalle=[];
    let outputDataDetail=[];

    let deudor=false;
    moment.locale();
    // let creacion = moment().format('DD/MM/YYYY');
    let now= new Date();
    let fecha=now.getTime();
   
    let creacion=now.toISOString().substring(0, 10);

    const {InvoiceDate,CustomerName,SaleOrderId,CommentsSaleOrder,Total,User,companyId,InvoiceNumber,Customer,Comments,diasCredito,InvoiceComments} = req.body;

    let details=[];
    let deOrden=[];
    let impuestos=[];
   

    let codigo=0;
    let codigoSalidas=0;

    let codigoSaleOrderInvoice=await saleOrderInvoice.findOne().sort({CodInvoice:-1})
    .populate({path: 'Customer', model: 'Customer', match:{Company: companyId}}).then(function(doc){
        console.log(doc);
            if(doc){
                    if(doc.CodInvoice!==null){
                return(doc.CodInvoice)
            }
        }
    });
    let codOutput=await productOutput.findOne({Company:companyId}).sort({CodOutput:-1})
    .populate({path: 'Customer', model: 'Customer', match:{Company: companyId}}).then(function(doc){
            if(doc){
                    if(doc.CodOutput!==null){
                return(doc.CodOutput)
            }
        }  
    });
    //obteniendo informacion de la compañia para validar
    let companyParams=await company.findById(companyId) //esta variable la mando a llamar luego que se ingreso factura
    .then(params => {
        if(!params){
            res.status(404).send({message:"No hay "});
        }else{
            return(params)
        }
    });
    console.log(companyParams);

    //Deuda ppor cobrar actual
    let deudaAct=await customer.findOne({_id:Customer}).then(function(doc){
        console.log(doc);
            if(doc){
                    if(doc.AccountsReceivable!==null){
                return(doc.AccountsReceivable)
            }
        }
    });
    console.log("Deuda cliente",deudaAct);

    //Creacion de correlativo de doc

    if(!codigoSaleOrderInvoice){
        codigo =1;
    }else {codigo=codigoSaleOrderInvoice+1}

    if(!codOutput){
        codigoSalidas =1;
    }else {codigo=codOutput +1 }

    console.log("Codigo de salida",codigoSalidas);
        //++++++++++++++ verificando deudas +++++++++++++++++++
        //obtener fecha de facturas relacionadas con el cliente
        let invoices=await customerInvoice.find({Pagada:false, Customer: Customer},'CreationDate')
        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
         console.log(invoices);
        invoices.map(item =>{
            //  let date = moment(item.CreationDate).format('DD/MM/YYYY');
            console.log((item.CreationDate));
            let now= new Date();
            let fecha=now.getTime();
            var date = new Date(item.CreationDate);
            console.log(date);
            date.setDate(date.getDate() + diasCredito);
            let fechaPago=date.toISOString().substring(0, 10);
            let fechaAct=now.toISOString().substring(0, 10);
            console.log('fecha sumada',date.toISOString().substring(0, 10));
            console.log(fechaAct);
            if(fechaPago <= fechaAct){
               deudor=true;
            } else { deudor=false;}

        });

        if(deudor){
           console.log('esta en deuda');
        }else{
          console.log('agregar ingreso');
        }
     //++++++++++++++  FIN  +++++++++++++++++++
    SaleOrderInvoice.CodInvoice=codigo;
    SaleOrderInvoice.Customer=Customer;
    SaleOrderInvoice.Total=Total;
    SaleOrderInvoice.Active=true;
    SaleOrderInvoice.User=User,
    SaleOrderInvoice.CreationDate= creacion;
    SaleOrderInvoice.State='Creada';
    SaleOrderInvoice.InvoiceComments=InvoiceComments;
    SaleOrderInvoice.CommentsofSale=" ";
    SaleOrderInvoice.CustomerName=CustomerName;
    SaleOrderInvoice.SaleOrder=null;
    SaleOrderInvoice.InvoiceDate=InvoiceDate;
    SaleOrderInvoice.Pagada=false;
    SaleOrderInvoice.Entregada=!companyParams.RequieredOutput?true:false;
    SaleOrderInvoice.InvoiceNumber=InvoiceNumber;

    if((companyParams.OrderWithWallet && (deudor || !deudor)) || (!companyParams.OrderWithWallet && !deudor) ){
       console.log("Si entro de condicion");
        SaleOrderInvoice.save((err, SaleOrderStored)=>{
            if(err){
                res.status(500).send({message: err});

            }else {
                if(!SaleOrderStored){
                    res.status(500).send({message: "Error al crear factura."});
                    console.log(SaleOrderStored);
                }
                else{
                    console.log("INGRESOO FACT ");
                    console.log(SaleOrderStored);
                    let  invoiceId=SaleOrderStored._id;
                    let quoteId=SaleOrderStored.CustomerQuote;
                    if(invoiceId){
                        console.log("INGRESANDO DETALLES");
               

                     if(saledetails.length > 0){
                        saledetails.map(async item => { 
                         deOrden.push({
                             ProductName:item.Name,
                             SaleOrderInvoice:invoiceId,
                             Quantity:parseFloat(item.Quantity) ,
                             Discount:parseFloat(item.Discount),
                             Price:parseFloat(item.Price),
                             Inventory :item.Inventory,
                             SubTotal: parseFloat(item.total),
                             State:!companyParams.RequieredOutput?true:false,
                             Measure:item.Measure,
                             CodProduct:item.CodProduct,
                             Product:item.ProductId,
                             Entregados:!companyParams.RequieredOutput?item.Quantity:0,
                             iniQuantity:item.Quantity

                         })
                     }) 
                     }
                     if(deOrden.length>0){    //insertando detalles de los detalles de la orden
                        saleOrderInvoiceDetails.insertMany(deOrden)
                        .then(function (detalles) {
                            //si ingreso no requerido 

                            if(detalles){
                                //cuenta por cobrar
                                customer.findByIdAndUpdate({_id:Customer},{
                                    AccountsReceivable:parseFloat(deudaAct)+parseFloat(Total),
                                }).then(function(update){
                                    if(!update){

                                    }
                                    else{}}).catch(err =>{console.log(err)});

                                if(!companyParams.RequieredOutput){
                                    let salidaId=null;
                                    ProductOuput.EntryDate=creacion;
                                    ProductOuput.User=User;
                                    ProductOuput.Comments="Ingreso automatico "+creacion;
                                    ProductOuput.State=true;
                                    ProductOuput.CodOutput=codigoSalidas;
                                    ProductOuput.Company=companyId;
                                    ProductOuput.SaleOrderInvoice=invoiceId;
                                    ProductOuput.Customer=Customer;
                                    ProductOuput.InvoiceNumber=InvoiceNumber;
                                    ProductOuput.save((err, outputStored)=>{
                                        if(err){
                                            console.log(err);
                                
                                        }else {
                                            if(!outputStored){
                                                console.log('no se ingreso entrada');
                                
                                            }
                                            else{
                                                let salidaId=outputStored._id;

                                                  
                                                 detalles.map(async item=>{
                                                
                                                        //obteniendo stock de producto  (bodega principal)
                                                        let infoInventary=await inventory.findOne({_id:item.Inventory},['Stock','Product'])
                                                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                                        console.log('EN STOCK:',infoInventary);

                                                        let productreserved=await inventory.findOne({Product:infoInventary.Product, _id: { $nin: infoInventary._id }},['Stock','Product'])
                                                        .populate({path: 'Bodega', model: 'Bodega', match:{Name:'Reserva'}})
                                                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                                        
                                                        //obteniendo id del movimiento de tipo reserva
                                                        let movementId=await MovementTypes.findOne({Name:'salida'},['_id'])
                                                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

                                                        if(parseFloat(infoInventary.Stock)>=parseFloat(item.Quantity) && !companyParams.AvailableReservation){
                                                                //descontando cantidad que se reservara
                                                                inventory.findByIdAndUpdate({_id:item.Inventory},{
                                                                    Stock:parseFloat(infoInventary.Stock - item.Quantity),
                                                                }).then(function(update){
                                                                    if(!update){

                                                                    }
                                                                    else{
                                                                        outputDataDetail.push({
                                                                            SaleInvoiceDetail:item._id,
                                                                            ProductOutput:salidaId,
                                                                            Quantity:item.Quantity,
                                                                            Inventory:infoInventary._id,
                                                                            ProductName:item.ProductName,
                                                                            Price:item.Price,
                                                                            Measure:item.Measure,
                                                                            CodProduct:item.CodProduct,
                                                                            Product:item.Product
                                                                             });
                                                                        productOutputDetail.insertMany(outputDataDetail) .then(function (outputStored) {
                                                                            console.log("INSERTANDO SALIDA DETALLE");
                                                                            console.log(outputStored);
                                                                                if(outputStored){
                                                                                    const inventorytraceability= new inventoryTraceability();
                                                                                    inventorytraceability.Quantity=item.Quantity;
                                                                                    inventorytraceability.Product=item.Product;
                                                                                    inventorytraceability.WarehouseDestination=null; //destino
                                                                                    inventorytraceability.MovementType=movementId._id;
                                                                                    inventorytraceability.MovDate=creacion;
                                                                                    inventorytraceability.WarehouseOrigin=item.Inventory; //origen
                                                                                    inventorytraceability.User=User;
                                                                                    inventorytraceability.Company=companyId;
                                                                                    inventorytraceability.DocumentId=invoiceId;
                                                                                    inventorytraceability.save((err, traceabilityStored)=>{
                                                                                        if(err){
                                                                                            // res.status(500).send({message: err});
                                    
                                                                                        }else {
                                                                                            if(!traceabilityStored){
                                                                                                // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                                                                                console.log(traceabilityStored);
                                                                                            }
                                                                                            else{
                                    
                                                                                            }
                                                                                        }
                                                                                    });
            
                                                                                }
                                                                        }).catch(err => console.log(err))
                                                                        console.log('id del moviminto de reserva', movementId);
                                                                        //registro de movimiento
                                                                       
                                                                        res.status(200).send({orden: detalles});
                                                                    }
                                                                })
                                                                .catch(err => {console.log(err);});

                                                                //stock de bodega de reserva
                                                                console.log(infoInventary.Product);
                    
                                                        } 
                                                        else if(parseFloat(productreserved.Stock)>=parseFloat(item.Quantity) && companyParams.AvailableReservation){
                                                            console.log("EMPRESA HABILITADA PARA RESERVAS");
                                                            console.log('BODEGA RESERVA');
                                                                console.log(productreserved);

                                                                //actualizando el stock de reserva
                                                                inventory.findByIdAndUpdate({_id:productreserved._id},{
                                                                    Stock:parseFloat(productreserved.Stock - item.Quantity),
                                                                }).then(function(update){
                                                                    if(!update){
                                                                        res.status(500).send({message: "No se actualizo inventario"});
                                                                    }else{
                                                                        outputDataDetail.push({
                                                                            SaleInvoiceDetail:item._id,
                                                                            ProductOutput:salidaId,
                                                                            Quantity:item.Quantity,
                                                                            Inventory:productreserved._id,
                                                                            ProductName:item.ProductName,
                                                                            Price:item.Price,
                                                                            Measure:item.Measure,
                                                                            CodProduct:item.CodProduct,
                                                                            Product:item.Product
                                                                             });
                                                                        productOutputDetail.insertMany(outputDataDetail) .then(function (outputStored) {
                                                                            console.log("INSERTANDO SALIDA DETALLE");
                                                                            console.log(outputStored);
                                                                                if(outputStored){
                                                                                    const inventorytraceability= new inventoryTraceability();
                                                                                    inventorytraceability.Quantity=item.Quantity;
                                                                                    inventorytraceability.Product=item.Product;
                                                                                    inventorytraceability.WarehouseDestination=null; //destino
                                                                                    inventorytraceability.MovementType=movementId._id;
                                                                                    inventorytraceability.MovDate=creacion;
                                                                                    inventorytraceability.WarehouseOrigin=productreserved._id; //origen
                                                                                    inventorytraceability.User=User;
                                                                                    inventorytraceability.Company=companyId;
                                                                                    inventorytraceability.DocumentId=invoiceId;
                                                                                    inventorytraceability.save((err, traceabilityStored)=>{
                                                                                        if(err){
                                                                                        
                                                                                            res.status(500).send({message: "No se actualizo inventario"});
                                                                                        }else {
                                                                                            if(!traceabilityStored){
                                                                                                // // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                                                                                // console.log(traceabilityStored);
                                                                                            }
                                                                                            else{
                                                                                                console.log(traceabilityStored);
                                                                                            }
                                                                                        }
                                                                                    });
                                                                                }
                                                                            }).catch(err => console.log(err));
                                                                      
                                                                        
                                                                    }
                                                                
                                                                })
                                                                .catch(err => {console.log(err);});    
                                                                
                                                        }
                                                        else{

                                                            res.status(500).send({ message: "Verificar Inventario" });
                                                            
                                                        }
                                       
                                        
                                    })


                                            }
                                        }
                                    });
                                  
                                    res.status(200).send({orden: detalles})  
                            }
                            else{
                                res.status(200).send({orden: detalles});
                            }
                            }else{
                                res.status(500).send({ message: "No se registraron detalles" });
                            }
                           
                           
                        })
                        .catch(function (err) {
                            console.log(err);
                        });
                    }
               
                    }


                }
            }
        })

    }
 
    if(!companyParams.OrderWithWallet && deudor){
        res.status(500).send({message: "No se puede registrar orden de venta a cliente"});
    }

}


function getSaleInvoiceDetails(req, res){
    let invoiceId = req.params.id; 
    saleOrderInvoiceDetails.find({SaleOrderInvoice:invoiceId}).populate({path: 'Inventory', model: 'Inventory',
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

async function updateSaleOrderInvoice(req, res){
    let invoiceId = req.params.id;
    let invoiceDetalle=req.body.details;
    let detailsAnt=req.body.ordenAnt;
    let companyId=req.body.Company;
    let updateInvoice={};
    let tipoProveedor=req.body.tipoProveedor;
    let entryDataDetail=[];
    
    updateInvoice.Customer=req.body.Customer;
    updateInvoice.InvoiceNumber=req.body.InvoiceNumber;
    updateInvoice.Total=parseFloat((req.body.Total).toFixed(2));
    updateInvoice.InvoiceComments=req.body.InvoiceComments;
    updateInvoice.InvoiceDate=req.body.InvoiceDate;
    
    let detallePrev={};
    let detalle=[];
    let idEntry;
    let outputDataDetail=[];
     
        //obteniendo informacion de la compañia para validar
        let companyParams=await company.findById(companyId) //esta variable la mando a llamar luego que se ingreso factura
        .then(params => {
            if(!params){
                res.status(404).send({message:"No hay "});
            }else{
                return(params)
            }
        });
    //  let existPago=await PaymentToSupplier.findOne({SaleOrderInvoice:invoiceId}).catch(err => {console.log(err);});
    //  if(existPago!==null){
    //     console.log('tiene pafgos');
    //     res.status(500).send({message: "Esta factura contiene pagos registrados"});
    // }else{
                saleOrderInvoice.findByIdAndUpdate({_id:invoiceId},updateInvoice,async (err,invoiceUpdate)=>{
                if(err){
                    res.status(500).send({message: "Error del Servidor."});
                    console.log(err);
                } else {
                    if(!invoiceUpdate){
                        
                        res.status(404).send({message: "No se actualizo registro"});
                    }
                    else{
                    
                        let codInvoice;
                        let idd=await saleOrderDetails.find({SaleOrder: invoiceId}).then(function(doc){
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
                            detallePrev.SubTotal=parseFloat((item.Price)*(item.Quantity))-parseFloat((item.Price)*(item.Quantity))*parseFloat(item.Discount/100)
                            saleOrderInvoiceDetails.updateMany({_id: item._id ,SaleOrderInvoice:invoiceId},detallePrev)
                                .then(function (detalles) { 
                                    if(!companyParams.RequieredOutput){

                                        productOutputDetail.findOneAndUpdate({SaleInvoiceDetail:item._id},{
                                            Quantity:parseFloat(item.Quantity),
                                            Inventory :item.Inventory._id
                                        }).then(( detalles)=>{}) ;

                                     
                                    }
                                })
                                .catch(function (err) {
                                    console.log(err);
                                });  
                         
    
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
                                SaleOrderInvoice:invoiceId,
                                Quantity:parseFloat(item.Quantity) ,
                                Discount:parseFloat(item.Discount),
                                Price:parseFloat(item.Price),
                                Inventory :item.Inventory,
                                Measure:item.Measures,
                                CodProduct:item.codproducts,
                                SubTotal: parseFloat(item.Quantity*item.Price)- parseFloat((item.Quantity*item.Price)*(item.Discount/100)),
                            })
                            });
                            console.log(detalle);
                            if(detalle.length>0){
                                saleOrderInvoiceDetails.insertMany(detalle)
                                .then(async function (detalleStored) {
                                    console.log(detalleStored);
                                    console.log("INSERTADOS");
                                    let outputId=await productOutput.findOne({SaleOrderInvoice:invoiceId})
                                    .then(entry=>{
                                       if(entry!==null){
                                           return entry._id;
                                       }else {return null}
                                        
                                    }).catch(err => {console.log(err);})
                                    console.log(invoiceId);
                                    console.log(outputId);
                                    if(!companyParams.RequieredOutput){
                                        detalleStored.map(item =>{
                                            outputDataDetail.push({
                                                SaleInvoiceDetail:item._id,
                                                ProductOutput:outputId,
                                                Quantity:item.Quantity,
                                                Inventory:item.Inventory,
                                                ProductName:item.ProductName,
                                                Price:item.Price,
                                                Measure:item.Measure,
                                                CodProduct:item.CodProduct,
                                                Product:item.Product
                                                });
                                            productOutputDetail.insertMany(outputDataDetail) .then(function (outputStored) {
                                                console.log("INSERTANDO SALIDA DETALLE");
                                                console.log(outputStored);
                                                    if(outputStored){
                                                        
                                                    }
                                            });

                                        })
                                    }
                                  
                                 
                                })
                                .catch(function (err) {
                                    console.log(err);
                                });
                            }
                    }
                    if(!companyParams.RequieredOutput){
                    console.log("CALCULOS POR INGRESO REQUERIDO");
                    saleOrderInvoiceDetails.find({SaleOrderInvoice:invoiceId}).then(function (detalles)
                    {
                        detalles.map(async item=>{

                            //obteniendo stock de producto  (bodega principal)
                            let infoInventary=await inventory.findOne({_id:item.Inventory},['Stock','Product'])
                            .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                            console.log('EN STOCK:',infoInventary);

                            let productreserved=await inventory.findOne({Product:infoInventary.Product, _id: { $nin: infoInventary._id }},['Stock','Product'])
                            .populate({path: 'Bodega', model: 'Bodega', match:{Name:'Reserva'}})
                            .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                            console.log('BODEGA RESERVA');
                            console.log(productreserved);

                             //obteniendo id del movimiento de tipo reserva
                             let movementId=await MovementTypes.findOne({Name:'salida'},['_id'])
                             .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

                            if(parseFloat(infoInventary.Stock)>=parseFloat(item.Quantity) && !companyParams.AvailableReservation){
                                    //descontando cantidad que se reservara
                                    inventory.findByIdAndUpdate({_id:item.Inventory},{
                                        Stock:parseFloat((infoInventary.Stock + parseFloat(item.iniQuantity)) - item.Quantity),
                                    }).then(result=> console.log(result))
                                    .catch(err => {console.log(err);});

                                    //stock de bodega de reserva
                                    console.log(infoInventary.Product);
                                  

            
                                    console.log('id del moviminto de reserva', movementId);
                                    //registro de movimiento
                                    const inventorytraceability= new inventoryTraceability();
                                    inventorytraceability.Quantity=item.Quantity;
                                    inventorytraceability.Product=item.Product;
                                    inventorytraceability.WarehouseDestination=productreserved._id; //destino
                                    inventorytraceability.MovementType=movementId._id;
                                    inventorytraceability.MovDate=creacion;
                                    inventorytraceability.WarehouseOrigin=item.Inventory; //origen
                                    inventorytraceability.User=User;
                                    inventorytraceability.Company=companyId;
                                    inventorytraceability.DocumentId=saleId;

                                    inventorytraceability.save((err, traceabilityStored)=>{
                                        if(err){
                                            // res.status(500).send({message: err});

                                        }else {
                                            if(!traceabilityStored){
                                                // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                                console.log(traceabilityStored);
                                            }
                                            else{
                                                saleOrderInvoiceDetails.findByIdAndUpdate({_id: item._id },{
                                                    iniQuantity:parseFloat(item.Quantity),
                                                }).then(result=> {
                                                   console.log(result);
                                                })
                                                .catch(err => {console.log(err);});

                                            }
                                        }
                                    });

                                    res.status(200).send({orden: detalles});
                            }
                            else if(parseFloat(productreserved.Stock)>=parseFloat(item.Quantity) && companyParams.AvailableReservation){
                                //descontando cantidad que se reservara
                                                      // //actualizando el stock de reserva
                                    inventory.findByIdAndUpdate({_id:productreserved._id},{
                                        Stock:parseFloat((infoInventary.Stock + parseFloat(item.iniQuantity)) - item.Quantity),
                                    }).then(result=> console.log(result))
                                    .catch(err => {console.log(err);});


                               //stock de bodega de reserva
                                console.log(infoInventary.Product);
                                console.log('id del moviminto de reserva', movementId);
                                //registro de movimiento
                                const inventorytraceability= new inventoryTraceability();
                                inventorytraceability.Quantity=item.Quantity;
                                inventorytraceability.Product=item.Product;
                                inventorytraceability.WarehouseDestination=productreserved._id; //destino
                                inventorytraceability.MovementType=movementId._id;
                                inventorytraceability.MovDate=creacion;
                                inventorytraceability.WarehouseOrigin=item.Inventory; //origen
                                inventorytraceability.User=User;
                                inventorytraceability.Company=companyId;
                                inventorytraceability.DocumentId=saleId;

                                inventorytraceability.save((err, traceabilityStored)=>{
                                    if(err){
                                        // res.status(500).send({message: err});

                                    }else {
                                        if(!traceabilityStored){
                                            // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                            console.log(traceabilityStored);
                                        }
                                        else{
                                            saleOrderInvoiceDetails.findByIdAndUpdate({_id: item._id },{
                                                iniQuantity:parseFloat(item.Quantity),
                                            }).then(result=> {
                                               console.log(result);
                                            })
                                            .catch(err => {console.log(err);});
                                        }
                                    }
                                });

                                res.status(200).send({orden: detalles});
                            }
                            else{

                                 res.status(500).send({ message: "Verificar Inventario" });
                            }

                        })

                    }).catch(function (err) {console.log(err);})
                     }
               
                    res.status(200).send({invoice: invoiceUpdate});
                    }
                }
            });
    // }
}

module.exports={
    getSaleOrderInvoices,
    getSaleOrdersClosed,
    getSaleOrderInfo,
    getSaleOrderDetails,
    createSaleOrderInvoiceWithOrder,
    createSaleOrderInvoice,
    getSaleInvoiceDetails,
    updateSaleOrderInvoice
    
}