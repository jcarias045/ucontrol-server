const moment = require("moment");
const PaymentToSupplier=require('../models/paymentstoSuppliers.model');
const PaymnetToSupplierDetails=require('../models/paymenttoSupplierDetail.model');
const PurchaseInvoice=require('../models/purchaseInvoice.model');
const Company = require('../models/company.model');
const Supplier = require('../models/supplier.model');
const { ObjectId } = require('bson');

async function addPaymentToInvoice(req, res){
    const payment=new PaymentToSupplier();
    const paymentDetails=new PaymnetToSupplierDetails();

    let codigo=0;
    let now= new Date();
    let creacion = moment().format('DD/MM/YYYY');
    const {Company,User,PurchaseInvoiceId,Supplierid,Monto,Total,Reason,
        PaymentMethodId,NumberAccount, BankName,NoTransaction,PaymentMethodName}=req.body;

    console.log(req.body);
    let codigoPayment=await PaymentToSupplier.findOne().sort({codpayment:-1})
    .populate({path: 'User', model: 'User' , match:{Company: Company}}).then(function(doc){
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
    //obteniendo total de la factura, Para comprobar respecto al saldo

    let totalaPagarInvoice=await PurchaseInvoice.findOne({_id:PurchaseInvoiceId},'Total')
    .then(resultado =>{return resultado} );
    // verificando si factura ya tiene un pago.
    let existePago=await PaymentToSupplier.findOne({PurchaseInvoice:PurchaseInvoiceId},'Saldo')
    .then(resultado =>{return resultado});
    //obteniendo cuenta/deuda 
    let deudaProveedor=await Supplier.findOne({_id:Supplierid},'DebsToPay')
    .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
    
    let totalFactura=  Total;
    
    let deuda=deudaProveedor.DebsToPay;
    console.log(totalaPagarInvoice.Total);
    console.log('existe ya',existePago);
    console.log(deudaProveedor.DebsToPay);

    payment.PurchaseInvoice=PurchaseInvoiceId;
    payment.DatePayment=creacion;
    payment.User=User;
    payment.codpayment=codigo;
    payment.Saldo=parseFloat(totalaPagarInvoice.Total)-parseFloat(Monto)

    if(existePago!==null){
        let saldoActual=existePago.Saldo;
        console.log('enncontro pago');
        console.log(totalaPagarInvoice.Total);
        console.log(saldoActual);
        if(parseFloat(totalaPagarInvoice.Total)>=parseFloat(saldoActual)){
            console.log("aPLICA PAGO");
            let paymentId=null;
            
            payment.Saldo=parseFloat(totalaPagarInvoice.Total)-parseFloat(Monto);
            if(parseFloat(saldoActual)<parseFloat(Monto)){
                res.status(500).send({message:"Monto Superior a Deuda"});
            }
            else{
                PaymentToSupplier.updateOne({PurchaseInvoice:PurchaseInvoiceId},
                    {Saldo: parseFloat(saldoActual)-parseFloat(Monto)}).catch(err => {console.log(err);});
                
                //para obtener el id del pago realizado
                let getPaymentId=await PaymentToSupplier.findOne({PurchaseInvoice:PurchaseInvoiceId},'_id')
                .then(resultado => {return resultado});

                console.log("ID OBTENIDI",getPaymentId);
                if(getPaymentId){
                    paymentDetails.CreationDate=creacion;
                    paymentDetails.Reason=Reason;
                    paymentDetails.PaymentMethods=PaymentMethodId;
                    paymentDetails.Cancelled=false;
                    paymentDetails.Amount=Monto;
                    paymentDetails.PaymentSupplier=getPaymentId;
                    paymentDetails.PurchaseInvoice=PurchaseInvoiceId;
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
                                    let sumMontos=await PaymnetToSupplierDetails.aggregate([
                                        {$match :{PaymentSupplier: getPaymentId._id,Cancelled:false}},
                                       
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
                                    console.log('suma',sumMontos);
                                    if(parseFloat(sumaMontos)===parseFloat(totalaPagarInvoice.Total)){
                                        console.log('SUMANDO MONTOS');
                                        PurchaseInvoice.findByIdAndUpdate({_id:PurchaseInvoiceId},{Pagada:true},(err,updateDeuda)=>{
                                            if(err){
                                                console.log(err);
                                            }
                                        });
                                    }
                                    //actualizando deuda con proveedor
                                    let actMonto=parseFloat(deuda)-parseFloat(Monto);
                                    Supplier.findByIdAndUpdate({_id:Supplierid},{DebsToPay:actMonto},(err,updateDeuda)=>{
                                    if(err){
                                        
                                        console.log(err);
                                    }
                                    else{
                                        console.log(updateDeuda);
                                    }
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
        console.log('pago ya registrADO');
        payment.save((err, paymentStored)=>{
            if(err){
                console.log(err);
    
            }else {
                if(!paymentStored){
                    console.log('no se ingreso entrada');
    
                }
                else{
                    let paymentid=paymentStored._id;
                    console.log('METODO',PaymentMethodId);
                    paymentDetails.CreationDate=creacion;
                    paymentDetails.Reason=Reason;
                    paymentDetails.PaymentMethods=PaymentMethodId;
                    paymentDetails.Cancelled=false;
                    paymentDetails.Amount=Monto;
                    paymentDetails.PaymentSupplier=paymentid;
                    paymentDetails.PurchaseInvoice=PurchaseInvoiceId;
                  
                    console.log(paymentDetails);
                    if(PaymentMethodName!=='Contado'){
                        paymentDetails.NumberAccount=NumberAccount;
                        paymentDetails.BankName= BankName;
                        paymentDetails.NoTransaction= NoTransaction;
                    }
                    if(PaymentMethodName==='Cheque'){
                        paymentDetails.NumberAccount=NumberAccount;
                        paymentDetails.BankName= BankName;
                        paymentDetails.NoTransaction= null;
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
                                    let sumMontos=await PaymnetToSupplierDetails.aggregate([
                                        {$match :{PaymentSupplier: paymentid}},
                                       
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
                                    //actualizando deuda con proveedor
                                    Supplier.findByIdAndUpdate({_id:Supplierid},{DebsToPay:parseFloat(deuda)-parseFloat(Monto)},(err,updateDeuda)=>{
                                        if(err){
                                           
                                            console.log(err);
                                        }
                                    });
                                    if(parseFloat(sumMontos)===parseFloat(totalaPagarInvoice.Total)){
                                        console.log('SUMANDO MONTOS');
                                        PurchaseInvoice.findByIdAndUpdate({_id:PurchaseInvoiceId},{Pagada:true},(err,updateDeuda)=>{
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

function getPaymentDetails(req, res){
    const { id} = req.params;
   
    PaymnetToSupplierDetails.find({PurchaseInvoice:id})
    .populate({path: 'PaymentSupplier', model: 'PaymentSupplier',match:{PurchaseInvoice:id}})
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
    let supplierId=req.body.ID_Supplier;
    let idpay=req.body.idpayment;
    let saldop=req.body.saldopendiente;
    let montoRegistrado=req.body.montoReg;
    let invoiceId= req.body.ID_PurchaseInvoice;
    let cambios=req.body.change;
    const {SupplierId,idpayment,saldopendiente,Total,PurchaseInvoiceId,_id}=req.body;
    
    //obteniendo total de la factura, Para comprobar respecto al saldo

    let totalaPagarInvoice=await PurchaseInvoice.findOne({_id:PurchaseInvoiceId},'Total')
    .then(resultado =>{return resultado} );
    // verificando si factura ya tiene un pago.
    let existePago=await PaymentToSupplier.findOne({PurchaseInvoice:PurchaseInvoiceId},'Saldo')
    .then(resultado =>{return resultado});
    //obteniendo cuenta/deuda 
    let deudaProveedor=await Supplier.findOne({_id:SupplierId},'DebsToPay')
    .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

    let deuda=deudaProveedor.DebsToPay;
    let detailPayment=await PaymnetToSupplierDetails.findById(detailId);
    
    if(detailPayment)
    {
        if(cambios.Amount){
            //reversion del monto con el que se registro el pago
            Supplier.findByIdAndUpdate({_id:SupplierId},{DebsToPay: parseFloat(deuda)+parseFloat(montoRegistrado)},(err,purchaseUpdate)=>{
                if(err){
                    console.log(err);
                } 
            });
            console.log('registrado',montoRegistrado,saldopendiente);
            PaymentToSupplier.findByIdAndUpdate({_id:idpayment},{Saldo: parseFloat(saldopendiente)+parseFloat(montoRegistrado)},async (err,purchaseUpdate)=>{
                if(err){
                    console.log(err);
                } else{
                    let nuevoSaldo=await PaymentToSupplier.findOne({_id:idpayment},'Saldo')
                    .then(resultado =>{return resultado});
                    let nuevaCuentaxPagar=await Supplier.findOne({_id:SupplierId},'DebsToPay')
                    .then(resultado =>{return resultado}).catch(err =>{return err});
                    console.log('nuevo saldo',nuevoSaldo);
                    console.log('nuevo cuenta',nuevaCuentaxPagar.DebsToPay);
                    if(parseFloat(nuevoSaldo.Saldo)>= parseFloat(cambios.Amount) )
                    {
                        console.log("PERMITEE PAGOOO");
                        Supplier.findByIdAndUpdate({_id:SupplierId},{DebsToPay: parseFloat(deuda)-parseFloat(cambios.Amount)},(err,purchaseUpdate)=>{
                            if(err){
                                console.log(err);
                            } 
                        });
            
                        PaymentToSupplier.findByIdAndUpdate({_id:idpayment},{Saldo: parseFloat(nuevoSaldo.Saldo)-parseFloat(cambios.Amount)},(err,purchaseUpdate)=>{
                            if(err){
                                console.log(err);
                            } 
                        });
        
                        
                        let updateDetails={
                            Amount:cambios.Amount,
                            BankName: cambios.BankName?cambios.BankName:null,
                            NumberAccount:cambios.Number?cambios.Number:null,
        
                        }
        
                        PaymnetToSupplierDetails.findByIdAndUpdate(detailId,updateDetails,async (err,purchaseUpdate)=>{
                            if(err){
                                console.log(err);
                            } else{
                                console.log(purchaseUpdate);
                                console.log(idpayment);
                                console.log("SUMANDO PAGOS");
                                console.log("EL ID DEL PAGO",_id);
                                let sumMontos=await PaymnetToSupplierDetails.aggregate([
                                    {$match :{PaymentSupplier: purchaseUpdate.PaymentSupplier, Cancelled:false}},
                                
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
                                    PurchaseInvoice.findByIdAndUpdate({_id:_id},{Pagada:true},(err,updateDeuda)=>{
                                        if(err){
                                            console.log(err);
                                        }
                                    });
                                }else{
                                    PurchaseInvoice.findByIdAndUpdate({_id:_id},{Pagada:false},(err,updateDeuda)=>{
                                        if(err){
                                            console.log(err);
                                        }
                                    });
                                }
                                res.status(200).json(purchaseUpdate);
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
    let supplierId=req.body.ID_Supplier;
    let idpay=req.body.idpayment;
    let saldop=req.body.saldopendiente;
    let montoRegistrado=req.body.montoReg;
    let invoiceId= req.body.ID_PurchaseInvoice;
    let cambios=req.body.change;
    const {SupplierId,idpayment,saldopendiente,Total,PurchaseInvoiceId,_id}=req.body;
    console.log('purchase invoice',_id);
    //obteniendo total de la factura, Para comprobar respecto al saldo

    let totalaPagarInvoice=await PurchaseInvoice.findOne({_id:PurchaseInvoiceId},'Total')
    .then(resultado =>{return resultado} );
    // verificando si factura ya tiene un pago.
    let existePago=await PaymentToSupplier.findOne({PurchaseInvoice:PurchaseInvoiceId},'Saldo')
    .then(resultado =>{return resultado});
    //obteniendo cuenta/deuda 
    let deudaProveedor=await Supplier.findOne({_id:SupplierId},'DebsToPay')
    .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

    let deuda=deudaProveedor.DebsToPay;
    let detailPayment=await PaymnetToSupplierDetails.findById(detailId);
    
    if(detailPayment)
    {
        
            //reversion del monto con el que se registro el pago
            Supplier.findByIdAndUpdate({_id:SupplierId},{DebsToPay: parseFloat(deuda)+parseFloat(montoRegistrado)},(err,purchaseUpdate)=>{
                if(err){
                    console.log(err);
                } 
            });

            PaymentToSupplier.findByIdAndUpdate({_id:idpayment},{Saldo: parseFloat(saldopendiente)+parseFloat(montoRegistrado)},(err,purchaseUpdate)=>{
                if(err){
                    console.log(err);
                } else{console.log('cambios',purchaseUpdate);}
            });
            
            let updateDetails={
                Cancelled:true,
                

            }

            PaymnetToSupplierDetails.findByIdAndUpdate(detailId,updateDetails,async (err,purchaseUpdate)=>{
                if(err){
                    console.log(err);
                } else{
                    console.log(purchaseUpdate);
                    console.log(idpayment);
                    console.log("SUMANDO PAGOS");
                    console.log("EL ID DEL PAGO",_id);
                    let sumMontos=await PaymnetToSupplierDetails.aggregate([
                        {$match :{PaymentSupplier: purchaseUpdate.PaymentSupplier, Cancelled:false}},
                    
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
                        PurchaseInvoice.findByIdAndUpdate({_id:_id},{Pagada:true},(err,updateDeuda)=>{
                            if(err){
                                console.log(err);
                            }
                        });
                    }else{
                        PurchaseInvoice.findByIdAndUpdate({_id:_id},{Pagada:false},(err,updateDeuda)=>{
                            if(err){
                                console.log(err);
                            }
                        });
                    }
                    res.status(200).json(purchaseUpdate);
                }
            });
        
    }
}

async function getAllPayments(req, res){
    
    PaymentToSupplier.find().populate({path: 'User', model: 'User',match:{_id:req.params.id}})
    .populate({path: 'PurchaseInvoice', model: 'PurchaseInvoice'})
    .then(pagos => {
        if(!pagos){
            res.status(404).send({message:"No hay "});
        }else{
            console.log(pagos);
            res.status(200).send({pagos})
        }
    });
}

function exportPaymentSupplier(req, res){
    PaymnetToSupplierDetails.find()
    .populate({path: 'PaymentSupplier', model: 'PaymentSupplier'})
    .populate({path: 'PaymentMethods', model: 'PaymentMethods'})
    .populate({path:'PurchaseInvoice', model: 'PurchaseInvoice'})
    .then(detailsExport => {
        if(!detailsExport){
            res.status(404).send({message:"No hay "});
        }else{
            
            res.status(200).send({detailsExport})
        }
    });
}

module.exports={
    addPaymentToInvoice,
    getPaymentDetails,
    cancelledPaymentInvoice,
    updatePaymentInvoice,
    getAllPayments,
    exportPaymentSupplier
}

// const db = require('../config/db.config.js');;
// const { Op } = require("sequelize");
// const sequelize = require('sequelize');

// const PaymentToSupplier = db.PaymentToSupplier;
// const PaymentToSupplierDetails= db.PaymentToSupplierDetails;
// const PurchaseInvoice= db.PurchaseInvoice;
// const Company = db.Company;
// const User = db.User;
// const Supplier = db.Supplier;


// async function addPaymentToInvoice(req, res){
//     let paymentinfo = {};
//     let companyId = req.body.ID_Company;
//     let userId= req.body.ID_User;
//     let supplierId=req.body.ID_Supplier;
//     let invoiceId= req.body.ID_PurchaseInvoice;
//     let totalFactura= req.body.Total;
//     let now= new Date();
//     let creacion=now.getTime();
//     let saldoActual=0;
//     let codigo=0;
//     let deuda=0;
//     let pagoExiste=false;
//     console.log(req.body);
//     let codigoPayment=await PaymentToSupplier.max('codpayment',{ 
//         include: [
//             {
//                  model: User,
//                  attributes: ['ID_User'],
//                  on:{
                   
//                     ID_User: sequelize.where(sequelize.col("ec_payments.ID_User"), "=", sequelize.col("sys_users.ID_User")),
                    
//                  },
//                 include: [
//                     {
//                         model:Company,
//                         attributes: ['ID_Company'],
//                         where:ID_Company=companyId
//                     }
//                 ]
                 
//              }
//             ],
           
//             where: {ID_User:userId}, 
        
//     }).then(function(orden) {
        
//        return orden;
//     });
//     //calculando codigo
//     if(!codigoPayment){
//         codigo =1;
//     }else {codigo=codigoPayment+1}
    
//     let totalaPagarInvoice=await PurchaseInvoice.findByPk(invoiceId,{attributes: ['Total']});
//     let existPago=await PaymentToSupplier.findAll({ 
//         where:{	ID_PurchaseInvoice:invoiceId},
//         attributes: ['Saldo']
//     });
//     let deudaProveedor=await Supplier.findAll({ 
//         where:{	ID_Supplier:supplierId},
//         attributes: ['DebsToPay']
//     });
//     console.log(deudaProveedor);
//     for(let i=0; i<deudaProveedor.length;i++){
//        deuda=deudaProveedor[i].dataValues.DebsToPay;
//     }
//     if(existPago.length > 0){
//         pagoExiste=true;
//          for(let i=0; i<existPago.length;i++){
//         saldoActual=existPago[i].dataValues.Saldo;
//      }
//     }

//     console.log(deuda);
//     console.log(pagoExiste);
//     console.log(saldoActual);
//     console.log(totalFactura)
//     try{
//         let monto=req.body.Monto;
//         paymentinfo.ID_PurchaseInvoice=invoiceId;
       
//         paymentinfo.DatePayment=creacion;
        
//         paymentinfo.codpayment=codigo;
//         paymentinfo.ID_User=userId;
     
//       if(pagoExiste){
//           console.log("ya existe registro de pago de factura");
//           console.log(deuda);
//           console.log(totalFactura)
//           console.log(saldoActual);
//          if(parseFloat(totalFactura)>parseFloat(saldoActual)){
//             console.log("entrando");
//              let paymentid=null;
//              let paymentDetails={};
//             paymentinfo.Saldo=parseFloat(totalFactura)-parseFloat(monto);
//             if( parseFloat(saldoActual)<parseFloat(monto)){
//                 res.status(500).send({message:"Monto Superior a Deuda"});
//             }
//             else{
//                 let updatePago={
//                     Saldo: parseFloat(saldoActual)-parseFloat(monto)
//                 };
                
//                 let pagoUpdate = await PaymentToSupplier.update(updatePago,
//                     {             
//                       where: {ID_PurchaseInvoice:invoiceId},
//                       attributes: ['Saldo','ID_Payments']
//                     }
//                   );
//                 let getPayment=await PaymentToSupplier.findAll({where:{ID_PurchaseInvoice:invoiceId},attributes:['ID_Payments'] })
//                 if(getPayment.length> 0){
//                     for(let i=0; i<getPayment.length; i++){
//                         paymentid=getPayment[i].dataValues.ID_Payments
//                     }
//                 }
                 
//                 if(paymentid){
//                     paymentDetails.CreationDate=creacion;
//                     paymentDetails.Reason=req.body.Reason;
//                     paymentDetails.ID_PaymentMethods=req.body.ID_PaymentMethod;
//                     paymentDetails.Cancelled=0;
//                     if(req.body.ID_PaymentMethod!==1){
//                         paymentDetails.Number=req.body.Number;
//                         paymentDetails.BankName=req.body.BankName;    
//                         paymentDetails.Amount=monto;
//                         paymentDetails.ID_Payments=paymentid;
//                         paymentDetails.NoTransaction=req.body.NoTransaction;
//                     }
//                     else{     
//                         paymentDetails.Amount=monto;
//                         paymentDetails.ID_Payments=paymentid;
//                     }

//                     PaymentToSupplierDetails.create(paymentDetails)  //Creacion de factura #1
//                     .then(async result => {
//                         let paymentDetailId=result.ID_PaymentDetails;
//                         if(paymentDetailId){
//                             let sumMontos=await PaymentToSupplierDetails.sum('Amount', { where: { ID_Payments: paymentid, Cancelled:false} });
                            
//                             console.log(sumMontos);
//                             console.log(parseFloat(totalaPagarInvoice.Total));
//                             if(parseFloat(sumMontos)===parseFloat(totalaPagarInvoice.Total)){
//                                 console.log("SUMAAAANDOOOO");
//                                 console.log(sumMontos);
//                                 console.log(totalaPagarInvoice);
//                                 let pagada={
//                                     Pagada: 1
//                                 };
//                                 let pagoUpdate = await PurchaseInvoice.update(pagada,
//                                     {             
//                                       where: {ID_PurchaseInvoice:invoiceId},
//                                       attributes: ['Pagada',]
//                                     }
//                                   );
                                
//                             }
//                         }
//                         res.status(200).json(result);
//                     })
//                     .catch(err =>
//                     {
//                         console.log(err);
//                         res.status(500).send({message:"Error al Registra Detalle de Pago"});
//                     });

                   
//                 }

//                 let updateDeuda={
//                     DebsToPay: parseFloat(deuda)-parseFloat(monto)
//                 };
                
//                 let updateDeudaProveedor = await Supplier.update(updateDeuda,
//                     {             
//                       where: {ID_Supplier:supplierId},
//                       attributes: ['DebsToPay']
//                     }
//                   );

//             }
            

//          }
//       }
//       else{
//         let paymentDetails={};
//         console.log(totalFactura);
//         console.log(saldoActual);
//         paymentinfo.Saldo=parseFloat(totalFactura)-parseFloat(monto);
//         paymentinfo.ID_PurchaseInvoice=invoiceId;
//         paymentinfo.DatePayment=creacion;   
//         paymentinfo.codpayment=codigo;
//         paymentinfo.ID_User=userId;
//         PaymentToSupplier.create(paymentinfo)  //Creacion de factura #1
//         .then(async result => {
//             let paymentid=result.ID_Payments;
//             if(paymentid){
//                 paymentDetails.CreationDate=creacion;
//                 paymentDetails.Reason=req.body.Reason;
//                 paymentDetails.ID_PaymentMethods=req.body.ID_PaymentMethod;
//                 paymentDetails.Cancelled=0;
//                 if(req.body.ID_PaymentMethod!==1){
//                     paymentDetails.Number=req.body.Number;
//                     paymentDetails.BankName=req.body.BankName;    
//                     paymentDetails.Amount=monto;
                    
//                     paymentDetails.ID_Payments=paymentid;
//                     paymentDetails.NoTransaction=req.body.NoTransaction;
//                 }
//                 else{     
//                     paymentDetails.Amount=monto;
//                     paymentDetails.ID_Payments=paymentid;
//                 }

//                 PaymentToSupplierDetails.create(paymentDetails)  //Creacion de factura #1
//                 .then(async result => {
                   
                    
//                     let sumMontos=await PaymentToSupplierDetails.sum('Amount', { where: { ID_Payments: paymentid, Cancelled:false} });
                            
//                     console.log(sumMontos);
//                     console.log(parseFloat(totalaPagarInvoice.Total));
//                     if(parseFloat(sumMontos)===parseFloat(totalaPagarInvoice.Total)){
//                         console.log("SUMAAAANDOOOO");
//                         console.log(sumMontos);
//                         console.log(totalaPagarInvoice);
//                         let pagada={
//                             Pagada: 1
//                         };
//                         let pagoUpdate = await PurchaseInvoice.update(pagada,
//                             {             
//                               where: {ID_PurchaseInvoice:invoiceId},
//                               attributes: ['Pagada',]
//                             }
//                           );
//                         i
//                     }
//                     res.status(200).json(result);
//                 })
//                 .catch(err =>
//                 {
//                     console.log(err);
//                     res.status(500).send({message:"Error al Registra Detalle de Pago"});
//                 });
//             }
//             let updateDeuda={
//                 DebsToPay: parseFloat(deuda)-parseFloat(monto)
//             };
            
//             let updateDeudaProveedor = await Supplier.update(updateDeuda,
//                 {             
//                   where: {ID_Supplier:supplierId},
//                   attributes: ['DebsToPay']
//                 }
//               );
//         })
//         .catch(err =>
//         {
//             console.log(err);
//             res.status(500).send({message:"Error al Registra Pago"});
//         });
//       }
      

//     }catch(error){
//         console.log(error);

//         res.status(500).json({
//             message: "Error en query!",
//             error: error
//         });
//     }
 
// }


// async function getPaymentDetails(req, res){
    
//     let invoiceId= req.params.id;
    
//     try{
//         PaymentToSupplier.findAll({
//             include:[{
//                 model:PaymentToSupplierDetails,
//                 on:{
//                     ID_Payments:sequelize.where(sequelize.col("ec_paymentdetail.ID_Payments"), "=", sequelize.col("ec_payments.ID_Payments"))
//                 }
//             }],
//             where: {
//                 ID_PurchaseInvoice:invoiceId
//             }
//         })
//         .then(detalles => {
//             res.status(200).send({detalles});
          
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

// async function cancelledPaymentInvoice(req,res){
//     let paymentinfo = {};
//     let detailId=req.params.id;
//     let monto=0;
//     let supplierId=req.body.ID_Supplier;
//     let invoiceId=req.body.ID_PurchaseInvoice;
//     let deuda=0;
//     let idpay=req.body.idpayment;
//     let saldop=req.body.saldopendiente;
//     console.log(req.body);
//     let deudaProveedor=await Supplier.findAll({ 
//         where:{	ID_Supplier:supplierId},
//         attributes: ['DebsToPay']
//     });
//     console.log(deudaProveedor);
//     for(let i=0; i<deudaProveedor.length;i++){
//        deuda=deudaProveedor[i].dataValues.DebsToPay;
//     }
//     let totalaPagarInvoice=await PurchaseInvoice.findByPk(invoiceId,{attributes: ['Total']});
//     try {
//     let detailPayment=await PaymentToSupplierDetails.findByPk(detailId);
//      console.log(detailPayment);
   
//         if(detailPayment)
//         {
//            let updateDebstoPay={
//                DebsToPay: parseFloat(deuda)+parseFloat(detailPayment.Amount)
//            }
//            let updateSaldo={
//                Saldo:parseFloat(saldop)+parseFloat(detailPayment.Amount)
//            }

//            let changeState={
//                Cancelled:true
//            }
           
//            let updateDeudaProveedor = await Supplier.update(updateDebstoPay,
//             {             
//               where: {ID_Supplier:supplierId},
//               attributes: ['DebsToPay']
//             }
//           );

//           let updatePaymentSaldo = await PaymentToSupplier.update(updateSaldo,
//             {             
//               where: {ID_Payments:idpay},
//               attributes: ['Saldo']
//             }
//           );
//           let sumMontos=await PaymentToSupplierDetails.sum('Amount', { where: { ID_Payments: idpay, Cancelled:false} });
                            
//           console.log(sumMontos);
//           console.log(parseFloat(totalaPagarInvoice.Total));
//           if(parseFloat(sumMontos)===parseFloat(totalaPagarInvoice.Total)){
//               console.log("SUMAAAANDOOOO");
//               console.log(invoiceId);
//               console.log(sumMontos);
//               console.log(totalaPagarInvoice);
//               let pagada={
//                   Pagada: 1
//               };
//               let pagoUpdate = await PurchaseInvoice.update(pagada,
//                   {             
//                     where: {ID_PurchaseInvoice:invoiceId},
//                     attributes: ['Pagada',]
//                   }
//                 );
              
//           }
//           else{
//             let pagada={
//                 Pagada: 0
//             };
//             let pagoUpdate = await PurchaseInvoice.update(pagada,
//                 {             
//                     where: {ID_PurchaseInvoice:invoiceId},
//                     attributes: ['Pagada',]
//                 }
//                 );
//         }

//           let cancelledPay = await detailPayment.update(changeState,
//             {             
//               where: {ID_PaymentDetails:detailId},
//               attributes: ['Cancelled']
//             }
//           );
//           if(!cancelledPay) {
//             res.status(500).json({
//                 message: "Error -> No se ha registrado Pago ",
//                 error: "No se puede actualizar",
//             });
//          }

//         res.status(200).json(cancelledPay);

//         }
//         else
//         {
//             res.status(500).json({
//                 message: "EError -> No se ha registrado Pago",
//                 error: "No se puede actualizar",
//             });
//         }
        
//     } catch (error) {
//         res.status(500).json({
//             message: "Error en query!"+error,
//             error: error
//         });
//     }
    
// }


async function updatePaymentInvdoice(req,res){
    let paymentinfo = {};
    let detailId=req.params.id;
    let monto=0;
    let supplierId=req.body.ID_Supplier;
    let deuda=0;
    let idpay=req.body.idpayment;
    let saldop=req.body.saldopendiente;
    let montoRegistrado=req.body.montoReg;
    let invoiceId= req.body.ID_PurchaseInvoice;
    let cambios=req.body.change;
    
    console.log(req.body.idpayment);

    let deudaProveedor=await Supplier.findAll({ 
        where:{	ID_Supplier:supplierId},
        attributes: ['DebsToPay']
    });
  
    for(let i=0; i<deudaProveedor.length;i++){
       deuda=deudaProveedor[i].dataValues.DebsToPay;
    }
    let totalaPagarInvoice=await PurchaseInvoice.findByPk(invoiceId,{attributes: ['Total']});
    let cuentaxPagar=await PurchaseInvoice.findByPk(invoiceId,{ //de factura
        attributes: ['Total']
    });
    console.log(cuentaxPagar.Total); //total de factura

    try {
        let detailPayment=await PaymentToSupplierDetails.findByPk(detailId);
        
       
            if(detailPayment)
            {
                console.log(saldop);
                console.log(cambios.Amount);
                
                if(cambios.Amount){
                        let updateSaldo={
                            Saldo:parseFloat(saldop)+parseFloat(montoRegistrado)
                        }
                        let updateDebstoPay={
                            DebsToPay: parseFloat(deuda)+parseFloat(montoRegistrado)
                        }
                        let updateDeudaProveedor = await Supplier.update(updateDebstoPay,
                            {             
                            where: {ID_Supplier:supplierId},
                            attributes: ['DebsToPay']
                            }
                        );
                            let updatePaymentSaldo = await PaymentToSupplier.update(updateSaldo,
                            {             
                            where: {ID_Payments:idpay},
                            attributes: ['Saldo']
                            }
                        );
                        let nuevoSaldo=await PaymentToSupplier.findByPk(idpay,{attributes:['Saldo']});
                        let nuevaCuentaxPagar=await Supplier.findByPk(supplierId,{attributes: ['DebsToPay']});
                         console.log(nuevoSaldo.Saldo);
                         console.log(nuevaCuentaxPagar.DebsToPay);
                         if(parseFloat(nuevoSaldo.Saldo)>= parseFloat(cambios.Amount) )
                        {
                            console.log("PERMITEE PAGOOO");

                            let updateSaldo={
                                Saldo:parseFloat(nuevoSaldo.Saldo)-parseFloat(cambios.Amount)
                            }
                            let updatePaymentSaldo = await PaymentToSupplier.update(updateSaldo,
                             {             
                               where: {ID_Payments:idpay},
                               attributes: ['Saldo']
                             }
                           );

                           let updateDebstoPay={
                            DebsToPay: parseFloat(deuda)-parseFloat(montoRegistrado)
                            }
                           let updateDeudaProveedor = await Supplier.update(updateDebstoPay,
                            {             
                            where: {ID_Supplier:supplierId},
                            attributes: ['DebsToPay']
                            }
                           );

                           

                           let updateDetails={
                               Amount:cambios.Amount,
                               BankName: cambios.BankName?cambios.BankName:null,
                               Number:cambios.Number?cambios.Number:null,

                           }

                           let updateDetailPay = await detailPayment.update(updateDetails,
                            {             
                              where: {ID_PaymentDetails:detailId},
                              attributes: ['Cancelled']
                            }
                          );

                          if(!updateDetailPay){
                            res.status(500).json({
                                message: "Error -> No se ha registrado Pago ",
                                error: "No se puede actualizar",
                            });
                          }else{
                            let sumMontos=await PaymentToSupplierDetails.sum('Amount', { where: { ID_Payments: idpay, Cancelled:false} });
                            
                            console.log(sumMontos);
                            console.log(parseFloat(totalaPagarInvoice.Total));
                            if(parseFloat(sumMontos)===parseFloat(totalaPagarInvoice.Total)){
                                console.log("SUMAAAANDOOOO");
                                console.log(invoiceId);
                                console.log(sumMontos);
                                console.log(totalaPagarInvoice);
                                let pagada={
                                    Pagada: 1
                                };
                                let pagoUpdate = await PurchaseInvoice.update(pagada,
                                    {             
                                        where: {ID_PurchaseInvoice:invoiceId},
                                        attributes: ['Pagada',]
                                    }
                                    );
                                
                            }
                            else{
                                let pagada={
                                    Pagada: 0
                                };
                                let pagoUpdate = await PurchaseInvoice.update(pagada,
                                    {             
                                        where: {ID_PurchaseInvoice:invoiceId},
                                        attributes: ['Pagada',]
                                    }
                                    );
                            }
                          }
                
                        res.status(200).json(updateDetailPay);
    
                
                        

                    }
                    else{
                        res.status(500).json({
                            message: "Monto Incorrecto",
                            error: "Ingrese  Monto Valido",
                        });
                    }
                }
                else{
                   let updateDetails={
                       BankName: cambios.BankName?cambios.BankName:null,
                       Number:cambios.Number?cambios.Number:null,
                       ID_PaymentMethods:cambios.ID_PaymentMethod?cambios.ID_PaymentMethod:null,

                   }

                   let updateDetailPay = await detailPayment.update(updateDetails,
                    {             
                      where: {ID_PaymentDetails:detailId},
                      attributes: ['Cancelled']
                    }
                  );

                  if(!updateDetailPay){
                    res.status(500).json({
                        message: "Error -> No se ha registrado Pago ",
                        error: "No se puede actualizar",
                    });
                }
        
                res.status(200).json(updateDetailPay);
                }
                
             
            //    let updateDebstoPay={
            //        DebsToPay: parseFloat(deuda)+parseFloat(detailPayment.Amount)
            //    }
            //    let updateSaldo={
            //        Saldo:parseFloat(saldop)+parseFloat(detailPayment.Amount)
            //    }
    
            //    let changeState={
            //        Cancelled:true
            //    }
               
            //    let updateDeudaProveedor = await Supplier.update(updateDebstoPay,
            //     {             
            //       where: {ID_Supplier:supplierId},
            //       attributes: ['DebsToPay']
            //     }
            //   );
    
            //   let updatePaymentSaldo = await PaymentToSupplier.update(updateSaldo,
            //     {             
            //       where: {ID_Payments:idpay},
            //       attributes: ['Saldo']
            //     }
            //   );
    
            //   let cancelledPay = await detailPayment.update(changeState,
            //     {             
            //       where: {ID_PaymentDetails:detailId},
            //       attributes: ['Cancelled']
            //     }
            //   );
            //   if(!cancelledPay) {
            //     res.status(500).json({
            //         message: "Error -> No se ha registrado Pago ",
            //         error: "No se puede actualizar",
            //     });
            // }
    
            // res.status(200).json(cancelledPay);
    
            }
            else
            {
                res.status(500).json({
                    message: "EError -> No se ha registrado Pago",
                    error: "No se puede actualizar",
                });
            }
            
        } catch (error) {
            res.status(500).json({
                message: "Error en query!",
                error: error
            });
        }

}

// async function getAllPayments(req,res){
//     let userId= req.params.id;
    
//     try{
//         PaymentToSupplier.findAll({
//             include:[{
//                 model:PaymentToSupplierDetails,
//                 on:{
//                     ID_Payments:sequelize.where(sequelize.col("ec_paymentdetail.ID_Payments"), "=", sequelize.col("ec_payments.ID_Payments"))
//                 }, 
               
//             },
//             {
//                 model:PurchaseInvoice,
//                 on:{
//                     ID_Payments:sequelize.where(sequelize.col("ec_payments.ID_PurchaseInvoice"), "=", sequelize.col("ec_purchaseinvoices.ID_PurchaseInvoice"))
//                 }, 
//                 attributes: ['InvoiceNumber','Total','ID_PurchaseInvoice']
//             }
//         ],
//             where: {
//                 ID_User:userId
//             }
//         })
//         .then(pagos => {
//             res.status(200).send({pagos});
          
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


// async function cancelledAllPayments(req, res){
    
// }


// module.exports={
//     addPaymentToInvoice,
//     getPaymentDetails,
//     cancelledPaymentInvoice,
//     updatePaymentInvoice,
//     getAllPayments
// }