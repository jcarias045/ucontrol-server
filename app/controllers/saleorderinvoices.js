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
const CustomerPayment=require('../models/customerpayments.model');
const CustomerPaymentDetails=require('../models/customerpaymentsdetails.model');
const correlativeDocument= require('../models/documentcorrelatives.model');
const taxes= require('../models/taxes.model');


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
    const payment=new CustomerPayment();
    const paymentDetails=new CustomerPaymentDetails();
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
    let creacion=now.toISOString().substring(0, 10);

    const {InvoiceDate,CustomerName,SaleOrderId,CommentsSaleOrder,Total,User,companyId,InvoiceNumber,Customer,Comments,
        diasCredito,InvoiceComments,condicionPago,Reason,PaymentMethodName,PaymentMethodId,Monto,NumberAccount,BankName,NoTransaction} = req.body;

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
    let deuda=deudaAct;
    //OBTENCION DE CORRELATIVOS
    //OBTENIENDO TIPO DE CLIENTE 
    let customerType=await customer.findOne({_id:Customer}).then(function(doc){
        console.log(doc);
            if(doc){
                    if(doc.TypeofTaxpayer!==null){
                return(doc.TypeofTaxpayer)
            }
        }
    });
    let correlativos= await correlativeDocument.findOne({ State:true}).populate({path: 'DocumentType', model:'DocumentType', match:{Ref: customerType.TypeofTaxpayer}})
    .then(docCorrelative => {
       if(docCorrelative){
          return docCorrelative
       }
      
    });
    
    let lengEndNumber=(correlativos.EndNumber).toString().length;
    let nLineas=parseInt(companyParams.InvoiceLines);
    let iniNumber=correlativos.StartNumber;
   
    console.log(iniNumber);
    console.log("lineas", nLineas);
    let longitudArreglo=details.length;
    console.log(longitudArreglo);
    let contador=0;
    let i=0;
    let step=0;
    let correlativeNumber=parseInt(iniNumber);
    console.log(longitudArreglo);
    //FIN DE OBTENCION DE CORRELATIVOS
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

    let  invoiceId=null;
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
                    invoiceId=SaleOrderStored._id;
                    let quoteId=SaleOrderStored.CustomerQuote;
                    //cambio de estado a orden de venta
                    saleOrders.findByIdAndUpdate({_id:SaleOrderId},{State:"Facturada"},async (err,update)=>{
                        if(err){
                            res.status(500).send({ message: "Error del servidor." });
                        }
                        if(update){}});
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

                                    // res.status(200).send({orden: detalles})
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

                    if(condicionPago==='Contado'){
                        console.log("PAGO DE CONTADO");
                          payment.save((err, paymentStored)=>{
                              if(err){
                                  res.status(500).send({message: err});
              
                              }else {
                                  if(!paymentStored){
                                      res.status(500).send({message: "No se inserto registro"});
              
                                  }
                                  else{
                                      let paymentid=paymentStored._id;
                                      console.log('METODO',PaymentMethodId);
                                      paymentDetails.CreationDate=creacion;
                                      paymentDetails.Reason=Reason;
                                      paymentDetails.PaymentMethods=PaymentMethodId;
                                      paymentDetails.Cancelled=false;
                                      paymentDetails.Amount=Monto;
                                      paymentDetails.CustomerPayment=paymentid;
                                      paymentDetails.SaleOrderInvoice=invoiceId;
              
                                      console.log(paymentDetails);
                                      if(PaymentMethodName!=='Contado'){
                                          paymentDetails.NumberAccount=PaymentMethodName==="TargetaCredito"?null:NumberAccount;
                                          paymentDetails.BankName= BankName;
                                          paymentDetails.NoTransaction= NoTransaction;
                                      }
                                      if(PaymentMethodName==='Contado'){
                                          paymentDetails.NumberAccount=null;
                                          paymentDetails.BankName= null;
                                          paymentDetails.NoTransaction= null;
                                      }
                                      paymentDetails.save(async (err, detailStored)=>{
                                          if(err){
                                              // res.status(500).send({message: err});
                                              console.log(err);
              
                                          }else {
                                              if(!detailStored){
                                                  // res.status(500).send({message: err});
                                                  console.log(err);
                                              }
                                              else{
                                                  let paymentDetailId=detailStored._id;
                                                  if(paymentDetailId){
                                                      let sumMontos=await CustomerPaymentDetails.aggregate([
                                                          {$match :{CustomerPayment: paymentid}},
              
                                                          {
                                                              $group:{
                                                                 _id:null,
                                                              "sumAmount":{$sum: '$Amount'}
                                                          }
                                                         },
              
                                                      ]);
                                                      let sumaMontos=0.0;
                                                      sumMontos.map(item =>{
                                                          sumaMontos=item.sumAmount;
                                                      })
                                                      //actualizando deuda con cliente
                                                      customer.findByIdAndUpdate({_id:Customer},{AccountsReceivable:parseFloat(deuda)-parseFloat(Monto)},(err,updateDeuda)=>{
                                                          if(err){
              
                                                              console.log(err);
                                                          }else{console.log(updateDeuda) }
                                                      });
                                                      if(parseFloat(sumMontos)===parseFloat(totalFactura)){
                                                          console.log('SUMANDO MONTOS');
                                                          saleOrderInvoice.findByIdAndUpdate({_id:invoiceId},{Pagada:true},(err,updateDeuda)=>{
                                                              if(err){
              
                                                                  console.log(err);
                                                              }else{console.log(updateDeuda);}
                                                          });
              
              
                                                      }
              
                                                  }
              
                                              }
                                          }
                                      });
              
                                      res.status(200).send({ paymentStored});
                                  }
                              }
                          })
                      }else{
                           res.status(200).send({orden: detalles});
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
    const payment=new CustomerPayment();
    const paymentDetails=new CustomerPaymentDetails();
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

    const {InvoiceDate,CustomerName,SaleOrderId,CommentsSaleOrder,Total,User,companyId,InvoiceNumber,Customer,Comments,
        diasCredito,InvoiceComments,condicionPago,Reason,PaymentMethodName,PaymentMethodId,Monto,NumberAccount,BankName,NoTransaction} = req.body;

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
    let deuda=deudaAct;
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
    let  invoiceId=null;
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
                    invoiceId=SaleOrderStored._id;
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

                                if(condicionPago==='Contado'){
                                    console.log("PAGO DE CONTADO");
                                    payment.SaleOrderInvoice=invoiceId;
                                    payment.DatePayment=creacion;
                                    payment.User=User;
                                    payment.codpayment=codigo;
                                    payment.Saldo=0;

                                    payment.save((err, paymentStored)=>{
                                        if(err){
                                            res.status(500).send({message: err});

                                        }else {
                                            if(!paymentStored){
                                                res.status(500).send({message: "No se inserto registro"});

                                            }
                                            else{
                                                let paymentid=paymentStored._id;
                                                console.log('METODO',PaymentMethodId);
                                                paymentDetails.CreationDate=creacion;
                                                paymentDetails.Reason=Reason;
                                                paymentDetails.PaymentMethods=PaymentMethodId;
                                                paymentDetails.Cancelled=false;
                                                paymentDetails.Amount=Monto;
                                                paymentDetails.CustomerPayment=paymentid;
                                                paymentDetails.SaleOrderInvoice=invoiceId;

                                                console.log(paymentDetails);
                                                if(PaymentMethodName!=='Contado'){
                                                    paymentDetails.NumberAccount=PaymentMethodName==="TargetaCredito"?null:NumberAccount;
                                                    paymentDetails.BankName= BankName;
                                                    paymentDetails.NoTransaction= NoTransaction;
                                                }
                                                if(PaymentMethodName==='Contado'){
                                                    paymentDetails.NumberAccount=null;
                                                    paymentDetails.BankName= null;
                                                    paymentDetails.NoTransaction= null;
                                                }
                                                paymentDetails.save(async (err, detailStored)=>{
                                                    if(err){
                                                        // res.status(500).send({message: err});
                                                        console.log(err);

                                                    }else {
                                                        if(!detailStored){
                                                            // res.status(500).send({message: err});
                                                            console.log(err);
                                                        }
                                                        else{
                                                            let paymentDetailId=detailStored._id;
                                                            if(paymentDetailId){
                                                                let sumMontos=await CustomerPaymentDetails.aggregate([
                                                                    {$match :{CustomerPayment: paymentid}},

                                                                    {
                                                                        $group:{
                                                                            _id:null,
                                                                        "sumAmount":{$sum: '$Amount'}
                                                                    }
                                                                    },

                                                                ]);
                                                                let sumaMontos=0.0;
                                                                sumMontos.map(item =>{
                                                                    sumaMontos=item.sumAmount;
                                                                })
                                                                //actualizando deuda con cliente
                                                                customer.findByIdAndUpdate({_id:Customer},{AccountsReceivable:parseFloat(deuda)-parseFloat(Monto)},(err,updateDeuda)=>{
                                                                    if(err){

                                                                        console.log(err);
                                                                    }else{console.log(updateDeuda) }
                                                                });

                                                                    saleOrderInvoice.findByIdAndUpdate({_id:invoiceId},{Pagada:true},(err,updateDeuda)=>{
                                                                        if(err){

                                                                            console.log(err);
                                                                        }else{console.log(updateDeuda);}
                                                                    });




                                                            }

                                                        }
                                                    }
                                                });


                                            }
                                        }
                                    })
                                }
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
    )}).populate({path: 'SaleOrderInvoice', model:'SaleOrderInvoice'})
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
    let Customer=req.body.Customer;
    let User=req.body.User;
    let updateInvoice={};
    let tipoProveedor=req.body.tipoProveedor;
    let entryDataDetail=[];
    let now= new Date();
    let fecha=now.getTime();

    let creacion=now.toISOString().substring(0, 10);

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

            //Deuda ppor cobrar actual
      let deudaAct=await customer.findOne({_id:Customer}).then(function(doc){
        console.log(doc);
            if(doc){
                    if(doc.AccountsReceivable!==null){
                return(doc.AccountsReceivable)
            }
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
                                            saleOrderInvoiceDetails.findByIdAndUpdate({_id: item._id },{
                                                iniQuantity:parseFloat(item.Quantity),
                                            }).then(result=> {
                                                console.log("ini",result);
                                            })
                                            .catch(err => {console.log(err);});
                                        }
                                    }
                                });


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

async function deleteSaleInvoiceDetails(req,res){
    const {_id,Quantity,Inventory,User,Customer,TotalAct,Total,SubTotal}=req.body;
    let now= new Date();
    let fecha=now.getTime();

    let creacion=now.toISOString().substring(0, 10);
    let companyId=Inventory.Company;
    console.log(req.body);
          //obteniendo informacion de la compañia para validar
    let companyParams=await company.findById(companyId) //esta variable la mando a llamar luego que se ingreso factura
    .then(params => {
        if(!params){
            res.status(404).send({message:"No hay "});
        }else{
            return(params)
        }
    });

      //Deuda ppor cobrar actual
      let deudaAct=await customer.findOne({_id:Customer}).then(function(doc){
        console.log(doc);
            if(doc){
                    if(doc.AccountsReceivable!==null){
                return(doc.AccountsReceivable)
            }
        }
    });
    console.log("deuda",deudaAct);
    saleOrderInvoiceDetails.find({_id: _id}).then(function (detalles){
             //cuenta por cobrar
             customer.findByIdAndUpdate({_id: Customer},{
                AccountsReceivable:(parseFloat(deudaAct)-parseFloat(SubTotal)),
            }).then(function(update){
                if(!update){

                }
                else{}}).catch(err =>{console.log(err)});
          detalles.map(async item =>{
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
                let movementId=await MovementTypes.findOne({Name:'reversion'},['_id'])
                .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

                if(!companyParams.AvailableReservation){
                     //descontando cantidad que se reservara
                     inventory.findByIdAndUpdate({_id:item.Inventory},{
                        Stock:parseFloat((infoInventary.Stock + parseFloat(item.Quantity)) ),
                    }).then(result=> console.log(result))
                    .catch(err => {console.log(err);});

                    //stock de bodega de reserva
                    console.log(infoInventary.Product);

                    console.log('id del moviminto de reserva', movementId);
                    //registro de movimiento
                    const inventorytraceability= new inventoryTraceability();
                    inventorytraceability.Quantity=item.Quantity;
                    inventorytraceability.Product=item.Product;
                    inventorytraceability.WarehouseDestination=infoInventary._id; //destino
                    inventorytraceability.MovementType=movementId._id;
                    inventorytraceability.MovDate=creacion;
                    inventorytraceability.WarehouseOrigin=null; //origen
                    inventorytraceability.User=User;
                    inventorytraceability.Company=companyId;
                    inventorytraceability.DocumentId=item.SaleOrderInvoice;

                    inventorytraceability.save((err, traceabilityStored)=>{
                        if(err){
                            // res.status(500).send({message: err});

                        }else {
                            if(!traceabilityStored){
                                // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                console.log(traceabilityStored);
                            }
                            else{
                                saleOrderInvoiceDetails.findByIdAndDelete(_id, (err, detailDeleted) => {
                                    if (err) {
                                      res.status(500).send({ message: "Error del servidor." });
                                    } else {
                                      if (!detailDeleted) {
                                        res.status(404).send({ message: "Detalle no encontrado" });
                                      } else {

                                        res.status(202).send({ deleted: detailDeleted});
                                      }
                                    }
                                })

                            }
                        }
                    });

                }
                if(companyParams.AvailableReservation){
                        //descontando cantidad que se reservara
                        inventory.findByIdAndUpdate({_id:productreserved._id},{
                            Stock:parseFloat((productreserved.Stock + parseFloat(item.Quantity)) ),
                        }).then(result=> console.log(result))
                        .catch(err => {console.log(err);});

                        //stock de bodega de reserva
                        console.log(productreserved.Product);



                        console.log('id del moviminto de reserva', movementId);
                        //registro de movimiento
                        const inventorytraceability= new inventoryTraceability();
                        inventorytraceability.Quantity=item.Quantity;
                        inventorytraceability.Product=item.Product;
                        inventorytraceability.WarehouseDestination=productreserved._id; //destino
                        inventorytraceability.MovementType=movementId._id;
                        inventorytraceability.MovDate=creacion;
                        inventorytraceability.WarehouseOrigin=null; //origen
                        inventorytraceability.User=User;
                        inventorytraceability.Company=companyId;
                        inventorytraceability.DocumentId=item.SaleOrderInvoice;

                        inventorytraceability.save((err, traceabilityStored)=>{
                            if(err){
                                // res.status(500).send({message: err});

                            }else {
                                if(!traceabilityStored){
                                    // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                    console.log(traceabilityStored);
                                }
                                else{
                                    saleOrderInvoiceDetails.findByIdAndDelete(_id, (err, detailDeleted) => {
                                        if (err) {
                                          res.status(500).send({ message: "Error del servidor." });
                                        } else {
                                          if (!detailDeleted) {
                                            res.status(404).send({ message: "Detalle no encontrado" });
                                          } else {

                                            res.status(202).send({ deleted: detailDeleted});
                                          }
                                        }
                                    })
                                }
                            }
                        });

                }
          })

    })




}

async function anularSaleInovice(req,res){
    let invoiceId=req.params.id;
    let  companyId=req.body.Customer.Company;
    let Customer=req.body.Customer._id;
    let saleOrder=req.body.SaleOrder;
    let User=req.body.User;
    let Total=req.body.Total;
    console.log(req.body);
    const codigop=req.body.CodProduct;
    let creacion = moment().format('DD/MM/YYYY');


    let companyParams=await company.findById( companyId) //esta variable la mando a llamar luego que se ingreso factura
    .then(params => {
        if(!params){
            res.status(404).send({message:"No hay "});
        }else{
            return(params)
        }
    });

        //Deuda ppor cobrar actual
        let deudaAct=await customer.findOne({_id:Customer}).then(function(doc){
            console.log(doc);
                if(doc){
                        if(doc.AccountsReceivable!==null){
                    return(doc.AccountsReceivable)
                }
            }
        });


    saleOrderInvoice.findByIdAndUpdate({_id:invoiceId},{State:"Anulada"},async (err,update)=>{
        if(err){
            res.status(500).send({ message: "Error del servidor." });
        }
        if(update){
               //cuenta por cobrar
            customer.findByIdAndUpdate({_id: Customer},{
                AccountsReceivable:(parseFloat(deudaAct)-parseFloat(Total)),
            }).then(function(update){
                if(!update){

                }
            else{}}).catch(err =>{console.log(err)});
            if(saleOrder!==null){
                saleOrders.findByIdAndUpdate({_id:saleOrder},{State:"Cerrada"},async (err,update)=>{
                    if(err){
                        res.status(500).send({ message: "Error del servidor." });
                    }
                    if(update){}})
            }
            saleOrderInvoiceDetails.find({SaleOrderInvoice : invoiceId})
            .then(function (detalles){

                    detalles.map(async item =>{
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
                            let movementId=await MovementTypes.findOne({Name:'reversion'},['_id'])
                            .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                            if(!companyParams.AvailableReservation){
                                                //descontando cantidad que se reservara
                                inventory.findByIdAndUpdate({_id:item.Inventory},{
                                    Stock:parseFloat((infoInventary.Stock +  parseFloat(item.Quantity)) ),
                                }).then(result=> console.log(result))
                                .catch(err => {console.log(err);});

                                //stock de bodega de reserva
                                console.log(infoInventary.Product);

                                console.log('id del moviminto de reserva', movementId);
                                //registro de movimiento
                                const inventorytraceability= new inventoryTraceability();
                                inventorytraceability.Quantity=item.Quantity;
                                inventorytraceability.Product=item.Product;
                                inventorytraceability.WarehouseDestination=infoInventary._id; //destino
                                inventorytraceability.MovementType=movementId._id;
                                inventorytraceability.MovDate=creacion;
                                inventorytraceability.WarehouseOrigin=null; //origen
                                inventorytraceability.User=User;
                                inventorytraceability.Company=companyId;
                                inventorytraceability.DocumentId=item.SaleOrderInvoice;

                                inventorytraceability.save((err, traceabilityStored)=>{
                                    if(err){
                                        // res.status(500).send({message: err});

                                    }else {
                                        if(!traceabilityStored){
                                            // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                            console.log(traceabilityStored);
                                        }
                                        else{}}})
                     }
                     if(companyParams.AvailableReservation){
                                            //descontando cantidad que se reservara
                            inventory.findByIdAndUpdate({_id:productreserved._id},{
                                Stock:parseFloat((productreserved.Stock + parseFloat(item.Quantity)) ),
                            }).then(result=> console.log(result))
                            .catch(err => {console.log(err);});

                            //stock de bodega de reserva
                            console.log(productreserved.Product);

                            console.log('id del moviminto de reserva', movementId);
                            //registro de movimiento
                            const inventorytraceability= new inventoryTraceability();
                            inventorytraceability.Quantity=item.Quantity;
                            inventorytraceability.Product=item.Product;
                            inventorytraceability.WarehouseDestination=productreserved._id; //destino
                            inventorytraceability.MovementType=movementId._id;
                            inventorytraceability.MovDate=creacion;
                            inventorytraceability.WarehouseOrigin=null; //origen
                            inventorytraceability.User=User;
                            inventorytraceability.Company=companyId;
                            inventorytraceability.DocumentId=item.SaleOrderInvoice;

                            inventorytraceability.save((err, traceabilityStored)=>{
                                if(err){
                                    // res.status(500).send({message: err});

                                }else {
                                    if(!traceabilityStored){
                                        // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                        console.log(traceabilityStored);
                                    }
                                    else{}}})
                    }
                })
            })
            .catch(err=>{console.log(err)});
            res.status(202).send({ updated: update});

        }else{
            res.status(404).send({ message: "No se anulo factura" });

        }
    });
}


async function getSaleInvoicesNoPagadas(req, res){
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


    saleOrderInvoice.find({User:id,Pagada:false}).populate({path: 'Customer', model: 'Customer', match:{Company: company}})
    .then(invoices => {
        if(!invoices){
            res.status(404).send({message:"No hay "});
        }else{

            res.status(200).send({invoices})
        }
    });
}
function getSaleInvoiceHeader(req, res){
    let invoiceId = req.params.id;
    let userId = req.params.user;
    let companyId = req.params.company;
    saleOrderInvoice.find({_id:invoiceId}).populate({path: 'User', model: 'User',match:{_id:userId}})
    .populate({path: 'Customer', model: 'Customer',match:{Company:companyId}})
    .then(details => {
        if(!details){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({details})
        }
    });
}


function getSaleInvoicePendientesIngreso(req, res){

    console.log(req.params.id);
    // PaymentToSupplier.find().populate({path: 'User', model: 'User',match:{_id:req.params.id}})
    // .populate({path: 'PurchaseInvoice', model: 'PurchaseInvoice',match:{Pagada:false}, populate:{path: 'Supplier', model: 'Supplier'}})
    saleOrderInvoice.find({Entregada:false,User:req.params.id}).populate({path: 'Customer', model: 'Customer'})
    .then(invoices => {
        if(!invoices){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({invoices})
        }
    });
}


function getChargestoCustomers(req, res){
    const { id } = req.params;

    
    customer.aggregate([
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
                from: "saleorderinvoices" ,
                let: {customerId: "$_id"},
                pipeline: [
                    { $match:
                        { $expr:
                            { $and:
                            [
                                { $eq: [ "$Customer",  "$$customerId" ] },
                                
                            ]
                            }
                        }
                    },
                    {$lookup: {
                        from: "customerpayments" ,
                        let: {invoiceId: "$_id"},
                        pipeline: [
                            { $match:
                                { $expr:
                                   
                                            { $eq: [ "$SaleOrderInvoice",  "$$invoiceId" ] }
                                       
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


function getSaleOrderInvoicebyCustomers(req, res){
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

        saleOrderInvoice.aggregate([
            {  $match: {Customer:ObjectID(supplierId)}},
        
            {
                $lookup: {
                    from:"saleinvoicedetails",
                   
                    let:{ordenId:"$_id"},
                    pipeline: [
                        { $match:
                            { $expr:
                               
                                    { $eq: [ "$SaleOrderInvoice",  "$$ordenId" ] }
                                   
                                }
                            },
                            {"$lookup": {
                                "from": "products" ,
                                "let": {"productId": "$Product"}, 
                                "pipeline": [
                                    { $match:{ $expr:
                               
                                        { $eq: [ "$_id",  "$$productId" ] }
                                       
                                    }},
                                    {
                                        "$lookup": {
                                            "from": "measures" ,
                                            let:{catId:"$Measure" },
                                             pipeline:[
                                                { $match:
                                                    { $expr:
                                                       
                                                            { $eq: [ "$_id",  "$$catId" ] }
                                                           
                                                        }
                                                    },
                                             ],
                                             as:"medidas"
                                        }

                                    }
                                ],
                                "as": "producto"
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


async function funcionPruebaCorrelativos(req,res){
    const {Company,Customer,details}=req.body;
    let companyParams=await company.findById(Company) //esta variable la mando a llamar luego que se ingreso factura
    .then(params => {
        if(!params){
            res.status(404).send({message:"No hay "});
        }else{
            return(params)
        }
    });

      //Deuda ppor cobrar actual
      let customerType=await customer.findOne({_id:Customer}).then(function(doc){
        console.log(doc);
            if(doc){
                    if(doc.TypeofTaxpayer!==null){
                return(doc.TypeofTaxpayer)
            }
        }
    });
    let correlativos= await correlativeDocument.findOne({ State:true}).populate({path: 'DocumentType', model:'DocumentType', match:{Ref: customerType.TypeofTaxpayer}})
    .then(docCorrelative => {
       if(docCorrelative){
          return docCorrelative
       }
      
    });

    
  
    let lengEndNumber=(correlativos.EndNumber).toString().length;
    let nLineas=parseInt(companyParams.InvoiceLines);
    let iniNumber=correlativos.StartNumber;
   
    console.log(iniNumber);
    console.log("lineas", nLineas);
    let longitudArreglo=details.length;
    console.log(longitudArreglo);
    let saltoCorrelativo=parseInt(iniNumber);
    let obj=[];
    let nuevo=[];
    var arreglo;
    let correlativosid=[];
   
    let contador=0;
    let i=0;
    let step=0;
    let correlativeNumber=parseInt(iniNumber);
    console.log(longitudArreglo);
    let deOrden=[];
    while(contador<longitudArreglo ){
       
                
        while (correlativeNumber.toString().length < lengEndNumber) {
            correlativeNumber = "0" + correlativeNumber;
            
        }
        console.log("save",correlativeNumber);
        console.log("contador",contador);
        for(let i=0; i<nLineas;i++){
           
                 if(details[contador+ i]){
                    //    console.log("prueba",details[contador+ i].dato);
                       deOrden.push({
                           ProductName:details[contador+ i].dato
                       })
                       
                 }
                 else{break}
                
                
          
        }
        console.log("lo que ingreso de detalle", deOrden);
       deOrden=[]
        contador +=nLineas;
        i+=1;
        
        correlativeNumber=parseInt(correlativeNumber)+1; 
        // console.log("el contador", contador);
        // console.log("paso",step);
    }
    console.log("i", i);
   
  
   
    
}

async function createSaleOrderInvoiceWithOrder2(req, res){

    const SaleOrderInvoice= new saleOrderInvoice();
    const ProductOuput= new productOutput();
    const payment=new CustomerPayment();
    const paymentDetails=new CustomerPaymentDetails();
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
    let creacion=now.toISOString().substring(0, 10);

    const {InvoiceDate,CustomerName,SaleOrderId,CommentsSaleOrder,Total,User,companyId,InvoiceNumber,Customer,Comments,
        diasCredito,InvoiceComments,condicionPago,Reason,PaymentMethodName,PaymentMethodId,Monto,NumberAccount,BankName,NoTransaction} = req.body;

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
    let deuda=deudaAct;
    //OBTENCION DE CORRELATIVOS
    //OBTENIENDO TIPO DE CLIENTE 
    let customerType=await customer.findOne({_id:Customer}).then(function(doc){
        
            if(doc){
                    if(doc.TypeofTaxpayer!==null){
                return(doc.TypeofTaxpayer)
            }
        }
    });
    let correlativos= await correlativeDocument.findOne({ State:true}).populate({path: 'DocumentType', model:'DocumentType', match:{Ref: customerType.toString()}})
    .then(docCorrelative => {
       if(docCorrelative){
          return docCorrelative
       }
      
    });
    console.log("type",customerType);
    let lengEndNumber=(correlativos.EndNumber).toString().length;
    let nLineas=parseInt(companyParams.InvoiceLines);
    let iniNumber=correlativos.StartNumber;
   
    console.log(iniNumber);
    console.log("lineas", nLineas);
    let longitudArreglo=dePurchaseOrder.length;
    console.log(longitudArreglo);
    let contador=0;
    let i=0;
    let step=0;
    let correlativeNumber=parseInt(iniNumber);
    console.log(longitudArreglo);
    //FIN DE OBTENCION DE CORRELATIVOS
    //Creacion de correlativo de doc

    if(!codigoSaleOrderInvoice){
        codigo =1;
    }else {codigo=codigoSaleOrderInvoice+1}


    if(!codOutput){
        codigoSalidas =1;
    }else {codigoSalidas=codOutput+1}

    //IMPUESTOS 
    let impuestosList=await taxes.find({document:'venta',Company:companyId})
    .then(taxes => {
        return(taxes)
      
    })
    //
    console.log(codOutput);
    console.log("Codigo de salida",codigoSalidas);

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
    // SaleOrderInvoice.InvoiceNumber=InvoiceNumber;
    
    let  invoiceId=null;
    let totalfactura=0.0;
    let sumimpuestos=0.0;
    if((companyParams.OrderWithWallet && (deudor || !deudor)) || (!companyParams.OrderWithWallet && !deudor) ){
       console.log("Si entro de condicion");
   
        SaleOrderInvoice.InvoiceNumber=correlativeNumber;
      
       while(contador<longitudArreglo){
        let band=false;
        while (correlativeNumber.toString().length < lengEndNumber) {
            correlativeNumber = "0" + correlativeNumber;
            
        }
       
        let factura=[{
            CodInvoice:codigo,
            Customer:Customer,
            Total:Total,
            Active:true,
            User:User,
            CreationDate: creacion,
            State:'Creada',
            InvoiceComments:InvoiceComments,
            CommentsofSale:CommentsSaleOrder,
            CustomerName:CustomerName,
            SaleOrder:SaleOrderId,
            InvoiceDate:InvoiceDate,
            Pagada:false,
            Entregada:!companyParams.RequieredOutput?true:false,
            InvoiceNumber:correlativeNumber
        }]
        console.log("save",correlativeNumber);
        console.log("CONTADOR ",contador);
       
        await saleOrderInvoice.insertMany(factura).then(async function (SaleOrderStored) {
            if(!SaleOrderStored){
                res.status(500).send({message: 'error'});
                 
            }else {
                band=true;
                
                    invoiceId=SaleOrderStored.map(item=>{return item._id}).toString();
                    let quoteId=SaleOrderStored.CustomerQuote;
                    //cambio de estado a orden de venta
                    console.log("INGRESOO FACT ",invoiceId);
                    console.log(SaleOrderStored);
                    // saleOrders.findByIdAndUpdate({_id:SaleOrderId},{State:"Facturada"},async (err,update)=>{
                    //     if(err){
                    //         res.status(500).send({ message: "Error del servidor." });
                    //     }
                    //     if(update){}});
                    if(invoiceId){
                        console.log("CONTADOR",contador);
                
                        for(let i=0; i<nLineas;i++){ 
                            console.log("arreglo de detalles",dePurchaseOrder[parseInt(contador)+ parseInt(i)]);
                            if(dePurchaseOrder[contador+ i]){
                               //    console.log("prueba",dePurchaseOrder[contador+ i].dato);
                              
                               totalfactura+=parseFloat(dePurchaseOrder[contador+ i].Quantity)* parseFloat(dePurchaseOrder[contador+ i].Price)
                               -  parseFloat(dePurchaseOrder[contador+ i].Quantity)* parseFloat(dePurchaseOrder[contador+ i].Price)*parseFloat(dePurchaseOrder[contador+ i].Discount/100);
                                  deOrden.push({
                                      
                                        ProductName:dePurchaseOrder[contador+ i].ProductName,
                                        SaleOrderInvoice:invoiceId,
                                        Quantity:parseFloat(dePurchaseOrder[contador+ i].Quantity) ,
                                        Discount:parseFloat(dePurchaseOrder[contador+ i].Discount),
                                        Price:parseFloat(dePurchaseOrder[contador+ i].Price),
                                        Inventory :dePurchaseOrder[contador+ i].Inventory._id,
                                        SubTotal: parseFloat(dePurchaseOrder[contador+ i].Quantity*dePurchaseOrder[contador+ i].Price)- parseFloat((dePurchaseOrder[contador+ i].Quantity*dePurchaseOrder[contador+ i].Price)*dePurchaseOrder[contador+ i].Discount),
                                        Entregados:!companyParams.RequieredOutput?dePurchaseOrder[contador+ i].Quantity:0,
                                        State:!companyParams.RequieredOutput?true:false,
                                        Measure:dePurchaseOrder[contador+ i].Measure,
                                        CodProduct:dePurchaseOrder[contador+ i].CodProduct,
                                        Product:dePurchaseOrder[contador+ i].Inventory.Product._id,
                                        Entregados:!companyParams.RequieredOutput?dePurchaseOrder[contador+ i].Quantity:0,
                                        iniQuantity:dePurchaseOrder[contador+ i].Quantity
                                  })
                                  
                            }
                            else{deOrden[null]}
                        }
                       
                     console.log("DETALLES A INGRESAR");
                     console.log(deOrden);
                    if(customerType.toString()==="CreditoFiscal"){
                         impuestosList.map(item=>{
                        sumimpuestos+=parseFloat(totalfactura* item.percentage/100);
                       })
                    }else{sumimpuestos=0}
                    
                       totalfactura=totalfactura+sumimpuestos;
                       console.log("EL TOTAL DE LA FACTURA ACTUAL",totalfactura);
                       saleOrderInvoice.findByIdAndUpdate({_id:invoiceId},{Total:totalfactura},async (err,update)=>{
                        if(err){
                            
                        }
                        if(update){}});
                     if(deOrden.length>0 || deOrden!==null){    //insertando detalles de los detalles de la orden
                        await saleOrderInvoiceDetails.insertMany(deOrden)
                        .then(async function (detalles) {
                            //si ingreso no requerido
                        
                            if(detalles){
                               
                                //cuenta por cobrar
                                let idfactura=detalles.map(item=>{return item.SaleOrderInvoice}).toString();
                                console.log("PARTE DE SALIDAS Y BODEGAS",condicionPago);
                                console.log("para factura",invoiceId);

                               customer.findByIdAndUpdate({_id:Customer},{
                                    AccountsReceivable:parseFloat(deudaAct)+parseFloat(Total),
                                }).then(function(update){
                                    if(!update){

                                    }
                                    else{}}).catch(err =>{console.log(err)});
                                    if(condicionPago==='Contado'){
                                        console.log("pago de cotados", totalfactura);
                                        let pago=[{
                                         SaleOrderInvoice:invoiceId,
                                         DatePayment:creacion,
                                         User:User,
                                         codpayment:codigo,
                                         Saldo:0,
                                         Customer:Customer
                                        }]
                                      console.log("PAGO DE CONTADO");
                                      
                
                                      await CustomerPayment.insertMany(pago)
                                      .then(function (paymentStored) {
                                            //   res.status(500).send({message: err});
                
                                         
                                              if(!paymentStored){
                                                  res.status(500).send({message: "No se inserto registro"});
                
                                              }
                                              else{
                                                  console.log("SE INSENTO APGO");
                                                  let paymentid=paymentStored.map(item=>{return item._id}).toString();
                                                  let codInvoice=paymentStored.map(item=>{return item.SaleOrderInvoice}).toString();
                                                  let payDetail=[{
                                                    CreationDate:creacion,
                                                    Reason:Reason,
                                                    PaymentMethods:PaymentMethodId,
                                                    Cancelled:false,
                                                    Amount:(totalfactura).toFixed(2),
                                                    CustomerPayment:paymentid,
                                                    SaleOrderInvoice:codInvoice,
                                                    NumberAccount:PaymentMethodName,
                                                    BankName: BankName,
                                                    NoTransaction: NoTransaction,
                                                  }]
                                                  console.log('METODO',PaymentMethodId);
                                                  
                                                  paymentDetails.Reason=Reason;
                                                  paymentDetails.PaymentMethods=PaymentMethodId;
                                                  paymentDetails.Cancelled=false;
                                                  paymentDetails.Amount=Monto;
                                                  paymentDetails.CustomerPayment=paymentid;
                                                  paymentDetails.SaleOrderInvoice=invoiceId;
                
                                                  console.log(paymentDetails);
                                                  if(PaymentMethodName!=='Contado'){
                                                      paymentDetails.NumberAccount=PaymentMethodName==="TargetaCredito"?null:NumberAccount;
                                                      paymentDetails.BankName= BankName;
                                                      paymentDetails.NoTransaction= NoTransaction;
                                                  }
                                                  if(PaymentMethodName==='Contado'){
                                                      paymentDetails.NumberAccount=null;
                                                      paymentDetails.BankName= null;
                                                      paymentDetails.NoTransaction= null;
                                                  }
                                                  CustomerPaymentDetails.insertMany(payDetail)
                                                    .then(async function (detailStored) {
                                                   
                                                          if(!detailStored){
                                                              // res.status(500).send({message: err});
                                                              console.log(err);
                                                          }
                                                          else{
                                                              let paymentDetailId=detailStored._id;
                                                              if(paymentDetailId){
                                                                  let sumMontos=await CustomerPaymentDetails.aggregate([
                                                                      {$match :{CustomerPayment: paymentid}},
                
                                                                      {
                                                                          $group:{
                                                                              _id:null,
                                                                          "sumAmount":{$sum: '$Amount'}
                                                                      }
                                                                      },
                
                                                                  ]);
                                                                  let sumaMontos=0.0;
                                                                  sumMontos.map(item =>{
                                                                      sumaMontos=item.sumAmount;
                                                                  })
                                                                  //actualizando deuda con cliente
                                                                  customer.findByIdAndUpdate({_id:Customer},{AccountsReceivable:parseFloat(deuda)-parseFloat(Monto)},(err,updateDeuda)=>{
                                                                      if(err){
                
                                                                          console.log(err);
                                                                      }else{console.log(updateDeuda) }
                                                                  });
                
                                                                      saleOrderInvoice.findByIdAndUpdate({_id:invoiceId},{Pagada:true},(err,updateDeuda)=>{
                                                                          if(err){
                
                                                                              console.log(err);
                                                                          }else{console.log(updateDeuda);}
                                                                      });
                
                
                
                
                                                              }
                
                                                          }
                                                      
                                                  });
                
                
                                              }
                                          
                                      })
                                  }
                             
                                if(!companyParams.RequieredOutput){
                                    console.log("salidas no requeridas",invoiceId);
                                    let salidaId=null;
                                    let salida=[{
                                       EntryDate:creacion,
                                       User:User,
                                       Comments:"Ingreso automatico "+creacion,
                                       State:true,
                                       CodOutput:codigoSalidas,
                                       Company:companyId,
                                       SaleOrderInvoice:invoiceId,
                                       Customer:Customer,
                                       InvoiceNumber:InvoiceNumber,
                                    }]
                                  
                                    ProductOuput.User=User;
                                    ProductOuput.Comments="Ingreso automatico "+creacion;
                                    ProductOuput.State=true;
                                    ProductOuput.CodOutput=codigoSalidas;
                                    ProductOuput.Company=companyId;
                                    ProductOuput.SaleOrderInvoice=invoiceId;
                                    ProductOuput.Customer=Customer;
                                    ProductOuput.InvoiceNumber=InvoiceNumber;
                                   
                                    productOutput.insertMany(salida)
                                    .then(function (outputStored) {
                                       
                                            if(!outputStored){
                                                console.log('no se ingreso entrada');

                                            }
                                            else{
                                                let salidaId=outputStored.map(item=>{return item._id}).toString();


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
                                        
                                    });

                                    // res.status(200).send({orden: detalles})
                             }
                                else{
                                  
                                    
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
         
        })
        deOrden=[];
        totalfactura=0.0;
        sumimpuestos=0.0;
        contador +=nLineas;
        i+=1;
        correlativeNumber=parseInt(correlativeNumber)+1;
        console.log("CONTADOR FINAL",contador); 
       
       }//fin del while
        res.status(200).send({orden: "cambios"});
       
    }
    
    if(!companyParams.OrderWithWallet && deudor){
        res.status(500).send({message: "No se puede registrar orden de venta a cliente"});
    }




}


module.exports={
    getSaleOrderInvoices,
    getSaleOrdersClosed,
    getSaleOrderInfo,
    getSaleOrderDetails,
    createSaleOrderInvoiceWithOrder,
    createSaleOrderInvoice,
    getSaleInvoiceDetails,
    updateSaleOrderInvoice,
    deleteSaleInvoiceDetails,
    anularSaleInovice,
    getSaleInvoicesNoPagadas,
    getSaleInvoiceHeader,
    getSaleInvoicePendientesIngreso,
    getChargestoCustomers,
    getSaleOrderInvoicebyCustomers,
    funcionPruebaCorrelativos,
    createSaleOrderInvoiceWithOrder2

}