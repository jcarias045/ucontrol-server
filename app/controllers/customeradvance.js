const CustomerAdvance=require('../models/advancepayment.model');
const CustomerAdvanceDetails=require('../models/advancepaymentdetails.model');
const customer = require("../models/customer.model");
const saleOrder = require("../models/saleorder.model");
const inventory = require("../models/inventory.model");
const inventoryTraceability = require("../models/inventorytraceability.model");
const company = require("../models/company.model");
const bodega = require("../models/bodega.model");
const MovementTypes = require("../models/movementtype.model");
const saleOrderDetails = require("../models/saleorderdetail.model");
const productAdvance= require("../models/advanceproductdetail.model");


async function addCustomerAdvance(req, res){
    const payment=new CustomerAdvance();
    const paymentDetails=new CustomerAdvanceDetails();

    let codigo=0;
   
    let now= new Date();
    let fecha=now.getTime();
   
    let creacion=now.toISOString().substring(0, 10);
    const {Company,User,saleOrderId,Customer,Monto,Total,Reason,productos,ProductId,Quantity,
        PaymentMethodId,NumberAccount, BankName,NoTransaction,PaymentMethodName}=req.body;

    console.log(req.body);
    let codigoPayment=await CustomerAdvance.findOne()
    .populate({path: 'User', model: 'User' , match:{Company: Company}}).sort({Codigo:-1}).then(function(doc){
        if(doc){
            if(doc.Codigo!==null){
                return(doc.Codigo)
            }
        }
       
    });
     //obteniendo informacion de la compañia para validar
     let companyParams=await company.findById(Company) //esta variable la mando a llamar luego que se ingreso factura
     .then(params => {
         if(!params){
             res.status(404).send({message:"No hay "});
         }else{
             return(params)
         }
     });
    console.log("Obtenido",codigoPayment);
    if(!codigoPayment){
        codigo =1;
    }else {codigo=codigoPayment+1}
    console.log("CODIGO DEL PAGO",codigo);
    console.log("MONTO INGRESADO",Monto);
    //obteniendo total de la factura, Para comprobar respecto al saldo

    let totalaPagarInvoice=await saleOrder.findOne({_id:saleOrderId},'Total')
    .then(resultado =>{return resultado} );
    // verificando si factura ya tiene un pago.
    let existePago=await CustomerAdvance.findOne({SaleOrder:saleOrderId},'Saldo')
    .then(resultado =>{return resultado});
    //obteniendo cuenta/deuda 
    let deudaCliente=await customer.findOne({_id:Customer}).then(function(doc){
        console.log(doc);
            if(doc){
                    if(doc.AccountsReceivable!==null){
                return(doc.AccountsReceivable)
            }
        }
    });
    console.log(existePago);
    let totalFactura=  totalaPagarInvoice.Total;
    let saldoActual=existePago!==null?parseFloat(existePago.Saldo).toFixed(2):0;
    let deuda=deudaCliente;
    console.log(parseFloat(totalaPagarInvoice.Total).toFixed(2));
    console.log('existe ya',existePago);
    console.log(deudaCliente);
    console.log("saldo actuasl",saldoActual);
    console.log("Monto",parseFloat(Monto).toFixed(2));
    payment.SaleOrder=saleOrderId;
    payment.DatePayment=creacion;
    payment.User=User;
    payment.Codigo=codigo;
    payment.Customer=Customer;
    payment.Saldo=parseFloat(totalFactura).toFixed(2)-parseFloat(Monto).toFixed(2);
    if(existePago!==null){
        console.log("PAGOOO PREVIO");
        if(parseFloat(totalFactura)<parseFloat(Monto)){
            res.status(500).send({message:"Monto Superior a Deuda"});
        }else{
            if(parseFloat(saldoActual)< parseFloat(Monto)){
                res.status(500).send({message:"Monto Superior a saldo pendiente"});
            }else{

                CustomerAdvance.updateOne({SaleOrder : saleOrderId},
                    {Saldo: parseFloat(saldoActual).toFixed(2)-parseFloat(Monto).toFixed(2)}).catch(err => {console.log(err);});
                
                //para obtener el id del pago realizado
                let getPaymentId=await CustomerAdvance.findOne({SaleOrder:saleOrderId},'_id')
                .then(resultado => {return resultado});
                console.log("ID OBTENUIDO",getPaymentId);
                if(getPaymentId){
                    paymentDetails.CreationDate=creacion;
                    paymentDetails.Reason=Reason;
                    paymentDetails.PaymentMethods=PaymentMethodId;
                    paymentDetails.Cancelled=false;
                    paymentDetails.Amount=Monto;
                    paymentDetails.CustomerAdvance=getPaymentId._id;
                    paymentDetails.SaleOrder=saleOrderId;
                    paymentDetails.Product=ProductId;
                    paymentDetails.Quantity=Quantity;
                    if(PaymentMethodName!=='Contado'){
                        paymentDetails.NumberAccount=NumberAccount;
                        paymentDetails.BankName= BankName;
                        paymentDetails.NoTransaction= NoTransaction;
                    }
                    if(PaymentMethodName==='Contado'){
                        paymentDetails.NumberAccount=null;
                        paymentDetails.BankName= null;
                        paymentDetails.NoTransaction= null;
                    }
                    console.log(paymentDetails);
                    paymentDetails.save(async (err, detailStored)=>{
                        if(err){
                            res.status(500).send({message: err});
                            console.log(err);
                        }else {
                            if(!detailStored){
                                res.status(500).send({message: err});
                            }
                            else{
                                console.log("DETALLLESS!");
                                console.log(detailStored);
                                let paymentDetailId=detailStored._id;
                             
                                if(paymentDetailId){
                                    let bodegaPrincipal=await bodega.findOne({Name:'Principal', Company:Company},['_id'])
                                    .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                        
                                    let bodegaAnticipo=await bodega.findOne({Name:'Anticipo', Company:Company},['_id'])
                                    .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                     
                                    let advanceProduct=[];
                                    productos.map(item =>{
                                       advanceProduct.push({
                                        CustomerAdvanceDetail:paymentDetailId,
                                        Product:item.Product, 
                                        Quantity:item.Quantity,
                                        State:true, 
                                        Price:item.Price,
                                        ProductName:item.ProductName,
                                        Measure:item.Measure,
                                        CodProduct:item.CodProduct,
                                        Inventory: item.Inventory._id
                                       })

                                    });

                                    productAdvance.insertMany(advanceProduct)
                                    .then(function (detalles) {
                                        console.log("Se inserto Producto con anticipo",detalles);
                                    });

                                    if(companyParams.AvailableReservation){
                                        let bodegaReserva=await bodega.findOne({Name:'Reserva', Company:Company},['_id'])
                                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

                                       
                                        productos.map(async item =>{
                                              let inventarioReserva=await inventory.findOne({Product:item.Product, Bodega:bodegaReserva._id},['Stock','Product'])
                                              .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

                                              let inventarioAnticipo=await inventory.findOne({Product:item.Product, Bodega:bodegaAnticipo._id},['Stock','Product'])
                                              .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

                                              let movementId=await MovementTypes.findOne({Name:'anticipo'},['_id'])
                                              .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

                                              if(inventarioReserva.Stock >= item.Quantity){
                                                inventory.findByIdAndUpdate({_id:inventarioReserva._id},{
                                                    Stock:parseFloat((inventarioReserva.Stock - parseFloat(item.Quantity)) ),
                                                }).then(result=> console.log(result))
                                                .catch(err => {console.log(err);});

                                                inventory.findByIdAndUpdate({_id:inventarioAnticipo._id},{
                                                    Stock:parseFloat((inventarioAnticipo.Stock + parseFloat(item.Quantity)) ),
                                                }).then(result=> console.log(result))
                                                .catch(err => {console.log(err);});

                                                saleOrderDetails.findByIdAndUpdate({_id:item._id},{
                                                  inAdvanced:true
                                                }).then(result=> console.log("ACTUALIZACION DE EN ANTIXO",result))
                                                .catch(err => {console.log("ELE ERIR",err);});
                    
                                                //registro de movimiento
                                                const inventorytraceability= new inventoryTraceability();
                                                inventorytraceability.Quantity=item.Quantity;
                                                inventorytraceability.Product=item.Product;
                                                inventorytraceability.WarehouseDestination=inventarioAnticipo._id; //destino
                                                inventorytraceability.MovementType=movementId._id;
                                                inventorytraceability.MovDate=creacion;
                                                inventorytraceability.WarehouseOrigin=inventarioReserva._id; //origen
                                                inventorytraceability.User=User;
                                                inventorytraceability.Company=Company;
                                                inventorytraceability.DocumentId=getPaymentId._id;
                                                inventorytraceability.ProductDestiny=null;
                                                inventorytraceability.Cost=parseFloat(item.Quantity)*parseFloat(item.Price);
                                                inventorytraceability.save((err, traceabilityStored)=>{
                                                    if(err){
                                                        // res.status(500).send({message: err});
                                                        console.log(err);
                    
                                                    }else {
                                                        if(!traceabilityStored){
                                                            // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                                            console.log(traceabilityStored);
                                                        }
                                                        else{
                                                            console.log(traceabilityStored);
                                                        }}
                                                    });
                                              }
                                        });
                                        

                                    }
                                    if(!companyParams.AvailableReservation){
                                      
                                      
                                        productos.map(async item =>{
                                            let inventarioPrincipal=await inventory.findOne({Product:item.Product, Bodega:bodegaPrincipal._id},['Stock','Product'])
                                            .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

                                              let inventarioAnticipo=await inventory.findOne({Product:item.Product, Bodega:bodegaAnticipo._id},['Stock','Product'])
                                              .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

                                              let movementId=await MovementTypes.findOne({Name:'anticipo'},['_id'])
                                              .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

                                              if(inventarioPrincipal.Stock >= item.Quantity){
                                                inventory.findByIdAndUpdate({_id:inventarioPrincipal._id},{
                                                    Stock:parseFloat((inventarioPrincipal.Stock - parseFloat(item.Quantity)) ),
                                                }).then(result=> console.log(result))
                                                .catch(err => {console.log(err);});

                                                inventory.findByIdAndUpdate({_id:inventarioAnticipo._id},{
                                                    Stock:parseFloat((inventarioAnticipo.Stock + parseFloat(item.Quantity)) ),
                                                }).then(result=> console.log(result))
                                                .catch(err => {console.log(err);});
                                               
                                                saleOrderDetails.findByIdAndUpdate({_id:item._id},{
                                                    inAdvanced:true
                                                  }).then(result=> console.log("ACTUALIZACION DE EN ANTIXO",result))
                                                  .catch(err => {console.log("EL ERROR",err);});
                                                //registro de movimiento
                                                const inventorytraceability= new inventoryTraceability();
                                                inventorytraceability.Quantity=item.Quantity;
                                                inventorytraceability.Product=item.Product;
                                                inventorytraceability.WarehouseDestination=inventarioAnticipo._id; //destino
                                                inventorytraceability.MovementType=movementId._id;
                                                inventorytraceability.MovDate=creacion;
                                                inventorytraceability.WarehouseOrigin=inventarioPrincipal._id; //origen
                                                inventorytraceability.User=User;
                                                inventorytraceability.Company=Company;
                                                inventorytraceability.DocumentId=getPaymentId._id;
                                                inventorytraceability.ProductDestiny=null;
                                                inventorytraceability.Cost=parseFloat(item.Quantity)*parseFloat(item.Price);
                                                inventorytraceability.save((err, traceabilityStored)=>{
                                                    if(err){
                                                        // res.status(500).send({message: err});
                                                        console.log(err);
                    
                                                    }else {
                                                        if(!traceabilityStored){
                                                            // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                                            console.log(traceabilityStored);
                                                        }
                                                        else{
                                                            console.log(traceabilityStored);
                                                        }}
                                                    });
                                              }
                                        });

                                    }
                                    
                                }
                                res.status(200).send({pago: detailStored});
                            }
                        }
                    });
                    
                }
            }
        }
    }
    else{
        console.log("NUEVO PAGO DESDE CERO");
    console.log("Saldo de factura",parseFloat(totalFactura));
    console.log("Saldo de factura", parseFloat(Monto));
    let totalFact=parseFloat(totalFactura);
    let montoAnticipo=parseFloat(totalFactura);
    let paymentid=null;
        if(parseFloat(totalFact) < parseFloat(montoAnticipo)){
            res.status(500).send({message:"Monto Superior a Deudass"});
        }else{
            payment.save((err, paymentStored)=>{
                if(err){
                    res.status(500).send({message: err});
        
                }else {
                    if(!paymentStored){
                        res.status(500).send({message: "No se inserto registro"});
        
                    }
                    else{
                         paymentid=paymentStored._id;
                        console.log('METODO',PaymentMethodId);
                        console.log('ID DEL PAGOOOOO',paymentid);
                        paymentDetails.CreationDate=creacion;
                        paymentDetails.Reason=Reason;
                        paymentDetails.PaymentMethods=PaymentMethodId;
                        paymentDetails.Cancelled=false;
                        paymentDetails.Amount=Monto;
                        paymentDetails.CustomerAdvance=paymentid;
                        paymentDetails.SaleOrder=saleOrderId;
                        paymentDetails.Product=ProductId;
                        paymentDetails.Quantity=Quantity;
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
                                    console.log("detalles insetados",detailStored);
                                    if(paymentDetailId){
                                        let bodegaPrincipal=await bodega.findOne({Name:'Principal', Company:Company},['_id'])
                                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                            
                                        let bodegaAnticipo=await bodega.findOne({Name:'Anticipo', Company:Company},['_id'])
                                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
     
                                       
                                        let advanceProduct=[];
                                        productos.map(item =>{
                                           advanceProduct.push({
                                            CustomerAdvanceDetail:paymentDetailId,
                                            Product:item.Product, 
                                            Quantity:item.Quantity,
                                            State:true, 
                                            Price:item.Price,
                                            ProductName:item.ProductName,
                                            Measure:item.Measure,
                                            CodProduct:item.CodProduct,
                                            Inventory: item.Inventory._id
                                           })
    
                                        });
    
                                        productAdvance.insertMany(advanceProduct)
                                        .then(function (detalles) {
                                            console.log("Se inserto Producto con anticipo",detalles);
                                        });
                                       
                                        if(companyParams.AvailableReservation){
                                            let bodegaReserva=await bodega.findOne({Name:'Reserva', Company:Company},['_id'])
                                            .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
    
                                           
                                            productos.map(async item =>{
                                                  let inventarioReserva=await inventory.findOne({Product:item.Product, Bodega:bodegaReserva._id},['Stock','Product'])
                                                  .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
    
                                                  let inventarioAnticipo=await inventory.findOne({Product:item.Product, Bodega:bodegaAnticipo._id},['Stock','Product'])
                                                  .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
    
                                                  let movementId=await MovementTypes.findOne({Name:'anticipo'},['_id'])
                                                  .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
    
                                                  if(inventarioReserva.Stock >= item.Quantity){
                                                    inventory.findByIdAndUpdate({_id:inventarioReserva._id},{
                                                        Stock:parseFloat((inventarioReserva.Stock - parseFloat(item.Quantity)) ),
                                                    }).then(result=> console.log(result))
                                                    .catch(err => {console.log(err);});
    
                                                    inventory.findByIdAndUpdate({_id:inventarioAnticipo._id},{
                                                        Stock:parseFloat((inventarioAnticipo.Stock + parseFloat(item.Quantity)) ),
                                                    }).then(result=> console.log(result))
                                                    .catch(err => {console.log(err);});

                                                    saleOrderDetails.findByIdAndUpdate({_id:item._id},{
                                                        inAdvanced:true
                                                      }).then(result=> console.log("CAMBIO DE ESTADO DE ANTICIPO",result))
                                                      .catch(err => {console.log("EL EROR",err);});
                        
                                                    //registro de movimiento
                                                    const inventorytraceability= new inventoryTraceability();
                                                    inventorytraceability.Quantity=item.Quantity;
                                                    inventorytraceability.Product=item.Product;
                                                    inventorytraceability.WarehouseDestination=inventarioAnticipo._id; //destino
                                                    inventorytraceability.MovementType=movementId._id;
                                                    inventorytraceability.MovDate=creacion;
                                                    inventorytraceability.WarehouseOrigin=inventarioReserva._id; //origen
                                                    inventorytraceability.User=User;
                                                    inventorytraceability.Company=Company;
                                                    inventorytraceability.DocumentId=paymentid;
                                                    inventorytraceability.ProductDestiny=null;
                                                    inventorytraceability.Cost=parseFloat(item.Quantity)*parseFloat(item.Price);
                                                    inventorytraceability.save((err, traceabilityStored)=>{
                                                        if(err){
                                                            // res.status(500).send({message: err});
                                                            console.log(err);
                        
                                                        }else {
                                                            if(!traceabilityStored){
                                                                // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                                                console.log(traceabilityStored);
                                                            }
                                                            else{
                                                                console.log(traceabilityStored);
                                                            }}
                                                        });
                                                  }
                                            });
                                            
    
                                        }
                                        if(!companyParams.AvailableReservation){
                                          
                                          
                                            productos.map(async item =>{
                                                let inventarioPrincipal=await inventory.findOne({Product:item.Product, Bodega:bodegaPrincipal._id},['Stock','Product'])
                                                .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
    
                                                  let inventarioAnticipo=await inventory.findOne({Product:item.Product, Bodega:bodegaAnticipo._id},['Stock','Product'])
                                                  .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
    
                                                  let movementId=await MovementTypes.findOne({Name:'anticipo'},['_id'])
                                                  .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
    
                                                  if(inventarioPrincipal.Stock >= item.Quantity){
                                                    inventory.findByIdAndUpdate({_id:inventarioPrincipal._id},{
                                                        Stock:parseFloat((inventarioPrincipal.Stock - parseFloat(item.Quantity)) ),
                                                    }).then(result=> console.log(result))
                                                    .catch(err => {console.log(err);});
    
                                                    inventory.findByIdAndUpdate({_id:inventarioAnticipo._id},{
                                                        Stock:parseFloat((inventarioAnticipo.Stock + parseFloat(item.Quantity)) ),
                                                    }).then(result=> console.log(result))
                                                    .catch(err => {console.log(err);});
                                                    saleOrderDetails.findByIdAndUpdate({_id:item._id},{
                                                        inAdvanced:true
                                                      }).then(result=> console.log("ACTUALIZACION DE EN ANTIXO",result))
                                                      .catch(err => {console.log(err);});
                                                    //registro de movimiento
                                                    const inventorytraceability= new inventoryTraceability();
                                                    inventorytraceability.Quantity=item.Quantity;
                                                    inventorytraceability.Product=item.Product;
                                                    inventorytraceability.WarehouseDestination=inventarioAnticipo._id; //destino
                                                    inventorytraceability.MovementType=movementId._id;
                                                    inventorytraceability.MovDate=creacion;
                                                    inventorytraceability.WarehouseOrigin=inventarioPrincipal._id; //origen
                                                    inventorytraceability.User=User;
                                                    inventorytraceability.Company=Company;
                                                    inventorytraceability.DocumentId=paymentid;
                                                    inventorytraceability.ProductDestiny=null;
                                                    inventorytraceability.Cost=parseFloat(item.Quantity)*parseFloat(item.Price);
                                                    inventorytraceability.save((err, traceabilityStored)=>{
                                                        if(err){
                                                            // res.status(500).send({message: err});
                                                            console.log(err);
                        
                                                        }else {
                                                            if(!traceabilityStored){
                                                                // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                                                console.log(traceabilityStored);
                                                            }
                                                            else{
                                                                console.log(traceabilityStored);
                                                            }}
                                                        });
                                                  }
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
        }
    }
}


function getPaymentDetails(req, res){
    const { id} = req.params;
    console.log("DETALLES",id);
    CustomerAdvanceDetails.find({SaleOrder:id})
    .populate({path: 'CustomerAdvance', model: 'CustomerAdvance',match:{SaleOrder:id}})
    .populate({path: 'PaymentMethods', model: 'PaymentMethods'})
    .then(details => {
        if(!details){
            res.status(404).send({message:"No hay "});
        }else{
            
            res.status(200).send({details})
            
        }
    });

}
function getExportExcelInfo(req, res){
    CustomerAdvanceDetails.find()
    .populate({path: 'CustomerAdvance', model: 'CustomerAdvance',match:{SaleOrder:id}})
    .populate({path: 'PaymentMethods', model: 'PaymentMethods'})
    .then(details => {
        if(!details){
            res.status(404).send({message:"No hay "});
        }else{
            
            res.status(200).send({details})
            
        }
    });
}

async function updatePaymentInvoice(req, res){
    let detailId=req.params.id;
    let monto=0;
    // let Customer=req.body.Customer;
    let idpay=req.body.idpayment;
    let saldop=req.body.saldopendiente;
    let montoRegistrado=req.body.montoReg;
    let invoiceId= req.body.ID_PurchaseInvoice;
    let cambios=req.body.change;

    console.log("cambios", req.body);
    const {Customer,idpayment,saldopendiente,Total,saleOrderId,_id}=req.body;
    
    //obteniendo total de la factura, Para comprobar respecto al saldo

  
    
    
    let totalaPagarInvoice=await saleOrder.findOne({_id:saleOrderId},'Total')
    .then(resultado =>{return resultado} );
    // verificando si factura ya tiene un pago.
    let existePago=await CustomerAdvance.findOne({SaleOrder:saleOrderId},'Saldo')
    .then(resultado =>{return resultado});
    //obteniendo cuenta/deuda 
    let deudaCliente=await customer.findOne({_id:Customer}).then(function(doc){
        console.log(doc);
            if(doc){
                    if(doc.AccountsReceivable!==null){
                return(doc.AccountsReceivable)
            }
        }
    });
    
    let deuda=deudaCliente;
    let detailPayment=await CustomerAdvanceDetails.findById(detailId);
    
    if(detailPayment)
    {
        if(cambios.Amount){
            //reversion del monto con el que se registro el pago
            // customer.findByIdAndUpdate({_id:Customer},{AccountsReceivable: parseFloat(deuda)+parseFloat(montoRegistrado)},(err,purchaseUpdate)=>{
            //     if(err){
            //         console.log(err);
            //     } 
            // });
            console.log('registrado',montoRegistrado,saldopendiente);
            let actSaldo= parseFloat(saldopendiente) + parseFloat(montoRegistrado);
            CustomerAdvance.findByIdAndUpdate({_id:idpayment},{Saldo:actSaldo.toFixed(2) },async (err,purchaseUpdate)=>{
                if(err){
                    console.log(err);
                } else{
                    let nuevoSaldo=await CustomerAdvance.findOne({_id:idpayment},'Saldo')
                    .then(resultado =>{return resultado});
                    let nuevaCuentaxPagar=await customer.findOne({_id:Customer},'AccountsReceivable')
                    .then(resultado =>{return resultado}).catch(err =>{return err});
                    // console.log('nuevo saldo',nuevoSaldo);
                    // console.log('nuevo cuenta',nuevaCuentaxPagar.AccountsReceivable);
                    if(parseFloat(nuevoSaldo.Saldo)>= parseFloat(cambios.Amount) )
                    {
                        console.log("PERMITEE PAGOOO");
                        // customer.findByIdAndUpdate({_id:Customer},{AccountsReceivable: parseFloat(deuda)-parseFloat(cambios.Amount)},(err,purchaseUpdate)=>{
                        //     if(err){
                        //         console.log(err);
                        //     } 
                        // });
            
                        CustomerAdvance.findByIdAndUpdate({_id:idpayment},{Saldo: parseFloat(nuevoSaldo.Saldo)-parseFloat(cambios.Amount)},(err,purchaseUpdate)=>{
                            if(err){
                                console.log(err);
                            } 
                        });
        
                        
                        let updateDetails={
                            Amount:cambios.Amount,
                            BankName: cambios.BankName?cambios.BankName:null,
                            NumberAccount:cambios.Number?cambios.Number:null,
        
                        }
        
                        CustomerAdvanceDetails.findByIdAndUpdate(detailId,updateDetails,async (err,detailUpdated)=>{
                            if(err){
                                console.log(err);
                            } else{
                                console.log(detailUpdated);
                                console.log(idpayment);
                                console.log("SUMANDO PAGOS");
                                console.log("EL ID DEL PAGO",_id);
                                let sumMontos=await CustomerAdvanceDetails.aggregate([
                                    {$match :{CustomerAdvance: detailUpdated.CustomerAdvance, Cancelled:false}},
                                
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
                                 console.log('suma',sumaMontos);
                                 if(parseFloat(sumaMontos)===parseFloat(Total)){
                                    console.log('SUMANDO MONTOS');
                                    saleOrder.findByIdAndUpdate({_id:_id},{Pagada:true},(err,updateDeuda)=>{
                                        if(err){
                                            console.log(err);
                                        }
                                    });
                                }else{
                                    saleOrder.findByIdAndUpdate({_id:_id},{Pagada:false},(err,updateDeuda)=>{
                                        if(err){
                                            console.log(err);
                                        }
                                    });
                                }
                                res.status(200).json(detailUpdated);
                            }
                        });
                        
                        
        
        
                        
                    }
                }
            });
           

        }
    }
}

async function cancelledPaymentInvoice(req, res){
    let detailId=req.params.id;
    let monto=0;
    
    let idpay=req.body.idpayment;
    let saldop=req.body.saldopendiente;
    let montoRegistrado=req.body.montoReg;
    let saleorderId= req.body.saleOrderId;
    let cambios=req.body.change;
    const {Customer,idpayment,saldopendiente,Total,_id,User}=req.body;
    console.log('purchase invoice',_id);
    //obteniendo total de la factura, Para comprobar respecto al saldo
     
    let now= new Date();
    let fecha=now.getTime();
   
    let creacion=now.toISOString().substring(0, 10);
    let totalaPagarInvoice=await saleOrder.findOne({_id:_id},'Total')
    .then(resultado =>{return resultado} );
    // verificando si factura ya tiene un pago.
    let existePago=await CustomerAdvance.findOne({saleOrder:_id},'Saldo')
    .then(resultado =>{return resultado});
    //obteniendo cuenta/deuda 
    
    let Company=await customer.findOne({_id:Customer}).then(function(doc){
        console.log(doc);
            if(doc){
                    if(doc.Company!==null){
                return(doc.Company)
            }
        }
    });
      //obteniendo informacion de la compañia para validar
      let companyParams=await company.findById(Company) //esta variable la mando a llamar luego que se ingreso factura
      .then(params => {
          if(!params){
              res.status(404).send({message:"No hay "});
          }else{
              return(params)
          }
      });
    let deuda=0;
    let detailPayment=await CustomerAdvanceDetails.findById(detailId);
    
    if(detailPayment)
    {       
           let newTotal=parseFloat(deuda)+parseFloat(montoRegistrado);
           if(parseFloat(totalaPagarInvoice) < parseFloat(newTotal)){
            res.status(500).send({message: "No se inserto registro"});
           }else{
            //    //reversion del monto con el que se registro el pago
            // customer.findByIdAndUpdate({_id:Customer},{AccountsReceivable: parseFloat(deuda)+parseFloat(montoRegistrado)},(err,purchaseUpdate)=>{
            //     if(err){
            //         console.log(err);
            //     } 
            // });

            CustomerAdvance.findByIdAndUpdate({_id:idpayment},{Saldo: parseFloat(saldopendiente)+parseFloat(montoRegistrado)},(err,purchaseUpdate)=>{
                if(err){
                    console.log(err);
                } else{console.log('cambios',purchaseUpdate);}
            });
            
            let updateDetails={
                Cancelled:true,
                

            }

            CustomerAdvanceDetails.findByIdAndUpdate(detailId,updateDetails,async (err,detailUpdated)=>{
                if(err){
                    console.log(err);
                } else{
                    if(detailUpdated){
                        let productos=await productAdvance.find({CustomerAdvanceDetail:detailId}).then(result =>{return result})
                        console.log("LOS PRODUCTOS OBTENIDOS", productos);
                        
                        let bodegaPrincipal=await bodega.findOne({Name:'Principal', Company:Company},['_id'])
                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
            
                        let bodegaAnticipo=await bodega.findOne({Name:'Anticipo', Company:Company},['_id'])
                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

                       

                       
                        if(companyParams.AvailableReservation){
                            let bodegaReserva=await bodega.findOne({Name:'Reserva', Company:Company},['_id'])
                            .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

                           
                            productos.map(async item =>{
                                  let inventarioReserva=await inventory.findOne({Product:item.Product, Bodega:bodegaReserva._id},['Stock','Product'])
                                  .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

                                  let inventarioAnticipo=await inventory.findOne({Product:item.Product, Bodega:bodegaAnticipo._id},['Stock','Product'])
                                  .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

                                  let movementId=await MovementTypes.findOne({Name:'reversion'},['_id'])
                                  .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

                                  if(inventarioAnticipo.Stock >= item.Quantity){
                                    inventory.findByIdAndUpdate({_id:inventarioReserva._id},{
                                        Stock:parseFloat((inventarioReserva.Stock + parseFloat(item.Quantity)) ),
                                    }).then(result=> console.log(result))
                                    .catch(err => {console.log(err);});

                                    inventory.findByIdAndUpdate({_id:inventarioAnticipo._id},{
                                        Stock:parseFloat((inventarioAnticipo.Stock - parseFloat(item.Quantity)) ),
                                    }).then(result=> console.log("movio de anticipo",result))
                                    .catch(err => {console.log(err);});

                                    saleOrderDetails.findByIdAndUpdate({_id:item._id},{
                                        inAdvanced:true
                                      }).then(result=> console.log("ACTUALIZACION DE EN ANTIXO",result))
                                      .catch(err => {console.log(err);});
        
                                    //registro de movimiento
                                    const inventorytraceability= new inventoryTraceability();
                                    inventorytraceability.Quantity=item.Quantity;
                                    inventorytraceability.Product=item.Product;
                                    inventorytraceability.WarehouseDestination=inventarioReserva._id; //destino
                                    inventorytraceability.MovementType=movementId._id;
                                    inventorytraceability.MovDate=creacion;
                                    inventorytraceability.WarehouseOrigin=inventarioAnticipo._id; //origen
                                    inventorytraceability.User=User;
                                    inventorytraceability.Company=Company;
                                    inventorytraceability.DocumentId=idpayment;
                                    inventorytraceability.ProductDestiny=null;
                                    inventorytraceability.Cost=parseFloat(item.Quantity)*parseFloat(item.Price);
                                    inventorytraceability.save((err, traceabilityStored)=>{
                                        if(err){
                                            // res.status(500).send({message: err});
                                            console.log(err);
        
                                        }else {
                                            if(!traceabilityStored){
                                                // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                                console.log(traceabilityStored);
                                            }
                                            else{
                                                console.log(traceabilityStored);
                                            }}
                                        });
                                  }
                            });
                            

                        }
                        if(!companyParams.AvailableReservation){
                          
                          
                            productos.map(async item =>{
                                let inventarioPrincipal=await inventory.findOne({Product:item.Product, Bodega:bodegaPrincipal._id},['Stock','Product'])
                                .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

                                  let inventarioAnticipo=await inventory.findOne({Product:item.Product, Bodega:bodegaAnticipo._id},['Stock','Product'])
                                  .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

                                  let movementId=await MovementTypes.findOne({Name:'anticipo'},['_id'])
                                  .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

                                  if(inventarioAnticipo.Stock >= item.Quantity){
                                    inventory.findByIdAndUpdate({_id:inventarioPrincipal._id},{
                                        Stock:parseFloat((inventarioPrincipal.Stock + parseFloat(item.Quantity)) ),
                                    }).then(result=> console.log(result))
                                    .catch(err => {console.log(err);});

                                    inventory.findByIdAndUpdate({_id:inventarioAnticipo._id},{
                                        Stock:parseFloat((inventarioAnticipo.Stock - parseFloat(item.Quantity)) ),
                                    }).then(result=> console.log(result))
                                    .catch(err => {console.log(err);});
                                    saleOrderDetails.findByIdAndUpdate({_id:item._id},{
                                        inAdvanced:true
                                      }).then(result=> console.log("ACTUALIZACION DE EN ANTIXO",result))
                                      .catch(err => {console.log(err);});
                                    //registro de movimiento
                                    const inventorytraceability= new inventoryTraceability();
                                    inventorytraceability.Quantity=item.Quantity;
                                    inventorytraceability.Product=item.Product;
                                    inventorytraceability.WarehouseDestination=inventarioPrincipal._id; //destino
                                    inventorytraceability.MovementType=movementId._id;
                                    inventorytraceability.MovDate=creacion;
                                    inventorytraceability.WarehouseOrigin=inventarioAnticipo._id; //origen
                                    inventorytraceability.User=User;
                                    inventorytraceability.Company=Company;
                                    inventorytraceability.DocumentId=paymentid;
                                    inventorytraceability.ProductDestiny=null;
                                    inventorytraceability.Cost=parseFloat(item.Quantity)*parseFloat(item.Price);
                                    inventorytraceability.save((err, traceabilityStored)=>{
                                        if(err){
                                            // res.status(500).send({message: err});
                                            console.log(err);
        
                                        }else {
                                            if(!traceabilityStored){
                                                // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                                console.log(traceabilityStored);
                                            }
                                            else{
                                                console.log(traceabilityStored);
                                            }}
                                        });
                                  }
                            });

                        }
                        
                    }
                    
                    res.status(200).json(detailUpdated);
                }
            });
           }
            
        
    }
}


async function getAllAdvancePayments(req, res){
    const {id}=req.params;
    CustomerAdvance.find({User:id})
    .populate({path: 'SaleOrder', model: 'SaleOrder'}) .populate({path: 'Customer', model: 'Customer'})
    .sort({Codigo:-1})
  
    .then(pagos => {
        if(!pagos){
            res.status(404).send({message:"No hay "});
        }else{
            console.log(pagos);
            res.status(200).send({pagos})
        }
    });
}

function getAdvanceDetailsNocancelled(req, res){
    const { id} = req.params;
    console.log("DETALLES",id);
    CustomerAdvanceDetails.find({SaleOrder:id, Cancelled:false})
    .populate({path: 'CustomerAdvance', model: 'CustomerAdvance',match:{SaleOrder:id}})
    .populate({path: 'PaymentMethods', model: 'PaymentMethods'})
    .then(details => {
        if(!details){
            res.status(404).send({message:"No hay "});
        }else{
            
            res.status(200).send({details})
            
        }
    });

}


module.exports={
    addCustomerAdvance,
    getPaymentDetails,
    updatePaymentInvoice,
    cancelledPaymentInvoice,
    getAllAdvancePayments,
    getExportExcelInfo,
    getAdvanceDetailsNocancelled
}