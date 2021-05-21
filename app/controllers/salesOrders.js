const moment=require("moment");
const saleOrder = require("../models/saleorder.model");
const customerQuotes = require("../models/customerquotes.model");
const customerQuotesDetails = require("../models/customerquotesdetails.model");
const Companyreg = require("../models/company.model");
const saleOrderDetails = require("../models/saleorderdetail.model");
const company = require("../models/company.model");
const inventory=require("../models/inventory.model");
const inventoryTraceability = require("../models/inventorytraceability.model");
const MovementTypes = require("../models/movementtype.model");
const customerInvoice = require("../models/saleorderinvoice.model");


async function getSaleOrders(req, res){
    const { id,company } = req.params;
    console.log("LISTADO ORDENES");
    saleOrder.find({User:id}).populate({path: 'Customer', model: 'Customer', match:{Company: company},
     populate:{path:'Discount', model: 'Discount'}}).sort({CodSaleOrder:-1})
    .then(order => {
        if(!order){
            res.status(404).send({message:"No hay "});
        }else{

            res.status(200).send({order})
        }
    });
}

async function getSelesOrderClosed(req, res){
    const { id,company } = req.params;
     //verificar si compania tiene ingreso requerido
     let quotesOpenop=await Companyreg.findById(company) //esta variable la mando a llamar luego que se ingreso factura
     .then(income => {
         if(!income){
             res.status(404).send({message:"No hay "});
         }else{
             console.log(income);
            return(income.WorksOpenQuote)
         }
     });

    console.log(quotesOpenop);
    if(quotesOpenop){
        customerQuotes.find({User:id,State:{$in:['Cerrada','Abierta','Cerrada/Parcial']}}).populate({path: 'Customer', model: 'Customer', match:{Company: company}})
            .then(orders => {
                if(!orders){
                    res.status(404).send({message:"No hay "});
                }else{

                    res.status(200).send({orders})
                }
            });
    }else{
         customerQuotes.find({User:id,State:{$in:['Cerrada','Cerrada/Parcial']}}).populate({path: 'Customer', model: 'Customer', match:{Company: company}})
            .then(orders => {
                if(!orders){
                    res.status(404).send({message:"No hay "});
                }else{

                    res.status(200).send({orders})
                }
            });
    }

}


function getCustomerQuoteDetails(req, res){
    let quoteId = req.params.id;
    customerQuotesDetails.find({CustomerQuote:quoteId}).populate({path: 'Inventory', model: 'Inventory',
    populate:({path: 'Bodega', model: 'Bodega', match:{Name:'Principal'}}),
    populate:({path: 'Product',model:'Product',populate:{path: 'Measure',model:'Measure'}})})

    .then(order => {
        if(!order){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({order})
        }
    });
}

//para obtener informacion al momento de seleccionar una cotizacion dentro de un select
function getCustomerQuoteInfo(req, res){
    let quoteId = req.params.id;
    customerQuotes.find({_id: quoteId}).populate({path: 'Customer', model: 'Customer',populate:{ path:'Discount', model:'Discount'}})
    .then(quote => {
        if(!quote){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({quote})
        }
    });
}

async function createSaleOrder(req, res){

    const SaleOrder= new saleOrder();
    let messageError=false;
    const saledetails=req.body.details;
    const detalle=[];
    let deudor=false;
    let now= new Date();
    let creacion=now.toISOString().substring(0, 10);


    const {CodCustomerQuote,CustomerName,Description,Total,User,companyId,CustomerQuote,SubTotal,Customer,Comments,diasCredito} = req.body;



    let codigo=0;

    let codigoSaleOrder=await saleOrder.findOne().sort({CodSaleOrder:-1})
    .populate({path: 'Customer', model: 'Customer', match:{Company: companyId}}).then(function(doc){
        console.log(doc);
            if(doc){
                    if(doc.CodSaleOrder!==null){
                return(doc.CodSaleOrder)
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

    if(!codigoSaleOrder){
        codigo =1;
    }else {codigo=codigoSaleOrder+1}
        //++++++++++++++ verificando deudas +++++++++++++++++++
        //obtener fecha de facturas relacionadas con el cliente
        let invoices=await customerInvoice.find({Pagada:false, Customer: Customer},'CreationDate')
        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
        if(invoices.length>0){
            invoices.map(item =>{
            //  let date = moment(item.CreationDate).format('DD/MM/YYYY');

            let now= new Date();
            let fecha=now.getTime();
            var date = new Date(item.CreationDate);
            console.log("FECHA DE LA FACTURA",date);
            date.setDate(date.getDate() + diasCredito);
            let fechaPago=date.toISOString().substring(0, 10);
            let fechaAct=now.toISOString().substring(0, 10);
            console.log('fecha sumada',date.toISOString().substring(0, 10));
            console.log(fechaAct);
            if(fechaPago <= fechaAct){
               deudor=true;
            } else { deudor=false;}

        });
        }



        if(deudor){
           console.log('esta en deuda');
        }else{
          console.log('agregar ingreso');
        }
     //++++++++++++++  FIN  +++++++++++++++++++
    SaleOrder.CodSaleOrder=codigo;
    SaleOrder.Customer=Customer;
    SaleOrder.CodCustomerQuote=null;
    SaleOrder.Total=Total;
    SaleOrder.Active=true;
    SaleOrder.User=User,
    SaleOrder.CreationDate= creacion;
    SaleOrder.State='Abierta';
    SaleOrder.Comments=Comments;
    SaleOrder.CommentsofQuote=null;
    SaleOrder.CodCustomerSaleOrder=codigo;
    SaleOrder.CustomerName=CustomerName;
    SaleOrder.CustomerQuote=null;
    SaleOrder.AdvancePayment=false;

    console.log(companyParams.OrderWithWallet);
    console.log(saledetails);
    if(companyParams.OrderWithWallet && (deudor || !deudor) ){
        console.log("no entro");
        SaleOrder.save((err, SaleOrderStored)=>{
            if(err){
                res.status(500).send({message: err});
                console.log(err);
            }else {
                if(!SaleOrderStored){
                    res.status(500).send({message: "Error al crear el nuevo usuario."});
                    console.log(SaleOrderStored);
                }
                else{
                    let SaleOrderId=SaleOrderStored._id;

                    if(SaleOrderId){

                        saledetails.map(async item => {
                        detalle.push({
                            ProductName:item.Name,
                            SaleOrder:SaleOrderId,
                            Quantity:parseFloat(item.Quantity) ,
                            Discount:parseFloat(item.Discount),
                            Price:parseFloat(item.PrecioDescuento),
                            Inventory :item.Inventory,
                            Measure:item.Measures,
                            CodProduct:item.codproducts,
                            SubTotal: parseFloat(item.total).toFixed(2),
                            Product:item.ProductId,
                            iniQuantity:parseFloat(item.Quantity) ,
                            GrossSellPrice:parseFloat(item.Price),
                            inAdvanced:false

                        })
                     });
                     console.log(detalle);
                        if(detalle.length>0){
                            saleOrderDetails.insertMany(detalle)
                            .then(function (detalles) {
                                console.log("PROCESO DE RESERVA");
                                console.log(detalles);

                                if(companyParams.AvailableReservation){
                                    console.log("EMPRESA HABILITADA PARA RESERVAS");
                                    detalles.map(async item=>{

                                        //obteniendo stock de producto  (bodega principal)
                                        let infoInventary=await inventory.findOne({_id:item.Inventory},['Stock','Product'])
                                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                        console.log('EN STOCK:',infoInventary);

                                        if(parseFloat(infoInventary.Stock)>=parseFloat(item.Quantity)){
                                                //descontando cantidad que se reservara
                                                inventory.findByIdAndUpdate({_id:item.Inventory},{
                                                    Stock:parseFloat(infoInventary.Stock - item.Quantity),
                                                }).then(result=> console.log(result))
                                                .catch(err => {console.log(err);});

                                                //stock de bodega de reserva
                                                console.log(infoInventary.Product);
                                                let productreserved=await inventory.findOne({Product:infoInventary.Product, _id: { $nin: infoInventary._id }},['Stock','Product'])
                                                .populate({path: 'Bodega', model: 'Bodega', match:{Name:'Reserva'}})
                                                .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                                console.log('BODEGA RESERVA');
                                                console.log(productreserved);

                                                //actualizando el stock de reserva
                                                inventory.findByIdAndUpdate({_id:productreserved._id},{
                                                    Stock:parseFloat(productreserved.Stock + item.Quantity),
                                                }).then(result=> console.log(result))
                                                .catch(err => {console.log(err);});

                                                //obteniendo id del movimiento de tipo reserva
                                                let movementId=await MovementTypes.findOne({Name:'reservacion'},['_id'])
                                                .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

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
                                                inventorytraceability.DocumentId=SaleOrderId;
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

                                                // res.status(200).send({orden: detalles});
                                        }
                                        else{

                                             res.status(500).send({ message: "Verificar Inventario" });
                                        }

                                    })

                                }
                                else{
                                    res.status(200).send({orden: SaleOrderStored});
                                }




                            })
                            .catch(function (err) {
                                console.log(err);
                            });


                        }
                    }

                     res.status(200).send({orden: SaleOrderStored});
                }
            }
        })

    }

    if(!companyParams.OrderWithWallet && !deudor){
        SaleOrder.save((err, SaleOrderStored)=>{
            if(err){
                res.status(500).send({message: err});

            }else {
                if(!SaleOrderStored){
                    res.status(500).send({message: "Error al crear el nuevo usuario."});
                    console.log(SaleOrderStored);
                }
                else{
                    let SaleOrderId=SaleOrderStored._id;
                    let quoteId=SaleOrderStored.CustomerQuote;
                    if(SaleOrderId){

                        saledetails.map(async item => {
                        detalle.push({
                            ProductName:item.Name,
                            SaleOrder:SaleOrderId,
                            Quantity:parseFloat(item.Quantity) ,
                            Discount:parseFloat(item.Discount),
                            Price:parseFloat(item.Price),
                            Inventory :item.Inventory,
                            Measure:item.Measures,
                            CodProduct:item.codproducts,
                            SubTotal: parseFloat(item.total.toFixed(2)),
                            Product:item.ProductId,
                            iniQuantity:parseFloat(item.Quantity) ,
                            GrossSellPrice:parseFloat(item.Price),
                            inAdvanced:false
                        })
                     });
                     console.log(detalle);
                        if(detalle.length>0){
                            saleOrderDetails.insertMany(detalle)
                            .then(function (detalles) {
                                console.log("PROCESO DE RESERVA");
                                console.log(detalles);

                                if(companyParams.AvailableReservation){
                                    console.log("EMPRESA HABILITADA PARA RESERVAS");
                                    detalles.map(async item=>{

                                        //obteniendo stock de producto  (bodega principal)
                                        let infoInventary=await inventory.findOne({_id:item.Inventory},['Stock','Product'])
                                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                        console.log('EN STOCK:',infoInventary);

                                        if(parseFloat(infoInventary.Stock)>=parseFloat(item.Quantity)){
                                                //descontando cantidad que se reservara
                                                inventory.findByIdAndUpdate({_id:item.Inventory},{
                                                    Stock:parseFloat(infoInventary.Stock - item.Quantity),
                                                }).then(result=> console.log(result))
                                                .catch(err => {console.log(err);});

                                                //stock de bodega de reserva
                                                console.log(infoInventary.Product);
                                                let productreserved=await inventory.findOne({Product:infoInventary.Product, _id: { $nin: infoInventary._id }},['Stock','Product'])
                                                .populate({path: 'Bodega', model: 'Bodega', match:{Name:'Reserva'}})
                                                .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                                console.log('BODEGA RESERVA');
                                                console.log(productreserved);

                                                //actualizando el stock de reserva
                                                inventory.findByIdAndUpdate({_id:productreserved._id},{
                                                    Stock:parseFloat(productreserved.Stock + item.Quantity),
                                                }).then(result=> console.log(result))
                                                .catch(err => {console.log(err);});

                                                //obteniendo id del movimiento de tipo reserva
                                                let movementId=await MovementTypes.findOne({Name:'reservacion'},['_id'])
                                                .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

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
                                                inventorytraceability.DocumentId=SaleOrderId;


                                                inventorytraceability.save((err, traceabilityStored)=>{
                                                    if(err){
                                                        // res.status(500).send({message: err});

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


                                        }
                                        else{

                                             res.status(500).send({ message: "Verificar Inventario" });
                                        }

                                    })

                                }
                                else{
                                    res.status(200).send({orden: SaleOrderStored});
                                }


                                res.status(200).send({orden: SaleOrderStored});

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

async function createSaleOrderWithQuote(req, res){
   
    const SaleOrder= new saleOrder();
    let messageError=false;
    const saledetails=req.body.details;
    const detalle=[];
    let deudor=false;
    let now= new Date();
    let creacion=now.toISOString().substring(0, 10);
    console.log("CON COTIZACION",saledetails );

    const {CodCustomerQuote,CustomerName,Description,Total,User,companyId,CustomerQuote,SubTotal,Customer,Comments,diasCredito} = req.body;



    let codigo=0;

    let codigoSaleOrder=await saleOrder.findOne().sort({CodSaleOrder:-1})
    .populate({path: 'Customer', model: 'Customer', match:{Company: companyId}}).then(function(doc){
        console.log(doc);
            if(doc){
                    if(doc.CodSaleOrder!==null){
                return(doc.CodSaleOrder)
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

    if(!codigoSaleOrder){
        codigo =1;
    }else {codigo=codigoSaleOrder+1}
        //++++++++++++++ verificando deudas +++++++++++++++++++
        //obtener fecha de facturas relacionadas con el cliente
        let invoices=await customerInvoice.find({Pagada:false, Customer: Customer},'CreationDate')
        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

        invoices.map(item =>{
            //  let date = moment(item.CreationDate).format('DD/MM/YYYY');

            let now= new Date();
            let fecha=now.getTime();
            var date = new Date(item.CreationDate);

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
    SaleOrder.CodSaleOrder=codigo;
    SaleOrder.Customer=Customer;
    SaleOrder.CodCustomerQuote=CodCustomerQuote?CodCustomerQuote:null;
    SaleOrder.Total=Total;
    SaleOrder.Active=true;
    SaleOrder.User=User,
    SaleOrder.CreationDate= creacion;
    SaleOrder.State='Abierta';
    SaleOrder.Comments=Comments;
    SaleOrder.CommentsofQuote=Description;
    SaleOrder.CodCustomerSaleOrder=codigo;
    SaleOrder.CustomerName=CustomerName;
    SaleOrder.CustomerQuote=CustomerQuote;
    SaleOrder.AdvancePayment=false;

    if(companyParams.OrderWithWallet && (deudor || !deudor) ){

        SaleOrder.save((err, SaleOrderStored)=>{
            if(err){
                res.status(500).send({message: err});

            }else {
                if(!SaleOrderStored){
                    res.status(500).send({message: "Error al crear el nuevo usuario."});
                    console.log(SaleOrderStored);
                }
                else{
                    let SaleOrderId=SaleOrderStored._id;
                    let quoteId=SaleOrderStored.CustomerQuote;
                    if(SaleOrderId){
                        console.log("INGRESANDO LOS DETALLLES ");
                        saledetails.map(async item => {
                        detalle.push({
                            ProductName:item.ProductName,
                            SaleOrder:SaleOrderId,
                            Quantity:parseFloat(item.Quantity) ,
                            Discount:parseFloat(item.Discount),
                            Price:parseFloat(item.Price),
                            Inventory :item.Inventory._id,
                            Measure:item.Inventory.Product.Measure.Name,
                            CodProduct:item.CodProduct,
                            SubTotal: parseFloat(parseFloat(item.Price) * parseFloat(item.Quantity)),
                            Product:item.Inventory.Product._id,
                            iniQuantity:parseFloat(item.Quantity) ,
                            // Priceiva:parseFloat(item.Priceiva)
                            // OnRequest:false
                            GrossSellPrice:parseFloat(item.GrossSellPrice),
                            inAdvanced:false

                            
                        })
                     });
                     console.log("EL DETALLE INSERTADO",detalle);
                        if(detalle.length>0){
                            saleOrderDetails.insertMany(detalle)
                            .then(function (detalles) {
                                console.log("PROCESO DE RESERVA");
                                console.log(saledetails);
                                saledetails.map(async item=>{
                                    customerQuotesDetails.findByIdAndUpdate({_id:item._id},{OnRequest:true},async (err,update)=>{
                                        if(err){
                                            console.log(err);
                                        }
                                        if(update){
                                               let inRequest=await customerQuotesDetails.countDocuments({CustomerQuote:CustomerQuote , OnRequest:true}, function (err, count) {
                                                console.log(count); return (count)
                                               });
                                               let allDetails=await customerQuotesDetails.countDocuments({CustomerQuote:CustomerQuote}, function (err, count) {
                                                console.log(count); return (count)
                                               });

                                               if(parseInt(inRequest)< parseInt(allDetails)){
                                                customerQuotes.findByIdAndUpdate({_id:CustomerQuote},{State:"Cerrada/Parcial"},async (err,update)=>{
                                                    if(err){
                                                        console.log(err);
                                                    }
                                                    if(update){
                                                        res.status(200).send({orden: SaleOrderStored});
                                                    }
                                                })
                                               }else if(parseInt(inRequest)=== parseInt(allDetails)){
                                                customerQuotes.findByIdAndUpdate({_id:CustomerQuote},{State:"Completada"},async (err,update)=>{
                                                    if(err){
                                                        console.log(err);
                                                    }
                                                    if(update){
                                                       
                                                    }
                                                })
                                               }
                                             console.log("en oden",inRequest);
                                             console.log("no oden",allDetails);


                                        }
                                    });
                                });
                                if(companyParams.AvailableReservation){
                                    console.log("EMPRESA HABILITADA PARA RESERVAS");
                                    detalles.map(async item=>{

                                        //obteniendo stock de producto  (bodega principal)
                                        let infoInventary=await inventory.findOne({_id:item.Inventory},['Stock','Product'])
                                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                        console.log('EN STOCK:',infoInventary);

                                        if(parseFloat(infoInventary.Stock)>=parseFloat(item.Quantity)){
                                                //descontando cantidad que se reservara
                                                inventory.findByIdAndUpdate({_id:item.Inventory},{
                                                    Stock:parseFloat(infoInventary.Stock - item.Quantity),
                                                }).then(result=> console.log(result))
                                                .catch(err => {console.log(err);});

                                                //stock de bodega de reserva
                                                console.log(infoInventary.Product);
                                                let productreserved=await inventory.findOne({Product:infoInventary.Product, _id: { $nin: infoInventary._id }},['Stock','Product'])
                                                .populate({path: 'Bodega', model: 'Bodega', match:{Name:'Reserva'}})
                                                .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                                console.log('BODEGA RESERVA');
                                                console.log(productreserved);

                                                //actualizando el stock de reserva
                                                inventory.findByIdAndUpdate({_id:productreserved._id},{
                                                    Stock:parseFloat(productreserved.Stock + item.Quantity),
                                                }).then(result=> console.log(result))
                                                .catch(err => {console.log(err);});

                                                //obteniendo id del movimiento de tipo reserva
                                                let movementId=await MovementTypes.findOne({Name:'reservacion'},['_id'])
                                                .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

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
                                                inventorytraceability.DocumentId=SaleOrderId;

                                                inventorytraceability.save((err, traceabilityStored)=>{
                                                    if(err){
                                                        // res.status(500).send({message: err});

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


                                        }
                                        else{

                                             res.status(500).send({ message: "Verificar Inventario" });
                                        }

                                    })

                                }
                                else{
                                    res.status(200).send({orden: SaleOrderStored});
                                }




                            })
                            .catch(function (err) {
                                console.log(err);
                            });


                        }
                    }

                    res.status(200).send({orden: SaleOrderStored}); 
                }
            }
        })

    }

    if(!companyParams.OrderWithWallet && !deudor){
        console.log(SaleOrder);
        SaleOrder.save((err, SaleOrderStored)=>{
            if(err){
                res.status(500).send({message: err});

            }else {
                if(!SaleOrderStored){
                    res.status(500).send({message: "Error al crear el nuevo usuario."});
                    console.log(SaleOrderStored);
                }
                else{
                    let SaleOrderId=SaleOrderStored._id;

                    if(SaleOrderId){

                        saledetails.map(async item => {
                        detalle.push({
                            ProductName:item.ProductName,
                            SaleOrder:SaleOrderId,
                            Quantity:parseFloat(item.Quantity) ,
                            Discount:parseFloat(item.Discount),
                            Price:parseFloat(item.Price),
                            Inventory :item.Inventory._id,
                            Measure:item.Inventory.Product.Measure.Name,
                            CodProduct:item.CodProduct,
                            SubTotal: parseFloat(item.Price) * parseFloat(item.Quantity),
                            Product:item.Inventory.Product._id,
                            iniQuantity:parseFloat(item.Quantity) ,
                            // Priceiva:parseFloat(item.Priceiva)
                            // OnRequest:false
                            GrossSellPrice:parseFloat(item.GrossSellPrice),
                            inAdvanced:false
                        })
                     });
                     console.log("DETALLE INGRESO", detalle);
                        if(detalle.length>0){
                            saleOrderDetails.insertMany(detalle)
                            .then(function (detalles) {
                                console.log("PROCESO DE RESERVA");
                                console.log(detalles);
                                if(detalles){

                                 console.log(messageError);

                                  //cambio de estado

                                    console.log("cambiando estados");
                                    saledetails.map(async item=>{
                                        customerQuotesDetails.findByIdAndUpdate({_id:item._id},{OnRequest:true},async (err,update)=>{
                                            if(err){
                                                console.log(err);
                                            }
                                            if(update){
                                                   let inRequest=await customerQuotesDetails.countDocuments({CustomerQuote:CustomerQuote , OnRequest:true}, function (err, count) {
                                                    console.log(count); return (count)
                                                   });
                                                   let allDetails=await customerQuotesDetails.countDocuments({CustomerQuote:CustomerQuote}, function (err, count) {
                                                    console.log(count); return (count)
                                                   });

                                                   if(parseInt(inRequest)< parseInt(allDetails)){
                                                    customerQuotes.findByIdAndUpdate({_id:CustomerQuote},{State:"Cerrada/Parcial"},async (err,update)=>{
                                                        if(err){
                                                            console.log(err);
                                                        }
                                                        if(update){
                                                            // res.status(200).send({orden: SaleOrderStored});
                                                        }
                                                    })
                                                   }else if(parseInt(inRequest)=== parseInt(allDetails)){
                                                    customerQuotes.findByIdAndUpdate({_id:CustomerQuote},{State:"Completada"},async (err,update)=>{
                                                        if(err){
                                                            console.log(err);
                                                        }
                                                        if(update){
                                                            // res.status(200).send({orden: SaleOrderStored});
                                                        }
                                                    })
                                                   }
                                                 console.log("en oden",inRequest);
                                                 console.log("no oden",allDetails);


                                            }
                                        });
                                    });
                                    if(companyParams.AvailableReservation){
                                        console.log("EMPRESA HABILITADA PARA RESERVAS");
                                        detalles.map(async item=>{

                                            //obteniendo stock de producto  (bodega principal)
                                            let infoInventary=await inventory.findOne({_id:item.Inventory},['Stock','Product'])
                                            .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                            console.log('EN STOCK:',infoInventary);

                                            if(parseFloat(infoInventary.Stock)>=parseFloat(item.Quantity)){
                                                    //descontando cantidad que se reservara
                                                    inventory.findByIdAndUpdate({_id:item.Inventory},{
                                                        Stock:parseFloat(infoInventary.Stock - item.Quantity),
                                                    }).then(result=> console.log(result))
                                                    .catch(err => {console.log(err);});

                                                    //stock de bodega de reserva
                                                    console.log(infoInventary.Product);
                                                    let productreserved=await inventory.findOne({Product:infoInventary.Product, _id: { $nin: infoInventary._id }},['Stock','Product'])
                                                    .populate({path: 'Bodega', model: 'Bodega', match:{Name:'Reserva'}})
                                                    .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                                    console.log('BODEGA RESERVA');
                                                    console.log(productreserved);

                                                    //actualizando el stock de reserva
                                                    inventory.findByIdAndUpdate({_id:productreserved._id},{
                                                        Stock:parseFloat(productreserved.Stock + item.Quantity),
                                                    }).then(result=> console.log(result))
                                                    .catch(err => {console.log(err);});

                                                    //obteniendo id del movimiento de tipo reserva
                                                    let movementId=await MovementTypes.findOne({Name:'reservacion'},['_id'])
                                                    .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

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
                                                    inventorytraceability.DocumentId=SaleOrderId;

                                                    inventorytraceability.save((err, traceabilityStored)=>{
                                                        if(err){
                                                            res.status(500).send({message: err});

                                                        }else {
                                                            if(!traceabilityStored){
                                                                res.status(500).send({message: "Error al crear el nuevo usuario."});
                                                                console.log(traceabilityStored);
                                                            }
                                                            else{
                                                                // res.status(200).send({orden: SaleOrderStored});
                                                            }
                                                        }
                                                    });


                                            }
                                            else{
                                                console.log(infoInventary.Stock,item.Quantity);
                                                messageError=true;
                                                res.status(500).send({ message: "Verificar Inventario" });
                                            }

                                        })

                                    }
                                    else{
                                        res.status(200).send({orden: SaleOrderStored});
                                    }
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

function getSaleOrderDetails(req, res){
    let saleId = req.params.id;
    saleOrderDetails.find({SaleOrder:saleId}).populate({path: 'Inventory', model: 'Inventory',
    populate:({path: 'Bodega', model: 'Bodega', match:{Name:'Principal'}}),
    populate:({path: 'Product',model:'Product',populate:{path: 'Measure',model:'Measure'}})})

    .then(details => {
        if(!details){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({details})
        }
    });
}


async function updateSaleOrder(req, res){
    let saleId = req.params.id;
    let saleDetalle=req.body.details;
    let detailsAnt=req.body.ordenAnt;
    let updateSaleOrder={};
    let creacion = moment().format('DD/MM/YYYY');

    const {Comments,Total,Customer,companyId,User}=req.body;

    //obteniendo informacion de la compañia para validar
    let companyParams=await company.findById(companyId) //esta variable la mando a llamar luego que se ingreso factura
    .then(params => {
        if(!params){
            res.status(404).send({message:"No hay "});
        }else{
            return(params)
        }
    });

    updateSaleOrder.Comments=Comments;
    updateSaleOrder.Total=Total;

    let detallePrev={};
    let detalle=[];
    saleOrder.findByIdAndUpdate({_id:saleId},updateSaleOrder,(err,saleUpdated)=>{
        if(err){
            res.status(500).send({message: "Error del Servidor."});
            console.log(err);
        } else {
            if(!saleUpdated){
                console.log(saleUpdated);
                res.status(404).send({message: "No se actualizo registro"});
            }else{
                if(detailsAnt.length > 0) {
                     detailsAnt.map(async item => {
                        detallePrev.ProductName=item.ProductName;
                        detallePrev.SaleOrder=saleId;
                        detallePrev.Quantity=parseFloat(item.Quantity) ;
                        detallePrev.Discount=parseFloat(item.Discount);
                        detallePrev.Price=parseFloat(item.PrecioDescuento)?parseFloat(item.PrecioDescuento):item.Price;
                        detallePrev.Inventory =item.Inventory._id;
                        detallePrev.SubTotal=item.SubTotal;
                        // detallePrev.GrossSellPrice=item.Price
                        saleOrderDetails.updateMany({_id: item._id ,SaleOrder:saleId},detallePrev)
                            .then(function (detalles) {
                               console.log("Actualizados");


                            })
                            .catch(function (err) {
                                console.log(err);
                            });
                          if(companyParams.AvailableReservation){
                                    console.log("EMPRESA HABILITADA PARA RESERVAS");


                                        //obteniendo stock de producto  (bodega principal)
                                        let infoInventary=await inventory.findOne({_id:item.Inventory._id},['Stock','Product'])
                                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                        console.log('EN STOCK:',infoInventary);




                                        console.log("en el inventaerio",infoInventary);
                                        if(parseFloat(infoInventary.Stock)>=parseFloat(item.Quantity)){
                                                //descontando cantidad que se reservara
                                                inventory.findByIdAndUpdate({_id:item.Inventory._id},{
                                                    Stock:parseFloat((infoInventary.Stock + parseFloat(item.iniQuantity)) - item.Quantity),
                                                }).then(result=> console.log(result))
                                                .catch(err => {console.log(err);});

                                                //stock de bodega de reserva
                                                console.log(infoInventary.Product);
                                                let productreserved=await inventory.findOne({Product:infoInventary.Product, _id: { $nin: infoInventary._id }},['Stock','Product'])
                                                .populate({path: 'Bodega', model: 'Bodega', match:{Name:'Reserva'}})
                                                .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                                console.log('BODEGA RESERVA');
                                                console.log(productreserved);

                                                //actualizando el stock de reserva
                                                inventory.findByIdAndUpdate({_id:productreserved._id},{
                                                    Stock:parseFloat(productreserved.Stock - item.iniQuantity)+parseFloat(item.Quantity),
                                                }).then(result=> {
                                                    saleOrderDetails.findByIdAndUpdate({_id: item._id },{
                                                        iniQuantity:parseFloat(item.Quantity),
                                                    }).then(result=> {
                                                       console.log(result);
                                                    })
                                                    .catch(err => {console.log(err);});
                                                })
                                                .catch(err => {console.log(err);});

                                                //obteniendo id del movimiento de tipo reserva
                                                let movementId=await MovementTypes.findOne({Name:'reservacion'},['_id'])
                                                .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                                 //obteniendo id del movimiento de tipo reserva
                                                let reversionMovementId=await MovementTypes.findOne({Name:'reversion'},['_id'])
                                                .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                                console.log('id del moviminto de reserva', movementId);

                                                //reversion del inventario
                                                const reversionInventario= new inventoryTraceability();

                                                reversionInventario.Quantity=item.iniQuantity;
                                                reversionInventario.Product=item.Product;
                                                reversionInventario.WarehouseDestination=item.Inventory._id; //destino
                                                reversionInventario.MovementType=reversionMovementId._id;
                                                reversionInventario.MovDate=creacion;
                                                reversionInventario.WarehouseOrigin=productreserved._id; //origen
                                                reversionInventario.User=User;
                                                reversionInventario.Company=companyId;
                                                reversionInventario.DocumentId=saleId;


                                                reversionInventario.save((err, traceabilityStored)=>{
                                                    if(err){
                                                        // res.status(500).send({message: err});

                                                    }else {
                                                        if(!traceabilityStored){
                                                            // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                                           console.log("registro de movimiento");
                                                            console.log(traceabilityStored);
                                                        }
                                                        else{

                                                        }
                                                    }
                                                });
                                                //registro de movimiento
                                                const inventorytraceability= new inventoryTraceability();

                                                inventorytraceability.Quantity=item.Quantity;
                                                inventorytraceability.Product=item.Product;
                                                inventorytraceability.WarehouseDestination=productreserved._id; //destino
                                                inventorytraceability.MovementType=movementId._id;
                                                inventorytraceability.MovDate=creacion;
                                                inventorytraceability.WarehouseOrigin=item.Inventory._id; //origen
                                                inventorytraceability.User=User;
                                                inventorytraceability.Company=companyId;
                                                inventorytraceability.DocumentId=saleId;

                                                inventorytraceability.save((err, traceabilityStored)=>{
                                                    if(err){
                                                        // res.status(500).send({message: err});

                                                    }else {
                                                        if(!traceabilityStored){
                                                            // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                                           console.log("registro de movimiento");
                                                            console.log(traceabilityStored);
                                                        }
                                                        else{

                                                        }
                                                    }
                                                });


                                        }
                                        else{

                                             res.status(500).send({ message: "Verificar Inventario" });
                                        }



                                }

                       });
                        console.log(detallePrev);

                }

                if(saleDetalle.length>0){
                    saleDetalle.map(async item => {
                        detalle.push({

                            ProductName:item.Name,
                            SaleOrder:saleId,
                            Quantity:parseFloat(item.Quantity) ,
                            Discount:parseFloat(item.Discount),
                            Price:parseFloat(item.PrecioDescuento),
                            Inventory :item.Inventory,
                            Measure:item.Measures,
                            CodProduct:item.codproducts,
                            SubTotal: parseFloat(item.total).toFixed(2),
                            Product:item.ProductId,
                            iniQuantity:parseFloat(item.Quantity) ,
                            GrossSellPrice:parseFloat(item.GrossSellPrice),
                        })
                     });
                     console.log(detalle);
                        if(detalle.length>0){
                            saleOrderDetails.insertMany(detalle)
                            .then(async function (detalles) {

                                console.log("INSERTADOS", detalles);
                                if(companyParams.AvailableReservation){
                                    console.log("EMPRESA HABILITADA PARA RESERVAS");
                                    detalles.map(async item=>{

                                        //obteniendo stock de producto  (bodega principal)
                                        let infoInventary=await inventory.findOne({_id:item.Inventory},['Stock','Product'])
                                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                        console.log('EN STOCK:',infoInventary);

                                        if(parseFloat(infoInventary.Stock)>=parseFloat(item.Quantity)){
                                                //descontando cantidad que se reservara
                                                inventory.findByIdAndUpdate({_id:item.Inventory},{
                                                    Stock:parseFloat(infoInventary.Stock - item.Quantity),
                                                }).then(result=> console.log(result))
                                                .catch(err => {console.log(err);});

                                                //stock de bodega de reserva
                                                console.log(infoInventary.Product);
                                                let productreserved=await inventory.findOne({Product:infoInventary.Product, _id: { $nin: infoInventary._id }},['Stock','Product'])
                                                .populate({path: 'Bodega', model: 'Bodega', match:{Name:'Reserva'}})
                                                .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                                console.log('BODEGA RESERVA');
                                                console.log(productreserved);

                                                //actualizando el stock de reserva
                                                inventory.findByIdAndUpdate({_id:productreserved._id},{
                                                    Stock:parseFloat(productreserved.Stock + item.Quantity),
                                                }).then(result=> console.log(result))
                                                .catch(err => {console.log(err);});

                                                //obteniendo id del movimiento de tipo reserva
                                                let movementId=await MovementTypes.findOne({Name:'reservacion'},['_id'])
                                                .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

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

                                                        }
                                                    }
                                                });

                                               
                                        }
                                        else{

                                             res.status(500).send({ message: "Verificar Inventario" });
                                        }

                                    })

                                }
                            })
                            .catch(function (err) {
                                console.log(err);
                            });
                        }
                }
                res.status(200).send(saleUpdated)
            }
        }
    })
}

async function deleteSaleOrderDetail(req,res){
    let detalleid=req.params.id;

    const {_id,quote,Quantity,Company,CodProduct,User}=req.body;
    const codigop=req.body.CodProduct;
    let creacion = moment().format('DD/MM/YYYY');

    console.log(_id);
    let companyParams=await company.findById(Company) //esta variable la mando a llamar luego que se ingreso factura
    .then(params => {
        if(!params){
            res.status(404).send({message:"No hay "});
        }else{
            return(params)
        }
    });

    saleOrderDetails.findByIdAndDelete(_id, (err, userDeleted) => {
        if (err) {
          res.status(500).send({ message: "Error del servidor." });
        } else {
          if (!userDeleted) {
             res.status(404).send({ message: "Detalle no encontrado" });
          } else {
            console.log(userDeleted);
            if(quote!==null){
                customerQuotesDetails.find({CustomerQuote: quote, CodProduct: codigop.toString()})
                .then(details => {
                    if(!details){
                        res.status(404).send({message:"No hay "});
                    }else{
                       console.log(details);
                       details.map(async item=>{
                            customerQuotesDetails.findByIdAndUpdate({_id:item._id},{OnRequest:false},async (err,update)=>{
                                if(err){
                                    console.log(err);
                                }
                                if(update){
                                    let inRequest=await customerQuotesDetails.countDocuments({CustomerQuote:quote , OnRequest:true}, function (err, count) {
                                        console.log(count); return (count)
                                       });
                                       let allDetails=await customerQuotesDetails.countDocuments({CustomerQuote:quote}, function (err, count) {
                                        console.log(count); return (count)
                                       });
                                        console.log("en orden",inRequest);
                                        console.log("todos",allDetails);
                                       if(parseInt(inRequest)< parseInt(allDetails)){
                                        customerQuotes.findByIdAndUpdate({_id:quote},{State:"Cerrada/Parcial"},async (err,update)=>{
                                            if(err){
                                                console.log(err);
                                            }
                                            if(update){
                                               console.log(update);
                                            }
                                        })
                                       }else if(parseInt(inRequest)=== parseInt(allDetails)){
                                        customerQuotes.findByIdAndUpdate({_id:quote},{State:"Completada"},async (err,update)=>{
                                            if(err){
                                                console.log(err);
                                            }
                                            if(update){
                                                console.log(update);
                                            }
                                        })
                                       }

                                }
                            }).catch(err => {return err})

                       })

                        if(companyParams.AvailableReservation){
                            console.log("EMPRESA HABILITADA PARA RESERVAS");
                            details.map(async item=>{

                                //obteniendo stock de producto  (bodega principal)
                                let infoInventary=await inventory.findOne({_id:item.Inventory},['Stock','Product'])
                                .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                console.log('EN STOCK:',infoInventary);

                                if(parseFloat(infoInventary.Stock)>=parseFloat(item.Quantity)){
                                        //reingresando cantidad que se reservara
                                        inventory.findByIdAndUpdate({_id:item.Inventory},{
                                            Stock:parseFloat(infoInventary.Stock + parseFloat( item.Quantity)),
                                        }).then(result=> console.log(result))
                                        .catch(err => {console.log(err);});

                                        //stock de bodega de reserva
                                        console.log(infoInventary.Product);
                                        let productreserved=await inventory.findOne({Product:infoInventary.Product, _id: { $nin: infoInventary._id }},['Stock','Product'])
                                        .populate({path: 'Bodega', model: 'Bodega', match:{Name:'Reserva'}})
                                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                        console.log('BODEGA RESERVA');
                                        console.log(productreserved);

                                        //actualizando el stock de reserva
                                        inventory.findByIdAndUpdate({_id:productreserved._id},{
                                            Stock:parseFloat(productreserved.Stock - item.Quantity),
                                        }).then(result=> console.log(result))
                                        .catch(err => {console.log(err);});

                                        //obteniendo id del movimiento de tipo reserva
                                        let movementId=await MovementTypes.findOne({Name:'reservacion'},['_id'])
                                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

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
                                        inventorytraceability.Company=Company;

                                        inventorytraceability.save((err, traceabilityStored)=>{
                                            if(err){
                                                res.status(500).send({message: err});

                                            }else {
                                                if(!traceabilityStored){
                                                    res.status(500).send({message: "Error al crear el nuevo usuario."});
                                                    console.log(traceabilityStored);
                                                }
                                                else{
                                                    // res.status(200).send({orden: details});
                                                }
                                            }
                                        });


                                }
                                else{
                                    console.log(infoInventary.Stock,item.Quantity);
                                    messageError=true;
                                    res.status(500).send({ message: "Verificar Inventario" });
                                }

                            })
                             
                        }
                            res.status(200).send({ userDeleted});
                    }
                });
           }
        
           
          }
        }
      });
}

async function anulaSaleOrder(req, res){
    let saleId=req.params.id;
    let Company=req.body.Customer.Company;
    let quote=req.body.CustomerQuote;
    let User=req.body.User;
    
    const codigop=req.body.CodProduct;
    let creacion = moment().format('DD/MM/YYYY');

    console.log("ANULANDO OIRDE DE VENTA");
    let companyParams=await company.findById(Company) //esta variable la mando a llamar luego que se ingreso factura
    .then(params => {
        if(!params){
            res.status(404).send({message:"No hay "});
        }else{
            return(params)
        }
    });

    saleOrder.findByIdAndUpdate({_id:saleId},{State:"Anulada"},async (err,update)=>{
        if(err){
            console.log(err);
        }
        if(update){
            if(quote!==null){
                customerQuotesDetails.find({CustomerQuote: quote})
                .then(details => {
                    if(!details){
                        res.status(404).send({message:"No hay "});
                    }else{
                       console.log("si actualizao" ,details);
                       details.map(async item=>{
                            customerQuotesDetails.findByIdAndUpdate({_id:item._id},{OnRequest:false},async (err,update)=>{
                                if(err){
                                    console.log(err);
                                }
                                if(!update){
                                    res.status(404).send({message:"No hay "});
                                }
                                else{
                                    let inRequest=await customerQuotesDetails.countDocuments({CustomerQuote:quote , OnRequest:true}, function (err, count) {
                                        console.log(count); return (count)
                                       });
                                       let allDetails=await customerQuotesDetails.countDocuments({CustomerQuote:quote}, function (err, count) {
                                        console.log(count); return (count)
                                       });
                                        console.log("en orden",inRequest);
                                        console.log("todos",allDetails);
                                       if(parseInt(inRequest)< parseInt(allDetails)){
                                        customerQuotes.findByIdAndUpdate({_id:quote},{State:"Cerrada"},async (err,update)=>{
                                            if(err){
                                                console.log(err);
                                            }
                                            if(update){
                                               
                                            }
                                        })
                                       }else if(parseInt(inRequest)=== parseInt(allDetails)){
                                        customerQuotes.findByIdAndUpdate({_id:quote},{State:"Completada"},async (err,update)=>{
                                            if(err){
                                                console.log(err);
                                            }
                                            if(update){
                                              
                                            }
                                        })
                                       }
                                       
                                }
                                
                            }).catch(err => {return err})
                         
                       })

                      

                    }
                });
               
           }
           if(companyParams.AvailableReservation){
            console.log("EMPRESA HABILITADA PARA RESERVAS");
            saleOrderDetails.find({SaleOrder: saleId})
            .then(details => {
                 details.map(async item=>{

                //obteniendo stock de producto  (bodega principal)
                let infoInventary=await inventory.findOne({_id:item.Inventory},['Stock','Product'])
                .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                console.log('EN STOCK:',infoInventary);
                let productreserved=await inventory.findOne({Product:infoInventary.Product, _id: { $nin: infoInventary._id }},['Stock','Product'])
                .populate({path: 'Bodega', model: 'Bodega', match:{Name:'Reserva'}})
                .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                if(parseFloat(productreserved.Stock)>=parseFloat(item.Quantity)){
                    console.log("ENCONTRO A REVERSION DEL INVENTARIO");
                        //reingresando cantidad que se reservara
                        inventory.findByIdAndUpdate({_id:item.Inventory},{
                            Stock:parseFloat(infoInventary.Stock + parseFloat( item.Quantity)),
                        }).then(result=> console.log(result))
                        .catch(err => {console.log(err);});

                        //stock de bodega de reserva
                        console.log(infoInventary.Product);
                       
                        console.log('BODEGA RESERVA');
                        console.log(productreserved);

                        //actualizando el stock de reserva
                        inventory.findByIdAndUpdate({_id:productreserved._id},{
                            Stock:parseFloat(productreserved.Stock - item.Quantity),
                        }).then(result=> console.log(result))
                        .catch(err => {console.log(err);});

                        //obteniendo id del movimiento de tipo reserva
                        let movementId=await MovementTypes.findOne({Name:'reservacion'},['_id'])
                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

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
                        inventorytraceability.Company=Company;

                        inventorytraceability.save((err, traceabilityStored)=>{
                            if(err){
                                res.status(500).send({message: err});

                            }else {
                                if(!traceabilityStored){
                                    res.status(500).send({message: "Error al crear el nuevo usuario."});
                                    console.log(traceabilityStored);
                                }
                                else{
                                    
                                }
                            }
                        });


                }
                else{
                    console.log(infoInventary.Stock,item.Quantity);
                    messageError=true;
                    res.status(500).send({ message: "Verificar Inventario" });
                }

            })
            })
           

        }
           
            res.status(200).send({ update});
        }
    })
}

async function changeSaleOrderState(req, res) {
    let saleId=req.params.id;
    
    console.log(req.body);
    saleOrder.findByIdAndUpdate({_id:saleId},{State:"Cerrada"},async (err,stateUpdate)=>{
        if(err){
            res.status(500).send({message: "Error del Servidor."});
            
        } else {
            if(!stateUpdate){
                res.status(404).send({message: "No se actualizo registro"});
            }
            else{
                res.status(200).send(stateUpdate)
            }
        }
   
    })
}

function getAllSaleOrderDetails(req, res){
    saleOrderDetails.find().populate({path: 'Inventory', model: 'Inventory',
    populate:({path: 'Bodega', model: 'Bodega', match:{Name:'Principal'}}),
    populate:({path: 'Product',model:'Product',populate:{path: 'Measure',model:'Measure'}})})
    .populate({path: 'SaleOrder', model: 'SaleOrder'})
    .then(details => {
        if(!details){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({details})
        }
    });
}


function getSaleOrdersbyCustomers(req, res){
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
    console.log("gola");
    try{

        saleOrder.aggregate([
            {  $match: {Customer:ObjectID(supplierId)}},
        
            {
                $lookup: {
                    from:"saleorderdetails",
                   
                    let:{ordenId:"$_id" },
                    pipeline: [
                        { $match:
                            { $expr:
                               
                                    { $eq: [ "$SaleOrder",  "$$ordenId" ] }
                                   
                                }
                            }
    
                    ],
                    as:"detalles",
                    
                },
                
                  
                
            }, 
            
        ]).then(result => {
            var order = result.filter(function (item) {
                let fecha=new Date(item.CreationDate);
                console.log("creacion",fecha);
                console.log("f1",f1);
                console.log("f2",f2);
                return fecha>=f2 && fecha<=f1;
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


module.exports = {
    getSaleOrders,
    getSelesOrderClosed,
    getCustomerQuoteDetails,
    getCustomerQuoteInfo,
    createSaleOrderWithQuote,
    createSaleOrder,
    getSaleOrderDetails,
    updateSaleOrder,
    deleteSaleOrderDetail,
    anulaSaleOrder,
    changeSaleOrderState,
    getAllSaleOrderDetails,
    getSaleOrdersbyCustomers
}
