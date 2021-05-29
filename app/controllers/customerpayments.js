const CustomerPayment=require('../models/customerpayments.model');
const CustomerPaymentDetails=require('../models/customerpaymentsdetails.model');
const customer = require("../models/customer.model");
const saleOrderInvoice = require("../models/saleorderinvoice.model");

//registro de movimientos bancarios
const bankingTransaction= require('../models/bankingtransaction.model');
const bankAccount= require('../models/bankaccount.model');
const bankMovement= require('../models/bankmovement.model');
const movementType= require('../models/concepts.model'); 
//movimiento caja
const cashTransaction= require('../models/CashTransaction.model');
const cashAccount= require('../models/cashaccounts.model');
const cashMovement= require('../models/cashmovement.model');


async function addCustomerPayment(req, res){
    const payment=new CustomerPayment();
    const paymentDetails=new CustomerPaymentDetails();

    let codigo=0;
   
    let now= new Date();
    let fecha=now.getTime();
   
    let creacion=now.toISOString().substring(0, 10);
    const {Company,User,SaleOrderInvoiceId,Customer,Monto,Total,Reason,NumberAccountBank,
        PaymentMethodId,NumberAccount, BankName,NoTransaction,PaymentMethodName,CashAccount,NumberAccountId}=req.body;
    
       
     ///////********OBTENIENDO CODIGOS DE MOVIMIENTOS Y TIPOS ******** */
     let idMovimiento;
     let idTipoMovimiento;     
     let efectivoMovimiento;
     let tarjetaCreditoMov;
     let tarjetaTipo;
     if(PaymentMethodName==="Transferencia"){
        idMovimiento=await bankMovement.findOne({Name:'Transferencias', Company:Company},['_id'])
        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

        idTipoMovimiento=await movementType.findOne({Name:'Transferencia Externa', Company:Company},['_id'])
        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

     }
     if(PaymentMethodName==="Contado"){
        efectivoMovimiento=await cashMovement.findOne({Name:'Ingreso', Company:Company},['_id'])
        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
     }

     if(PaymentMethodName==="TarjetaCredito"){
        efectivoMovimiento=await bankMovement.findOne({Name:'Operaciones con Tarjeta', Company:Company},['_id'])
        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

        tarjetaTipo=await movementType.findOne({Name:'Tarjeta de Credito', Company:Company},['_id'])
        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
       
     }

    ///////********OBTENIENDO CODIGOS DE MOVIMIENTOS Y TIPOS fin ******** */
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
    console.log("Monto",Monto);
    payment.SaleOrderInvoice=SaleOrderInvoiceId;
    payment.DatePayment=creacion;
    payment.User=User;
    payment.codpayment=codigo;
    payment.Customer=Customer;
    payment.Saldo=parseFloat(totalFactura).toFixed(2)-parseFloat(Monto).toFixed(2);
    if(existePago!==null){
        console.log("PAGOOO PREVIO");
        if(parseFloat(totalaPagarInvoice.Total).toFixed(2)<= parseFloat(Monto).toFixed(2)){
            res.status(500).send({message:"Monto Superior a Deuda"});
        }else{
            if(parseFloat(saldoActual).toFixed(2)< parseFloat(Monto).toFixed(2)){
                res.status(500).send({message:"Monto Superior a saldo pendiente"});
            }else{

                CustomerPayment.updateOne({SaleOrderInvoice : SaleOrderInvoiceId},
                    {Saldo: parseFloat(saldoActual).toFixed(2)-parseFloat(Monto).toFixed(2)}).catch(err => {console.log(err);});
                
                //para obtener el id del pago realizado
                let getPaymentId=await CustomerPayment.findOne({SaleOrderInvoice:SaleOrderInvoiceId},'_id')
                .then(resultado => {return resultado});
                console.log("ID OBTENUIDO",getPaymentId);
                if(getPaymentId){
                    paymentDetails.CreationDate=creacion;
                    paymentDetails.Reason=Reason;
                    paymentDetails.Company=Company;
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
                                    if(parseFloat(sumaMontos).toFixed(2)===parseFloat(totalFactura).toFixed(2)){
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
                                    

                                    //Reegistro de movimiento de banco
                                     let Type;
                                     let BankMovement;
                                     
                                     if(PaymentMethodName==="Contado"){
                                        const CashTransaction = new cashTransaction();
    
                                        CashTransaction.TransactionDate= creacion;
                                        CashTransaction.Concept= Reason;  
                                        CashTransaction.User= User; 
                                        CashTransaction.Deposit=Monto;
                                        CashTransaction.Withdrawal= 0;
                                        CashTransaction.CashMovement= efectivoMovimiento;
                                        CashTransaction.CashAccount= CashAccount;

                                        CashTransaction.save(async (err, CashTransactionStored)=>{
                                            if(err){
                                                res.status(500).send({message: err});
                                            }else{
                                                if(!CashTransactionStored){
                                                    res.status(500).send({message: "Error"});
                                                }else{
                                                    let saldoCurrentAccount=await cashAccount.findOne({_id:CashAccount},'Saldo').then(result=>{return result.Saldo});
                                                    cashAccount.findByIdAndUpdate({_id:CashAccount},
                                                        {Saldo: parseFloat(parseFloat(saldoCurrentAccount) + parseFloat(Monto)).toFixed(2)},
                                                        (err,updateDeuda)=>{
                                                        if(err){
                                                            console.log(err);
                                                        }
                                                    });
                                                }
                                            }
                                        })
                                     }
                                
                                  
                                     if(PaymentMethodName==="Transferencia" || PaymentMethodName==="TarjetaCredito" ){
                                         console.log("ENTRO A MOVMIENTOS");
                                        if(PaymentMethodName==="Transferencia"){
                                            BankMovement=idMovimiento;
                                            Type=idTipoMovimiento
    
                                    
                                         }
                                         if(PaymentMethodName==="TarjetaCredito"){
                                            BankMovement=tarjetaCreditoMov;
                                            Type=tarjetaTipo;
                                        }

                                        let BankingTransaction=new bankingTransaction();
                                        BankingTransaction.Type= Type
                                        BankingTransaction.TransactionDate= creacion;
                                        BankingTransaction.Concept= Reason;
                                        // BankingTransaction.OperationNumber=OperationNumber;
                                        BankingTransaction.User= User;
                                        BankingTransaction.DocumentNumber= NoTransaction;
                                        BankingTransaction.Deposit= Monto;
                                        BankingTransaction.Withdrawal= 0;
                                        BankingTransaction.BankMovement= BankMovement;
                                        BankingTransaction.Account= NumberAccountId;

                                        BankingTransaction.save(async (err, BankingTransactionStored)=>{
                                            if(err){
                                                // res.status(500).send({message: err});
                                            }else{
                                                if(!BankingTransactionStored){
                                                    // res.status(500).send({message: "Error"});
                                                }else{
                                                    let saldoCurrentAccount=await bankAccount.findOne({_id:NumberAccountId},'Saldo').then(result=>{return result.Saldo});
                                                    console.log("SALDO DE LA CUENTA ACTUAL", saldoCurrentAccount);

                                                    bankAccount.findByIdAndUpdate({_id:NumberAccountId},
                                                        {Saldo: parseFloat(parseFloat(saldoCurrentAccount) + parseFloat(Monto)).toFixed(2)},
                                                        (err,updateDeuda)=>{
                                                        if(err){
                                                            console.log(err);
                                                        }
                                                    })

                                                }
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
    console.log("Saldo de factura",totalFactura);

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
                        paymentDetails.Company=Company;
                        paymentDetails.Reason=Reason;
                        paymentDetails.PaymentMethods=PaymentMethodId;
                        paymentDetails.Cancelled=false;
                        paymentDetails.Amount=Monto;
                        paymentDetails.CustomerPayment=paymentid;
                        paymentDetails.SaleOrderInvoice=SaleOrderInvoiceId;
                      
                        console.log(paymentDetails);
                        if(PaymentMethodName!=='Contado'){
                            paymentDetails.NumberAccount=PaymentMethodName==="Transferencia"?NumberAccountBank:NumberAccount;
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
                                        console.log("monto sumados", sumaMontos);
                                        console.log("total factura", totalFactura);
                                        if(parseFloat(sumaMontos).toFixed(2)===parseFloat(totalFactura).toFixed(2)){
                                            console.log('SUMANDO MONTOS');
                                            saleOrderInvoice.findByIdAndUpdate({_id:SaleOrderInvoiceId},{Pagada:true},(err,updateDeuda)=>{
                                                if(err){
                                                 
                                                    console.log(err);
                                                }else{console.log("edito",updateDeuda);}
                                            });
                                            
                                            
                                        }
                                       

                                    }
                                   
                                }
                                          //Reegistro de movimiento de banco
                                          let Type;
                                          let BankMovement;
                                          
                                          if(PaymentMethodName==="Contado"){
                                             const CashTransaction = new cashTransaction();
         
                                             CashTransaction.TransactionDate= creacion;
                                             CashTransaction.Concept= Reason;  
                                             CashTransaction.User= User; 
                                             CashTransaction.Deposit=Monto;
                                             CashTransaction.Withdrawal= 0;
                                             CashTransaction.CashMovement= efectivoMovimiento;
                                             CashTransaction.CashAccount= CashAccount;
     
                                             CashTransaction.save(async (err, CashTransactionStored)=>{
                                                 if(err){
                                                     res.status(500).send({message: err});
                                                 }else{
                                                     if(!CashTransactionStored){
                                                         res.status(500).send({message: "Error"});
                                                     }else{
                                                         let saldoCurrentAccount=await cashAccount.findOne({_id:CashAccount},'Saldo').then(result=>{return result.Saldo});
                                                         cashAccount.findByIdAndUpdate({_id:CashAccount},
                                                             {Saldo: parseFloat(parseFloat(saldoCurrentAccount) + parseFloat(Monto)).toFixed(2)},
                                                             (err,updateDeuda)=>{
                                                             if(err){
                                                                 console.log(err);
                                                             }
                                                         });
                                                     }
                                                 }
                                             })
                                          }
                                     
                                       
                                          if(PaymentMethodName==="Transferencia" || PaymentMethodName==="TarjetaCredito" ){
                                              console.log("ENTRO A REGISTRO DE MOVIMIENTO");
                                             if(PaymentMethodName==="Transferencia"){
                                                 BankMovement=idMovimiento;
                                                 Type=idTipoMovimiento
         
                                         
                                              }
                                              if(PaymentMethodName==="TarjetaCredito"){
                                                 BankMovement=tarjetaCreditoMov;
                                                 Type=tarjetaTipo;
                                             }
     
                                             let BankingTransaction=new bankingTransaction();
                                             BankingTransaction.Type= Type
                                             BankingTransaction.TransactionDate= creacion;
                                             BankingTransaction.Concept= Reason;
                                             // BankingTransaction.OperationNumber=OperationNumber;
                                             BankingTransaction.User= User;
                                             BankingTransaction.DocumentNumber= NoTransaction;
                                             BankingTransaction.Deposit= Monto;
                                             BankingTransaction.Withdrawal= 0;
                                             BankingTransaction.BankMovement= BankMovement;
                                             BankingTransaction.Account= NumberAccountId;
     
                                             BankingTransaction.save(async (err, BankingTransactionStored)=>{
                                                 if(err){
                                                     // res.status(500).send({message: err});
                                                 }else{
                                                     if(!BankingTransactionStored){
                                                         // res.status(500).send({message: "Error"});
                                                     }else{
                                                         let saldoCurrentAccount=await bankAccount.findOne({_id:NumberAccountId},'Saldo').then(result=>{return result.Saldo});
                                                         console.log("SALDO DE LA CUENTA ACTUAL", saldoCurrentAccount);
     
                                                         bankAccount.findByIdAndUpdate({_id:NumberAccountId},
                                                             {Saldo: parseFloat(parseFloat(saldoCurrentAccount) + parseFloat(Monto)).toFixed(2)},
                                                             (err,updateDeuda)=>{
                                                             if(err){
                                                                 console.log(err);
                                                             }
                                                         })
     
                                                     }
                                                 }
                                             });
     
     
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

function getExportExcelInfo(req, res){
    let Company = req.params.id
    CustomerPaymentDetails.find({Company: Company})
    .populate({path: 'CustomerPayment', model: 'CustomerPayment'})
    .populate({path: 'PaymentMethods', model: 'PaymentMethods'})
    .populate({path:'SaleOrderInvoice', model: 'SaleOrderInvoice'})
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
            let actSaldo= parseFloat(saldopendiente) + parseFloat(montoRegistrado);
            CustomerPayment.findByIdAndUpdate({_id:idpayment},{Saldo:actSaldo.toFixed(2) },async (err,purchaseUpdate)=>{
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
    const {id}=req.params;
    CustomerPayment.find({User:id}).populate({path: 'User', model: 'User'})
    .populate({path: 'SaleOrderInvoice', model: 'SaleOrderInvoice', populate: {path: 'SaleOrder', model: 'SaleOrder'}})
    .sort({codpayment:-1})
    .populate({path: 'Customer', model: 'Customer'})
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
    getAllPayments,
    getExportExcelInfo
}