const db = require('../config/db.config.js');;
const { Op } = require("sequelize");
const sequelize = require('sequelize');

const PaymentToSupplier = db.PaymentToSupplier;
const PaymentToSupplierDetails= db.PaymentToSupplierDetails;
const PurchaseInvoice= db.PurchaseInvoice;
const Company = db.Company;
const User = db.User;
const Supplier = db.Supplier;


async function addPaymentToInvoice(req, res){
    let paymentinfo = {};
    let companyId = req.body.ID_Company;
    let userId= req.body.ID_User;
    let supplierId=req.body.ID_Supplier;
    let invoiceId= req.body.ID_PurchaseInvoice;
    let totalFactura= req.body.Total;
    let now= new Date();
    let creacion=now.getTime();
    let saldoActual=0;
    let codigo=0;
    let deuda=0;
    let pagoExiste=false;
    console.log(req.body);
    let codigoPayment=await PaymentToSupplier.max('codpayment',{ 
        include: [
            {
                 model: User,
                 attributes: ['ID_User'],
                 on:{
                   
                    ID_User: sequelize.where(sequelize.col("ec_payments.ID_User"), "=", sequelize.col("sys_users.ID_User")),
                    
                 },
                include: [
                    {
                        model:Company,
                        attributes: ['ID_Company'],
                        where:ID_Company=companyId
                    }
                ]
                 
             }
            ],
           
            where: {ID_User:userId}, 
        
    }).then(function(orden) {
        
       return orden;
    });
    //calculando codigo
    if(!codigoPayment){
        codigo =1;
    }else {codigo=codigoPayment+1}
    
    let totalaPagarInvoice=await PurchaseInvoice.findByPk(invoiceId,{attributes: ['Total']});
    let existPago=await PaymentToSupplier.findAll({ 
        where:{	ID_PurchaseInvoice:invoiceId},
        attributes: ['Saldo']
    });
    let deudaProveedor=await Supplier.findAll({ 
        where:{	ID_Supplier:supplierId},
        attributes: ['DebsToPay']
    });
    console.log(deudaProveedor);
    for(let i=0; i<deudaProveedor.length;i++){
       deuda=deudaProveedor[i].dataValues.DebsToPay;
    }
    if(existPago.length > 0){
        pagoExiste=true;
         for(let i=0; i<existPago.length;i++){
        saldoActual=existPago[i].dataValues.Saldo;
     }
    }

    console.log(deuda);
    console.log(pagoExiste);

    try{
        let monto=req.body.Monto;
        paymentinfo.ID_PurchaseInvoice=invoiceId;
       
        paymentinfo.DatePayment=creacion;
        
        paymentinfo.codpayment=codigo;
        paymentinfo.ID_User=userId;
     
      if(pagoExiste){
          console.log(deuda);
          console.log(totalFactura)
          console.log(saldoActual);
         if(parseFloat(totalFactura)>parseFloat(saldoActual)){
            console.log("entrando");
             let paymentid=null;
             let paymentDetails={};
            paymentinfo.Saldo=parseFloat(totalFactura)-parseFloat(monto);
            if( parseFloat(saldoActual)<parseFloat(monto)){
                res.status(500).send({message:"Monto Superior a Deuda"});
            }
            else{
                let updatePago={
                    Saldo: parseFloat(saldoActual)-parseFloat(monto)
                };
                
                let pagoUpdate = await PaymentToSupplier.update(updatePago,
                    {             
                      where: {ID_PurchaseInvoice:invoiceId},
                      attributes: ['Saldo','ID_Payments']
                    }
                  );
                let getPayment=await PaymentToSupplier.findAll({where:{ID_PurchaseInvoice:invoiceId},attributes:['ID_Payments'] })
                if(getPayment.length> 0){
                    for(let i=0; i<getPayment.length; i++){
                        paymentid=getPayment[i].dataValues.ID_Payments
                    }
                }
                 
                if(paymentid){
                    paymentDetails.CreationDate=creacion;
                    paymentDetails.Reason=req.body.Reason;
                    paymentDetails.ID_PaymentMethods=req.body.ID_PaymentMethod;
                    paymentDetails.Cancelled=0;
                    if(req.body.ID_PaymentMethod!==1){
                        paymentDetails.Number=req.body.Number;
                        paymentDetails.BankName=req.body.BankName;    
                        paymentDetails.Amount=monto;
                        paymentDetails.ID_Payments=paymentid;
                        paymentDetails.NoTransaction=req.body.NoTransaction;
                    }
                    else{     
                        paymentDetails.Amount=monto;
                        paymentDetails.ID_Payments=paymentid;
                    }

                    PaymentToSupplierDetails.create(paymentDetails)  //Creacion de factura #1
                    .then(async result => {
                        let paymentDetailId=result.ID_PaymentDetails;
                        if(paymentDetailId){
                            let sumMontos=await PaymentToSupplierDetails.sum('Amount', { where: { ID_Payments: paymentid, Cancelled:false} });
                            
                            console.log(sumMontos);
                            console.log(parseFloat(totalaPagarInvoice.Total));
                            if(parseFloat(sumMontos)===parseFloat(totalaPagarInvoice.Total)){
                                console.log("SUMAAAANDOOOO");
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
                        }
                        res.status(200).json(result);
                    })
                    .catch(err =>
                    {
                        console.log(err);
                        res.status(500).send({message:"Error al Registra Detalle de Pago"});
                    });

                   
                }

                let updateDeuda={
                    DebsToPay: parseFloat(deuda)-parseFloat(monto)
                };
                
                let updateDeudaProveedor = await Supplier.update(updateDeuda,
                    {             
                      where: {ID_Supplier:supplierId},
                      attributes: ['DebsToPay']
                    }
                  );

            }
            

         }
      }
      else{
        let paymentDetails={};
        console.log(totalFactura);
        console.log(saldoActual);
        paymentinfo.Saldo=parseFloat(totalFactura)-parseFloat(monto);
        paymentinfo.ID_PurchaseInvoice=invoiceId;
        paymentinfo.DatePayment=creacion;   
        paymentinfo.codpayment=codigo;
        paymentinfo.ID_User=userId;
        PaymentToSupplier.create(paymentinfo)  //Creacion de factura #1
        .then(async result => {
            let paymentid=result.ID_Payments;
            if(paymentid){
                paymentDetails.CreationDate=creacion;
                paymentDetails.Reason=req.body.Reason;
                paymentDetails.ID_PaymentMethods=req.body.ID_PaymentMethod;
                paymentDetails.Cancelled=0;
                if(req.body.ID_PaymentMethod!==1){
                    paymentDetails.Number=req.body.Number;
                    paymentDetails.BankName=req.body.BankName;    
                    paymentDetails.Amount=monto;
                    
                    paymentDetails.ID_Payments=paymentid;
                    paymentDetails.NoTransaction=req.body.NoTransaction;
                }
                else{     
                    paymentDetails.Amount=monto;
                    paymentDetails.ID_Payments=paymentid;
                }

                PaymentToSupplierDetails.create(paymentDetails)  //Creacion de factura #1
                .then(async result => {
                   
                    
                    let sumMontos=await PaymentToSupplierDetails.sum('Amount', { where: { ID_Payments: paymentid, Cancelled:false} });
                            
                    console.log(sumMontos);
                    console.log(parseFloat(totalaPagarInvoice.Total));
                    if(parseFloat(sumMontos)===parseFloat(totalaPagarInvoice.Total)){
                        console.log("SUMAAAANDOOOO");
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
                        i
                    }
                    res.status(200).json(result);
                })
                .catch(err =>
                {
                    console.log(err);
                    res.status(500).send({message:"Error al Registra Detalle de Pago"});
                });
            }
            let updateDeuda={
                DebsToPay: parseFloat(deuda)-parseFloat(monto)
            };
            
            let updateDeudaProveedor = await Supplier.update(updateDeuda,
                {             
                  where: {ID_Supplier:supplierId},
                  attributes: ['DebsToPay']
                }
              );
        })
        .catch(err =>
        {
            console.log(err);
            res.status(500).send({message:"Error al Registra Pago"});
        });
      }
      

    }catch(error){
        console.log(error);

        res.status(500).json({
            message: "Error en query!",
            error: error
        });
    }
 
}


async function getPaymentDetails(req, res){
    
    let invoiceId= req.params.id;
    
    try{
        PaymentToSupplier.findAll({
            include:[{
                model:PaymentToSupplierDetails,
                on:{
                    ID_Payments:sequelize.where(sequelize.col("ec_paymentdetail.ID_Payments"), "=", sequelize.col("ec_payments.ID_Payments"))
                }
            }],
            where: {
                ID_PurchaseInvoice:invoiceId
            }
        })
        .then(detalles => {
            res.status(200).send({detalles});
          
        })
    }catch(error) {
        // imprimimos a consola
        console.log(error);

        res.status(500).json({
            message: "Error en query!",
            error: error
        });
    }
}

async function cancelledPaymentInvoice(req,res){
    let paymentinfo = {};
    let detailId=req.params.id;
    let monto=0;
    let supplierId=req.body.ID_Supplier;
    let invoiceId=req.body.ID_PurchaseInvoice;
    let deuda=0;
    let idpay=req.body.idpayment;
    let saldop=req.body.saldopendiente;
    console.log(req.body);
    let deudaProveedor=await Supplier.findAll({ 
        where:{	ID_Supplier:supplierId},
        attributes: ['DebsToPay']
    });
    console.log(deudaProveedor);
    for(let i=0; i<deudaProveedor.length;i++){
       deuda=deudaProveedor[i].dataValues.DebsToPay;
    }
    let totalaPagarInvoice=await PurchaseInvoice.findByPk(invoiceId,{attributes: ['Total']});
    try {
    let detailPayment=await PaymentToSupplierDetails.findByPk(detailId);
     console.log(detailPayment);
   
        if(detailPayment)
        {
           let updateDebstoPay={
               DebsToPay: parseFloat(deuda)+parseFloat(detailPayment.Amount)
           }
           let updateSaldo={
               Saldo:parseFloat(saldop)+parseFloat(detailPayment.Amount)
           }

           let changeState={
               Cancelled:true
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

          let cancelledPay = await detailPayment.update(changeState,
            {             
              where: {ID_PaymentDetails:detailId},
              attributes: ['Cancelled']
            }
          );
          if(!cancelledPay) {
            res.status(500).json({
                message: "Error -> No se ha registrado Pago ",
                error: "No se puede actualizar",
            });
         }

        res.status(200).json(cancelledPay);

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
            message: "Error en query!"+error,
            error: error
        });
    }
    
}


async function updatePaymentInvoice(req,res){
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

async function getAllPayments(req,res){
    let userId= req.params.id;
    
    try{
        PaymentToSupplier.findAll({
            include:[{
                model:PaymentToSupplierDetails,
                on:{
                    ID_Payments:sequelize.where(sequelize.col("ec_paymentdetail.ID_Payments"), "=", sequelize.col("ec_payments.ID_Payments"))
                }, 
               
            },
            {
                model:PurchaseInvoice,
                on:{
                    ID_Payments:sequelize.where(sequelize.col("ec_payments.ID_PurchaseInvoice"), "=", sequelize.col("ec_purchaseinvoices.ID_PurchaseInvoice"))
                }, 
                attributes: ['InvoiceNumber','Total','ID_PurchaseInvoice']
            }
        ],
            where: {
                ID_User:userId
            }
        })
        .then(pagos => {
            res.status(200).send({pagos});
          
        })
    }catch(error) {
        // imprimimos a consola
        console.log(error);

        res.status(500).json({
            message: "Error en query!",
            error: error
        });
    }  
}


module.exports={
    addPaymentToInvoice,
    getPaymentDetails,
    cancelledPaymentInvoice,
    updatePaymentInvoice,
    getAllPayments
}