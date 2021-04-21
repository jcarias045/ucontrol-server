const CustomerPayment=require('../models/customerpayments.model');
const CustomerPaymentDetails=require('../models/customerpaymentsdetails.model');
const customer = require("../models/customer.model");
const saleOrderInvoice = require("../models/saleorderinvoice.model");


async function addCustomerPayment(req, res){
    const payment=new CustomerPayment();
    const paymentDetails=new CustomerPaymentDetails();

    let codigo=0;
   
    let now= new Date();
    let fecha=now.getTime();
   
    let creacion=now.toISOString().substring(0, 10);
    const {Company,User,SaleOrderInvoiceId,Customer,Monto,Total,Reason,
        PaymentMethodId,NumberAccount, BankName,NoTransaction,PaymentMethodName}=req.body;

    console.log(req.body);
    let codigoPayment=await CustomerPayment.findOne()
    .populate({path: 'User', model: 'User' , match:{Company: Company}}).sort({codpayment:-1}).then(function(doc){
        if(doc){
            if(doc.codpayment!==null){
                return(doc.codpayment)
            }
        }
       
    });
    console.log("Obtenido",codigoPayment);
    if(!codigoPayment){
        codigo =1;
    }else {codigo=codigoPayment+1}
    console.log("CODIGO DEL PAGO",codigo);
    console.log("MONTO INGRESADO",Monto);
    //obteniendo total de la factura, Para comprobar respecto al saldo

    let totalaPagarInvoice=await saleOrderInvoice.findOne({_id:SaleOrderInvoiceId},'Total')
    .then(resultado =>{return resultado} );
    // verificando si factura ya tiene un pago.
    let existePago=await CustomerPayment.findOne({SaleOrderInvoice:SaleOrderInvoiceId},'Saldo')
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
    console.log(totalaPagarInvoice.Total);
    console.log('existe ya',existePago);
    console.log(deudaCliente);
    console.log("saldo actuasl",saldoActual);
    payment.SaleOrderInvoice=SaleOrderInvoiceId;
    payment.DatePayment=creacion;
    payment.User=User;
    payment.codpayment=codigo;
    payment.Saldo=parseFloat(totalFactura)-parseFloat(Monto);

    if(existePago!==null){
        console.log("PAGOOO PREVIO");
        if(parseFloat(totalaPagarInvoice.Total)<= parseFloat(Monto)){
            res.status(500).send({message:"Monto Superior a Deuda"});
        }else{
            if(parseFloat(saldoActual)< parseFloat(Monto)){
                res.status(500).send({message:"Monto Superior a saldo pendiente"});
            }else{
                CustomerPayment.updateOne({SaleOrderInvoice:SaleOrderInvoiceId},
                    {Saldo: parseFloat(saldoActual)-parseFloat(Monto)}).catch(err => {console.log(err);});
                
                //para obtener el id del pago realizado
                let getPaymentId=await CustomerPayment.findOne({SaleOrderInvoice:SaleOrderInvoiceId},'_id')
                .then(resultado => {return resultado});
                console.log("ID OBTENUIDO",getPaymentId);
                if(getPaymentId){
                    paymentDetails.CreationDate=creacion;
                    paymentDetails.Reason=Reason;
                    paymentDetails.PaymentMethods=PaymentMethodId;
                    paymentDetails.Cancelled=false;
                    paymentDetails.Amount=Monto;
                    paymentDetails.CustomerPayment=getPaymentId._id;
                    paymentDetails.SaleOrderInvoice=SaleOrderInvoiceId;
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
                                    console.log("SUMANDO PAGOS");
                                    console.log("EL ID DEL PAGO",getPaymentId);
                                    let sumMontos=await CustomerPaymentDetails.aggregate([
                                        {$match :{CustomerPayment: getPaymentId._id,Cancelled:false}},
                                       
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
                                    console.log('ttoal de facrur',totalFactura);
                                    if(parseFloat(sumaMontos)===parseFloat(totalFactura)){
                                        console.log('FACTURA CANCELADA');

                                        saleOrderInvoice.findByIdAndUpdate({_id:SaleOrderInvoiceId},{Pagada:true},(err,updateDeuda)=>{
                                            if(err){
                                             
                                                console.log(err);
                                            }else{console.log(updateDeuda);}
                                        });
                                        
                                        
                                    }
                                    //actualizando deuda con cliente
                                    customer.findByIdAndUpdate({_id:Customer},{AccountsReceivable:parseFloat(deuda)-parseFloat(Monto)},(err,updateDeuda)=>{
                                        if(err){
                                            
                                            console.log(err);
                                        }else{console.log(updateDeuda) }
                                    });
                                    
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
        if(parseFloat(totalFactura).toFixed(2) < parseFloat(Monto).toFixed(2)){
            res.status(500).send({message:"Monto Superior a Deuda"});
        }else{
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
                        paymentDetails.SaleOrderInvoice=SaleOrderInvoiceId;
                      
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
                                        });
                                        console.log("summontos",sumaMontos);
                                        //actualizando deuda con cliente
                                        customer.findByIdAndUpdate({_id:Customer},{AccountsReceivable:parseFloat(deuda)-parseFloat(Monto)},(err,updateDeuda)=>{
                                            if(err){
                                               
                                                console.log(err);
                                            }else{console.log(updateDeuda) }
                                        });
                                        if(parseFloat(sumaMontos).toFixed(2)===parseFloat(totalFactura).toFixed(2)){
                                            console.log('SUMANDO MONTOS');
                                            saleOrderInvoice.findByIdAndUpdate({_id:SaleOrderInvoiceId},{Pagada:true},(err,updateDeuda)=>{
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
        }
    }
}


function getPaymentDetails(req, res){
    const { id} = req.params;
    console.log(id);
    CustomerPaymentDetails.find({SaleOrderInvoice:id})
    .populate({path: 'CustomerPayment', model: 'CustomerPayment',match:{SaleOrderInvoice:id}})
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
    const {Customer,idpayment,saldopendiente,Total,SaleOrderInvoiceId,_id}=req.body;
    
    //obteniendo total de la factura, Para comprobar respecto al saldo

  
    
    
    let totalaPagarInvoice=await saleOrderInvoice.findOne({_id:SaleOrderInvoiceId},'Total')
    .then(resultado =>{return resultado} );
    // verificando si factura ya tiene un pago.
    let existePago=await CustomerPayment.findOne({SaleOrderInvoice:SaleOrderInvoiceId},'Saldo')
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
    let detailPayment=await CustomerPaymentDetails.findById(detailId);
    
    if(detailPayment)
    {
        if(cambios.Amount){
            //reversion del monto con el que se registro el pago
            customer.findByIdAndUpdate({_id:Customer},{AccountsReceivable: parseFloat(deuda)+parseFloat(montoRegistrado)},(err,purchaseUpdate)=>{
                if(err){
                    console.log(err);
                } 
            });
            console.log('registrado',montoRegistrado,saldopendiente);
            CustomerPayment.findByIdAndUpdate({_id:idpayment},{Saldo: parseFloat(saldopendiente)+parseFloat(montoRegistrado)},async (err,purchaseUpdate)=>{
                if(err){
                    console.log(err);
                } else{
                    let nuevoSaldo=await CustomerPayment.findOne({_id:idpayment},'Saldo')
                    .then(resultado =>{return resultado});
                    let nuevaCuentaxPagar=await customer.findOne({_id:Customer},'AccountsReceivable')
                    .then(resultado =>{return resultado}).catch(err =>{return err});
                    console.log('nuevo saldo',nuevoSaldo);
                    console.log('nuevo cuenta',nuevaCuentaxPagar.AccountsReceivable);
                    if(parseFloat(nuevoSaldo.Saldo)>= parseFloat(cambios.Amount) )
                    {
                        console.log("PERMITEE PAGOOO");
                        customer.findByIdAndUpdate({_id:Customer},{AccountsReceivable: parseFloat(deuda)-parseFloat(cambios.Amount)},(err,purchaseUpdate)=>{
                            if(err){
                                console.log(err);
                            } 
                        });
            
                        CustomerPayment.findByIdAndUpdate({_id:idpayment},{Saldo: parseFloat(nuevoSaldo.Saldo)-parseFloat(cambios.Amount)},(err,purchaseUpdate)=>{
                            if(err){
                                console.log(err);
                            } 
                        });
        
                        
                        let updateDetails={
                            Amount:cambios.Amount,
                            BankName: cambios.BankName?cambios.BankName:null,
                            NumberAccount:cambios.Number?cambios.Number:null,
        
                        }
        
                        CustomerPaymentDetails.findByIdAndUpdate(detailId,updateDetails,async (err,detailUpdated)=>{
                            if(err){
                                console.log(err);
                            } else{
                                console.log(detailUpdated);
                                console.log(idpayment);
                                console.log("SUMANDO PAGOS");
                                console.log("EL ID DEL PAGO",_id);
                                let sumMontos=await CustomerPaymentDetails.aggregate([
                                    {$match :{CustomerPayment: detailUpdated.CustomerPayment, Cancelled:false}},
                                
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
                                    saleOrderInvoice.findByIdAndUpdate({_id:_id},{Pagada:true},(err,updateDeuda)=>{
                                        if(err){
                                            console.log(err);
                                        }
                                    });
                                }else{
                                    saleOrderInvoice.findByIdAndUpdate({_id:_id},{Pagada:false},(err,updateDeuda)=>{
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
    // let Customer=req.body.ID_Supplier;
    let idpay=req.body.idpayment;
    let saldop=req.body.saldopendiente;
    let montoRegistrado=req.body.montoReg;
    let invoiceId= req.body.ID_PurchaseInvoice;
    let cambios=req.body.change;
    const {Customer,idpayment,saldopendiente,Total,_id}=req.body;
    console.log('purchase invoice',_id);
    //obteniendo total de la factura, Para comprobar respecto al saldo

    let totalaPagarInvoice=await saleOrderInvoice.findOne({_id:_id},'Total')
    .then(resultado =>{return resultado} );
    // verificando si factura ya tiene un pago.
    let existePago=await CustomerPayment.findOne({SaleOrderInvoice:_id},'Saldo')
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
    let detailPayment=await CustomerPaymentDetails.findById(detailId);
    
    if(detailPayment)
    {       
           let newTotal=parseFloat(deuda)+parseFloat(montoRegistrado);
           if(parseFloat(totalaPagarInvoice) < parseFloat(newTotal)){
            res.status(500).send({message: "No se inserto registro"});
           }else{
               //reversion del monto con el que se registro el pago
            customer.findByIdAndUpdate({_id:Customer},{AccountsReceivable: parseFloat(deuda)+parseFloat(montoRegistrado)},(err,purchaseUpdate)=>{
                if(err){
                    console.log(err);
                } 
            });

            CustomerPayment.findByIdAndUpdate({_id:idpayment},{Saldo: parseFloat(saldopendiente)+parseFloat(montoRegistrado)},(err,purchaseUpdate)=>{
                if(err){
                    console.log(err);
                } else{console.log('cambios',purchaseUpdate);}
            });
            
            let updateDetails={
                Cancelled:true,
                

            }

            CustomerPaymentDetails.findByIdAndUpdate(detailId,updateDetails,async (err,detailUpdated)=>{
                if(err){
                    console.log(err);
                } else{
                    console.log(detailUpdated);
                    console.log(idpayment);
                    console.log("SUMANDO PAGOS");
                    console.log("EL ID DEL PAGO",_id);
                    let sumMontos=await CustomerPaymentDetails.aggregate([
                        {$match :{CustomerPayment: detailUpdated.CustomerPayment, Cancelled:false}},
                    
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
                        saleOrderInvoice.findByIdAndUpdate({_id:_id},{Pagada:true},(err,updateDeuda)=>{
                            if(err){
                                console.log(err);
                            }
                        });
                    }else{
                        saleOrderInvoice.findByIdAndUpdate({_id:_id},{Pagada:false},(err,updateDeuda)=>{
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
}


async function getAllPayments(req, res){
    
    CustomerPayment.find().populate({path: 'User', model: 'User',match:{_id:req.params.id}})
    .populate({path: 'SaleOrderInvoice', model: 'SaleOrderInvoice'}).sort({codpayment:-1})
    .then(pagos => {
        if(!pagos){
            res.status(404).send({message:"No hay "});
        }else{
            console.log(pagos);
            res.status(200).send({pagos})
        }
    });
}
module.exports={
    addCustomerPayment,
    getPaymentDetails,
    updatePaymentInvoice,
    cancelledPaymentInvoice,
    getAllPayments
}