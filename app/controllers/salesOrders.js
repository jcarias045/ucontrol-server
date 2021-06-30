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
    const { id,company,profile} = req.params;
    if(profile==="Admin"){  //perfil administrador de la compañia
        saleOrder.find().populate({path: 'Customer', model: 'Customer', match:{Company: company},
        populate:{path:'Discount', model: 'Discount'}}).sort({CodSaleOrder:-1})
        .then(orden => {
            if(!orden){
                res.status(404).send({message:"No hay "});
            }else{
                var order = orden.filter(function (item) {
                    return item.Customer!==null;
                  });
                res.status(200).send({order})
            }
        }); 
    }else{
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
    
}

async function getSelesOrderClosed(req, res){
    const { id,company } = req.params;
     //verificamos si la compañia tiene permitido la generacion de ordenes de venta a partir de cotizaciones con estado "Abierta"
     let quotesOpenop=await Companyreg.findById(company) 
     .then(income => {
         if(!income){
             res.status(404).send({message:"No hay "});
         }else{
             console.log(income);
            return(income.WorksOpenQuote)
         }
     });

    console.log(quotesOpenop);
    if(quotesOpenop){  //si esta habilitada para aceptar ordenes con estado "Abierta", "Cerrada" y "Cerrada/Parcial"
        customerQuotes.find({User:id,State:{$in:['Cerrada','Abierta','Cerrada/Parcial']}}).populate({path: 'Customer', model: 'Customer', match:{Company: company}})
            .then(orders => {
                if(!orders){
                    res.status(404).send({message:"No hay "});
                }else{

                    res.status(200).send({orders})
                }
            });
    }else{
        //solo admite cotizaciones con estado "Cerrada"
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


function getCustomerQuoteDetails(req, res){ //funcion para obtener los detalles de una cotizacion seleccionada 
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
    const saledetails=req.body.details; //detalle de productos
    const detalle=[];
    let deudor=false;
    let now= new Date();
    let creacion=now.toISOString().substring(0, 10);


    const {CodCustomerQuote,CustomerName,Description,Total,User,companyId,CustomerQuote,SubTotal,Customer,Comments,diasCredito} = req.body;



    let codigo=0;
    
    //obteniendo el ultimo codigo ingresado para generar el siguiente correlativo
    let codigoSaleOrder=await saleOrder.findOne({Company: companyId}).sort({CodSaleOrder:-1})
    .populate({path: 'Customer', model: 'Customer', match:{Company: companyId}}).then(function(doc){
        console.log(doc);
            if(doc){
                    if(doc.CodSaleOrder!==null){
                return(doc.CodSaleOrder)
            }
        }
    });
      
    if(!codigoSaleOrder){
        codigo =1;
    }else {codigo=codigoSaleOrder+1}

    //obteniendo informacion de la compañia para validar (obtendo toda la información de la compañia)
    let companyParams=await company.findById(companyId) 
    .then(params => {
        if(!params){
            res.status(404).send({message:"No hay "});
        }else{
            return(params)
        }
    });

  
        //++++++++++++++ verificando deudas +++++++++++++++++++
        //obtener fecha de facturas relacionadas con el cliente
        let invoices=await customerInvoice.find({Pagada:false, Customer: Customer},'CreationDate')   //consultamos si el cliente tiene facturas
        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
        if(invoices.length>0){
            invoices.map(item =>{
            //  let date = moment(item.CreationDate).format('DD/MM/YYYY');

            let now= new Date();
            let fecha=now.getTime();
            var date = new Date(item.CreationDate);
            console.log("FECHA DE LA FACTURA",date);
            date.setDate(date.getDate() + diasCredito);  //a la fecha sumamos los dias de credito de ese cliente
            let fechaPago=date.toISOString().substring(0, 10);
            let fechaAct=now.toISOString().substring(0, 10);
            console.log('fecha sumada',date.toISOString().substring(0, 10));
            console.log(fechaAct);
            //verificamos si tiene deuda o factura pendiente de pagar
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

     //creamos objeto para insertar orden de venta
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
    SaleOrder.Company=companyId;

    console.log(companyParams.OrderWithWallet);
    console.log(saledetails);
    //verificamos si la compañia permite pedidos con cartera (es decir hacer pedidos aunque el cliente tenga deuda)
    //SI PERMITE ENTONCES NO IMPORTA QUE TENGA DEUDA EL CLIENTE EN CASO CONTRARIO LA ORDEN NO SE PODRA REGISTRAR
    if((companyParams.OrderWithWallet && (deudor || !deudor)) || (!companyParams.OrderWithWallet && !deudor) ){
      
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
                    let codorder=SaleOrderStored.CodSaleOrder;
                    if(SaleOrderId){

                        saledetails.map(async item => {
                        detalle.push({  //areglo del detalles de la orden
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
                            saleOrderDetails.insertMany(detalle)  //guaardamos detalles de la orden
                            .then(function (detalles) {
                                console.log("PROCESO DE RESERVA");
                                console.log(detalles);
                                 
                                //verificamos si la empresa permite realizar reservaciones
                                if(companyParams.AvailableReservation){
                                    console.log("EMPRESA HABILITADA PARA RESERVAS");
                                    detalles.map(async item=>{

                                        //obteniendo stock de producto  (bodega principal)
                                        let infoInventary=await inventory.findOne({_id:item.Inventory},['Stock','Product'])
                                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                        console.log('EN STOCK:',infoInventary);
                                     
                                        if(parseFloat(infoInventary.Stock)>=parseFloat(item.Quantity)){ //validamos que si exista la cantidad necesaria para hacer reservacion
                                                //descontando cantidad que se reservara del inventario principal
                                                inventory.findByIdAndUpdate({_id:item.Inventory},{
                                                    Stock:parseFloat(infoInventary.Stock - item.Quantity),
                                                }).then(result=> console.log(result))
                                                .catch(err => {console.log(err);});

                                                //stock de bodega de reserva
                                                console.log(infoInventary.Product);
                                                let productreserved=await inventory.findOne({Product:infoInventary.Product, _id: { $nin: infoInventary._id }},['Stock','Product'])
                                                .populate({path: 'Bodega', model: 'Bodega', match:{Name:'Reserva'}})
                                                .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                                
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
                                                inventorytraceability.DocumentNumber=codorder;
                                                inventorytraceability.DocType="Orden de Venta";
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
    
   
    //no se ingresa orden 
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
    //OBTENIENDO ULTIMO CODIGO asignado (correlativo)
    let codigoSaleOrder=await saleOrder.findOne({Company: companyId}).sort({CodSaleOrder:-1})
    .populate({path: 'Customer', model: 'Customer', match:{Company: companyId}}).then(function(doc){
        console.log(doc);
            if(doc){
                    if(doc.CodSaleOrder!==null){
                return(doc.CodSaleOrder)
            }
        }
    });

    if(!codigoSaleOrder){
        codigo =1;
    }else {codigo=codigoSaleOrder+1}

    //obteniendo informacion de la compañia para validar
    let companyParams=await company.findById(companyId) 
    .then(params => {
        if(!params){
            res.status(404).send({message:"No hay "});
        }else{
            return(params)
        }
    });
    

        //++++++++++++++ verificando deudas +++++++++++++++++++
        //obtener fecha de facturas relacionadas con el cliente
        let invoices=await customerInvoice.find({Pagada:false, Customer: Customer},'CreationDate')
        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

        invoices.map(item =>{
            //  let date = moment(item.CreationDate).format('DD/MM/YYYY');

            let now= new Date();
            let fecha=now.getTime();
            var date = new Date(item.CreationDate);

            date.setDate(date.getDate() + diasCredito); //sumamos los dias de credito para verificar si existe deuda
            let fechaPago=date.toISOString().substring(0, 10);
            let fechaAct=now.toISOString().substring(0, 10);
            console.log('fecha sumada',date.toISOString().substring(0, 10));
            console.log(fechaAct);
            //determinacion si es deudor
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

     //creacion de objetos pora ingreso de orden
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
    SaleOrder.Company=companyId;

  //verificamos si la compañia permite pedidos con cartera (es decir hacer pedidos aunque el cliente tenga deuda)
    //SI PERMITE ENTONCES NO IMPORTA QUE TENGA DEUDA EL CLIENTE EN CASO CONTRARIO LA ORDEN NO SE PODRA REGISTRAR
    if((companyParams.OrderWithWallet && (deudor || !deudor) ) || (!companyParams.OrderWithWallet && !deudor)){

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
                    let codorder=SaleOrderStored.CodSaleOrder;
                    if(SaleOrderId){
                        console.log("INGRESANDO LOS DETALLLES ");
                        saledetails.map(async item => {
                        detalle.push({    //generamos arreglo con los detalles que componen la orden
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
                            saleOrderDetails.insertMany(detalle)  //insertando detalles
                            .then(function (detalles) {
                                console.log("PROCESO DE RESERVA");
                                console.log(saledetails);
                                saledetails.map(async item=>{
                                    //colocamos los prodcutos de la cotizacion que ya se encuentran en un pedido o una orden
                                    //para eso se cambia el estado OnRequest a true
                                    customerQuotesDetails.findByIdAndUpdate({_id:item._id},{OnRequest:true},async (err,update)=>{
                                        if(err){
                                            console.log(err);
                                        }
                                        if(update){

                                            //realizamos conteo de cuantos prodcutos de la orden ya pertencen a una orden de venta
                                            
                                            //prodcutos en pedido
                                               let inRequest=await customerQuotesDetails.countDocuments({CustomerQuote:CustomerQuote , OnRequest:true}, function (err, count) {
                                                console.log(count); return (count)
                                               });
                                               //todo el detalle de  productos (cantidad total de productos en la cotizacion)
                                               let allDetails=await customerQuotesDetails.countDocuments({CustomerQuote:CustomerQuote}, function (err, count) {
                                                console.log(count); return (count)
                                               });
                                              
                                               //en caso que no este completada la cotizacion esta pasa a tener un estado de "Abierta" a "Cerrada Parcial"
                                               if(parseInt(inRequest)< parseInt(allDetails)){
                                                customerQuotes.findByIdAndUpdate({_id:CustomerQuote},{State:"Cerrada/Parcial"},async (err,update)=>{
                                                    if(err){
                                                        console.log(err);
                                                    }
                                                    if(update){
                                                        res.status(200).send({orden: SaleOrderStored});
                                                    }
                                                })
                                               }else if(parseInt(inRequest)=== parseInt(allDetails)){  // en el caso que todos los productos de la cotizacion formen parte del pedido se cambia a "Cerrada" el estado de la cotizacion
                                                customerQuotes.findByIdAndUpdate({_id:CustomerQuote},{State:"Completada"},async (err,update)=>{
                                                    if(err){
                                                        console.log(err);
                                                    }
                                                    if(update){
                                                       
                                                    }
                                                })
                                               }
                                            


                                        }
                                    });
                                });
                                if(companyParams.AvailableReservation){   //verificar si la empresa permite realizar reservaciones 
                                    console.log("EMPRESA HABILITADA PARA RESERVAS");
                                    detalles.map(async item=>{

                                        //obteniendo stock de producto  (bodega principal)
                                        let infoInventary=await inventory.findOne({_id:item.Inventory},['Stock','Product'])
                                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                        console.log('EN STOCK:',infoInventary);

                                        if(parseFloat(infoInventary.Stock)>=parseFloat(item.Quantity)){  //verificacion de existenncias
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
                                                inventorytraceability.DocumentNumber=codorder;
                                                inventorytraceability.DocType="Orden de Venta";
                                                inventorytraceability.Cost=parseFloat(item.Quantity)*parseFloat(item.Price);
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
    let saleDetalle=req.body.details; //nuevo productos añadidos a la orden
    let detailsAnt=req.body.ordenAnt; //prodcutos de la orden creada
    let updateSaleOrder={};
    let now= new Date();
    let creacion=now.toISOString().substring(0, 10);


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
                let codorder=saleUpdated.CodSaleOrder;
                if(detailsAnt.length > 0) {
                    
                     detailsAnt.map(async item => {  //generando objeto con datos actualizados
                        detallePrev.ProductName=item.ProductName;
                        detallePrev.SaleOrder=saleId;
                        detallePrev.Quantity=parseFloat(item.Quantity) ;
                        detallePrev.Discount=parseFloat(item.Discount);
                        detallePrev.Price=parseFloat(item.PrecioDescuento)?parseFloat(item.PrecioDescuento):item.Price;
                        detallePrev.Inventory =item.Inventory._id;
                        detallePrev.SubTotal=item.SubTotal;
                        // detallePrev.GrossSellPrice=item.Price
                        saleOrderDetails.updateMany({_id: item._id ,SaleOrder:saleId},detallePrev)  //actualizacion de datos
                            .then(function (detalles) {
                               console.log("Actualizados");


                            })
                            .catch(function (err) {
                                console.log(err);
                            });
                            //verificando si la  compañia tiene habilitadas las reservas
                          if(companyParams.AvailableReservation){
                                    console.log("EMPRESA HABILITADA PARA RESERVAS");


                                        //obteniendo stock de producto  (bodega principal)
                                        let infoInventary=await inventory.findOne({_id:item.Inventory._id},['Stock','Product'])
                                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                        console.log('EN STOCK:',infoInventary);




                                        console.log("en el inventaerio",infoInventary);
                                        if(parseFloat(infoInventary.Stock)>=parseFloat(item.Quantity)){  //verifica existencias
                                                //descontando cantidad que se reservara, se regresa cantidad inicial y se descuenta la nueva
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

                                                //actualizando el stock de reserva se descuenta la cantidad inicial y se suma la nueva cantidad
                                                inventory.findByIdAndUpdate({_id:productreserved._id},{
                                                    Stock:parseFloat(productreserved.Stock - item.iniQuantity)+parseFloat(item.Quantity),
                                                }).then(result=> {
                                                    saleOrderDetails.findByIdAndUpdate({_id: item._id },{ //actualizamos la cantidad inicial esto funciona para el momnto de actualizar los inventarios y no perder la cantidad que fue movida 
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
                                                inventorytraceability.DocumentNumber=codorder;
                                                inventorytraceability.DocType="Orden de Venta";
                                                inventorytraceability.Cost=parseFloat(item.Quantity)*parseFloat(item.Price);

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
                                                inventorytraceability.DocumentNumber=codorder;
                                                inventorytraceability.DocType="Orden de Venta";
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
                        detalle.push({  //arreglo de nuevos productos

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
                            saleOrderDetails.insertMany(detalle)  //guardando los nuevos prodcutos que tendra la cotizacion
                            .then(async function (detalles) {

                                console.log("INSERTADOS", detalles);
                                //verificamos si  esta habilitada para hacer reservas
                                if(companyParams.AvailableReservation){
                                    console.log("EMPRESA HABILITADA PARA RESERVAS");
                                    detalles.map(async item=>{

                                        //obteniendo stock de producto  (bodega principal)
                                        let infoInventary=await inventory.findOne({_id:item.Inventory},['Stock','Product'])
                                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                        console.log('EN STOCK:',infoInventary);

                                        if(parseFloat(infoInventary.Stock)>=parseFloat(item.Quantity)){ //verificar existencias
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
                                                inventorytraceability.DocumentNumber=codorder;
                                                inventorytraceability.DocType="Orden de Venta";
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

    const {_id,quote,Quantity,Company,CodProduct,User,codorder}=req.body;
    const codigop=req.body.CodProduct;
    let now= new Date();
    let creacion=now.toISOString().substring(0, 10);

    console.log("ordenes de venta detalle eliminado",_id);
    //obteniendo informacion de la compañia
    let companyParams=await company.findById(Company) //esta variable la mando a llamar luego que se ingreso factura
    .then(params => {
        if(!params){
            res.status(404).send({message:"No hay "});
        }else{
            return(params)
        }
    });

    saleOrderDetails.findByIdAndDelete(_id, (err, userDeleted) => {  //eliminando detalle
        if (err) {
          res.status(500).send({ message: "Error del servidor." });
        } else {
          if (!userDeleted) {
             res.status(404).send({ message: "Detalle no encontrado" });
          } else {
            console.log(userDeleted);
            //verificamos si ese detalle pertece a una cotizacion
            if(quote!==null){
                //en caso de pertenecer a una cotizacion se tiene que cambiar el estado de este producto en dicha cotizacion.

                customerQuotesDetails.find({CustomerQuote: quote, CodProduct: codigop.toString()})  //obtenemos la informacion del producto dentro de la cotizacion
                .then(details => {
                    if(!details){
                        res.status(404).send({message:"No hay "});
                    }else{
                       console.log(details);
                       details.map(async item=>{ 
                           //cambiamos el estado del producto dentro de la cotizacion  (OnRequest:false)
                            customerQuotesDetails.findByIdAndUpdate({_id:item._id},{OnRequest:false},async (err,update)=>{
                                if(err){
                                    console.log(err);
                                }
                                if(update){
                                    //conteo de productos  que estan en pedido
                                    let inRequest=await customerQuotesDetails.countDocuments({CustomerQuote:quote , OnRequest:true}, function (err, count) {
                                        console.log(count); return (count)
                                       });
                                       //conteo de los productos de la cotizacion
                                       let allDetails=await customerQuotesDetails.countDocuments({CustomerQuote:quote}, function (err, count) {
                                        console.log(count); return (count)
                                       });
                                       
                                       if(parseInt(inRequest)< parseInt(allDetails)){  //si no esta completa la cotizacion dentro de un pedido
                                        customerQuotes.findByIdAndUpdate({_id:quote},{State:"Cerrada/Parcial"},async (err,update)=>{
                                            if(err){
                                                console.log(err);
                                            }
                                            if(update){
                                               console.log(update);
                                            }
                                        })
                                       }else if(parseInt(inRequest)=== parseInt(allDetails)){ //si los prodcutos de la cotizacion en su totalidad estan en la orden
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
                        //si la compañia esta habilidad para realizar reservacion
                        if(companyParams.AvailableReservation){
                            console.log("EMPRESA HABILITADA PARA RESERVAS");
                            details.map(async item=>{

                                //obteniendo stock de producto  (bodega principal)
                                let infoInventary=await inventory.findOne({_id:item.Inventory},['Stock','Product'])
                                .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                console.log('EN STOCK:',infoInventary);

                                if(parseFloat(infoInventary.Stock)>=parseFloat(item.Quantity)){
                                        //reingresando cantidad que se reservo
                                        inventory.findByIdAndUpdate({_id:item.Inventory},{
                                            Stock:parseFloat(infoInventary.Stock + parseFloat( item.Quantity)),
                                        }).then(result=> console.log(result))
                                        .catch(err => {console.log(err);});

                                        //stock de bodega de reserva
                                        console.log(infoInventary.Product);
                                        let productreserved=await inventory.findOne({Product:infoInventary.Product, _id: { $nin: infoInventary._id }},['Stock','Product'])
                                        .populate({path: 'Bodega', model: 'Bodega', match:{Name:'Reserva'}})
                                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                      
                                        //actualizando el stock de reserva
                                        //sacando el producto
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
                                        inventorytraceability.DocumentNumber=codorder;
                                        inventorytraceability.DocType="Orden de Venta";

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
                           
                    }
                });
           }
           res.status(200).send({ userDeleted});
           
          }
        }
      });
}

async function anulaSaleOrder(req, res){
    let saleId=req.params.id;
    let Company=req.body.Customer.Company;
    let quote=req.body.CustomerQuote;
    let User=req.body.User;
    let codorder=req.body.CodSaleOrder;
    const codigop=req.body.CodProduct;
    let now= new Date();
    let creacion=now.toISOString().substring(0, 10);

   //obteniendo informacion de la compañia
    let companyParams=await company.findById(Company) 
    .then(params => {
        if(!params){
            res.status(404).send({message:"No hay "});
        }else{
            return(params)
        }
    });

    saleOrder.findByIdAndUpdate({_id:saleId},{State:"Anulada"},async (err,update)=>{ //cambio de estado
        if(err){
            console.log(err);
        }
        if(update){
            if(quote!==null){
                //verificamos si orden se genero a partir de una cotizacion
                customerQuotesDetails.find({CustomerQuote: quote})
                .then(details => {
                    if(!details){
                        res.status(404).send({message:"No hay "});
                    }else{
                       console.log("si actualizao" ,details);
                       details.map(async item=>{  //cambiamos estado de todos los productos de la cotizacion 
                            customerQuotesDetails.findByIdAndUpdate({_id:item._id},{OnRequest:false},async (err,update)=>{
                                if(err){
                                    console.log(err);
                                }
                                if(!update){
                                    res.status(404).send({message:"No hay "});
                                }
                                else{
                                    //contamos los productos que estan en pedido
                                    let inRequest=await customerQuotesDetails.countDocuments({CustomerQuote:quote , OnRequest:true}, function (err, count) {
                                        console.log(count); return (count)
                                       });
                                       //cantidad total de los productos
                                       let allDetails=await customerQuotesDetails.countDocuments({CustomerQuote:quote}, function (err, count) {
                                        console.log(count); return (count)
                                       });
                                        console.log("en orden",inRequest);
                                        console.log("todos",allDetails);
                                        //si no esta completada la cotizacion pase a cerrada
                                       if(parseInt(inRequest)< parseInt(allDetails)){
                                        customerQuotes.findByIdAndUpdate({_id:quote},{State:"Cerrada"},async (err,update)=>{
                                            if(err){
                                                console.log(err);
                                            }
                                            if(update){
                                               
                                            }
                                        })
                                        //si esta completada pasa a Completada
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
           //si empresa tiene habilitada la reserva
           if(companyParams.AvailableReservation){
            console.log("EMPRESA HABILITADA PARA RESERVAS");
            saleOrderDetails.find({SaleOrder: saleId})
            .then(details => {
                 details.map(async item=>{

                //obteniendo stock de producto  (bodega principal)
                let infoInventary=await inventory.findOne({_id:item.Inventory},['Stock','Product'])
                .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                console.log('EN STOCK:',infoInventary);
                //obteniendo stock de producto de reserva
                let productreserved=await inventory.findOne({Product:infoInventary.Product, _id: { $nin: infoInventary._id }},['Stock','Product'])
                .populate({path: 'Bodega', model: 'Bodega', match:{Name:'Reserva'}})
                .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                if(parseFloat(productreserved.Stock)>=parseFloat(item.Quantity)){ //validando stock
                    console.log("ENCONTRO A REVERSION DEL INVENTARIO");
                        //reingresando cantidad que se reservara
                        inventory.findByIdAndUpdate({_id:item.Inventory},{  //regresamos el producto que estaba en reserva a la bodega principal
                            Stock:parseFloat(infoInventary.Stock + parseFloat( item.Quantity)),
                        }).then(result=> console.log(result))
                        .catch(err => {console.log(err);});

                        //stock de bodega de reserva
                        console.log(infoInventary.Product);
                       
                        console.log('BODEGA RESERVA');
                        console.log(productreserved);

                        //actualizando el stock de reserva SACAMOS EL PRODUCTO DE RESERVA
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
                        inventorytraceability.DocumentNumber=codorder;
                        inventorytraceability.DocType="Orden de Venta";
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
            var order = result.filter(function (item) {  //filtrado por fecha para obtener solo las ordenes en el rango especificado por el usuario
                let fecha=new Date(item.CreationDate);
                
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

async function getOpenSaleOrders(req, res){
    const { id,company } = req.params;



    saleOrder.find({User:id,State:'Abierta'}).populate({path: 'Customer', model: 'Customer', match:{Company: company}})
    .then(orders => {
        if(!orders){
            res.status(404).send({message:"No hay "});
        }else{

            res.status(200).send({orders})
        }
    });


}

function getSaleOrderHeader(req, res){
    let invoiceId = req.params.id;
    let userId = req.params.user;
    let companyId = req.params.company;
    saleOrder.find({_id:invoiceId}).populate({path: 'User', model: 'User',match:{_id:userId}})
    .populate({path: 'Customer', model: 'Customer',match:{Company:companyId}})
    .then(details => {
        if(!details){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({details})
        }
    });
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
    getSaleOrdersbyCustomers,
    getOpenSaleOrders,
    getSaleOrderHeader
}
