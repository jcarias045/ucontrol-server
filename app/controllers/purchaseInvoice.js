const db = require('../config/db.config.js');;
const sequelize = require('sequelize');
const { Op, or } = require("sequelize");


const PurchaseInvoice=db.PurchaseInvoice;
const PurchaseOrder = db.PurchaseOrder;
const PurchaseDetails= db.PurchaseDetails;
const Supplier = db.Supplier;
const PurchaseInvoiceDetails = db.PurchaseInvoiceDetails;
const Inventory = db.Inventory;
const Product = db.Product;
const Measure = db.Measure;
const InvoiceTaxes=db.InvoiceTaxes;
const Company = db.Company;
const ProductEntries=db.ProductEntries;
const InvoiceEntriesDetails = db.InvoiceEntriesDetails;
const SupplierType = db.SupplierTypes;

function getSuppliersInvoices(req, res){
    let userId = req.params.id; 
    let companyId = req.params.company;
    let antCod=0;
    
    try{
        PurchaseInvoice.findAll({    
             include: [
            {
                    model: Supplier,
                    attributes: ['ID_Supplier','Name'],
                    where: {ID_Company:companyId},
                    on:{
                   
                        ID_Supplier: sequelize.where(sequelize.col("ec_purchaseinvoice.ID_Supplier"), "=", sequelize.col("crm_suppliers.ID_Supplier")),
                     
                     }
                }]
                 
            ,
            where: {ID_User:userId},
           
          })
        .then(invoices => {
            res.status(200).send({invoices});
            
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
async function createSupplierInvoice(req, res){
    let orden = {};
    let now= new Date();
    let creacion=now.getTime();
    let purchaseDetalle=req.body.details;
    let dePurchaseOrder=req.body.ordenAnt;
    let addTaxes=req.body.impuestos;
    let companyId = req.params.company;
    let diasEntrega=req.body.dias;
    let fechaInvoice=req.body.InvoiceDate;
    let userId = req.params.id; 
    let codigo=0;      //correlativo de la factura
    let codIngreso=0; //correlativo del ingreso
    let deuda=0;
    
    //calculo fecha 
    var date = new Date(fechaInvoice);
   
    // date.setMonth(date.getMonth() - 1/2);
    date.setDate(date.getDate() + diasEntrega);
    console.log("HOLA");
    
    let requiredIncome=await Company.findAll({attributes:['RequiredIncome'], where:{RequiredIncome:false,ID_Company:companyId}}).
    then(function(result){return result});
    
    

    if(requiredIncome.length > 0){
        let entrycod=await ProductEntries.max('codentry',{ 
       
            where: {ID_User:userId}
        
    }).then(function(orden) {
        
       return orden;
    });
    
    if(!entrycod){
        codIngreso =1;
    }else {codIngreso=entrycod+1}

    console.log("INGRESO NO REQUERIDOOOOOOO");
    }
    // console.log(codIngreso);

    let codigoPurchase=await PurchaseInvoice.max('codInvoice',{  //codigo factura=correlativo
        include: [
            {
                 model: Supplier,
                 attributes: ['ID_Supplier','Name'],
                 where: {ID_Company:companyId},
                 
             }
            ],
            where: {ID_User:userId}, 
        
    }).then(function(orden) {
        
       return orden;
    });
    
    if(!codigoPurchase){
        codigo =1;
    }else {codigo=codigoPurchase+1}

    let supplierId=req.body.ID_Supplier
    let deudaProveedor=await Supplier.findAll({ 
        where:{	ID_Supplier:supplierId},
        attributes: ['DebsToPay']
    });
    console.log(deudaProveedor);
    for(let i=0; i<deudaProveedor.length;i++){
       deuda=deudaProveedor[i].dataValues.DebsToPay;
    }
    
    
    try{
        let details={};
        let deOrden={};
        let impuestos={};
        let entryProduct={};
        let invoiceEntriesD={};
        //asignando valores 
        orden.ID_PurchaseOrder=req.body.PurchaseOrder;
        orden.InvoiceDate=req.body.InvoiceDate;
        orden.ID_Supplier=req.body.ID_Supplier;
        orden.InvoiceNumber=req.body.InvoiceNumber;
        orden.CreationDate= creacion;
        orden.Total=req.body.Total;
        orden.ID_User=req.body.ID_User;
        orden.DeliverDay=date;
        orden.State='Creada'; 
        orden.PurchaseNumber=req.body.PurchaseNumber;
        orden.Comments=req.body.Description; 
        orden.InvoiceComments	=req.body.InvoiceComments;
        orden.Pagada=false;
        orden.Recibida=requiredIncome.length > 0?true:false;
        orden.codInvoice=codigo;
        console.log(orden);
        // Save to MySQL database
    PurchaseInvoice.create(orden)  //Creacion de factura #1
      .then(async result => {    
        res.status(200).json(result);
        let idPurchase=result.ID_PurchaseInvoice;
        //agregando deuda a proveedor de
        let updateDeuda={
            DebsToPay: parseFloat(deuda)+parseFloat(req.body.Total)
        };
        
        let updateDeudaProveedor = await Supplier.update(updateDeuda,
            {             
              where: {ID_Supplier:supplierId},
              attributes: ['DebsToPay']
            }
          );
          let updateOrden={
            State: 'Facturada'
        };
        
        let updateOrdenaFacturada = await PurchaseOrder.update(updateOrden,
            {             
              where: {ID_PurchaseOrder:req.body.PurchaseOrder},
              attributes: ['ID_PurchaseOrder']
            }
          );
          //id de la factura recien creada
        if(idPurchase){
            if(addTaxes.length > 0){
                for(const item of addTaxes){
                    impuestos.ID_PurchaseInvoice =idPurchase;
                    impuestos.ID_Taxes =item.id;
                    impuestos.Monto=item.monto;
                    InvoiceTaxes.create(impuestos).catch(err => {return err.message})
                }  
            }
            
            if(purchaseDetalle.length > 0){    //se crea a partir de la orden de compra
                for(const item of purchaseDetalle){
                    console.log(item.Name);
                    details.ProductName=item.Name;
                    details.ID_PurchaseInvoice=idPurchase;
                    details.Quantity=parseFloat(item.Quantity) ;
                    details.Discount=parseFloat(item.Discount);
                    details.Price=parseFloat(item.Price);
                    details.ID_Inventory =item.ID_Inventory;
                    details.Ingresados=requiredIncome.length > 0?parseFloat(item.Quantity):0;
                    details.State=requiredIncome.length > 0?1:0;
                    details.SubTotal=parseFloat((item.Quantity*item.Price)-(item.Quantity*item.Price)*item.Discount)
                    console.log(details);
                    PurchaseInvoiceDetails.create(details).then(async result=>{
                        if(!result){
                            res.status(500).send({message:"Error al ingresar el detalle de la orden"});
                        }
                        
                    }).catch(err=>{
                        console.log(err);
                     return err.message;
                 });
                 }
                 if(requiredIncome.length > 0){
                    entryProduct.EntryDate=creacion;
                    entryProduct.ID_User=userId;
                    entryProduct.Comments="Ingreso generado automaticamente "+creacion;
                    entryProduct.State=0;
                    entryProduct.codentry=codIngreso;
                    console.log(entryProduct);
                    ProductEntries.create(entryProduct).then(async result=>{
                       let entryId=result.ID_ProductEntry;
                       if(entryId){
                          const factDetalle=await PurchaseInvoiceDetails.findAll({where:{ID_PurchaseInvoice:idPurchase}}).then(function(result){
                           return result;
                          }); 
                          console.log(factDetalle);
                          Object.assign({},factDetalle);
                       
                        
                        for(var i=0;i<factDetalle.length;i++){
                            console.log(factDetalle[i].dataValues. ID_PurchaseInvoiceDetail);
                            let inventarioId=factDetalle[i].dataValues.ID_Inventory;
                            let cantidadI=factDetalle[i].dataValues.Quantity;
                            invoiceEntriesD.ID_PurchaseInvoiceDetail=factDetalle[i].dataValues.ID_PurchaseInvoiceDetail;
                            invoiceEntriesD.ID_ProductEntry=entryId;
                            invoiceEntriesD.Quantity=factDetalle[i].dataValues.Quantity;
                            invoiceEntriesD.ID_Inventory=factDetalle[i].dataValues.ID_Inventory;
                            InvoiceEntriesDetails.create(invoiceEntriesD).then(async result => {
                                let invenrotyExist = await  Inventory.findAll({
                                    include: [
                                        {
                                           model:Product,
                                           attributes: [],
                                           on: {
                                            ID_Products: sequelize.where(sequelize.col("ec_inventory.ID_Products"), "=", sequelize.col("crm_products.ID_Products"))
                                           }
                                        }
                                    ],
                                    attributes: ['Stock'],
                                    where: {ID_Inventory:inventarioId}
                                }).then(orders => {
                                    return orders
                                });
                                cantidad=parseFloat(invenrotyExist[0].dataValues.Stock) + parseFloat(cantidadI);
                                console.log(cantidad);
                                let updateStock={
                                    Stock :cantidad
                                       
                                }
                                let inventario = await Inventory.update(updateStock,
                                    {             
                                      where: {ID_Inventory : inventarioId, ID_Bodega:8},
                                      attributes: ['Stock','inventory']
                                    }
                                  );
                            });
                        }
                       
                       }
                    })
                    
                }
            }
            if(dePurchaseOrder.length > 0){
                for(const item of dePurchaseOrder){
                deOrden.ProductName=item.ec_purchasedetail.ProductName;
                deOrden.ID_PurchaseInvoice =idPurchase;
                deOrden.Quantity=parseFloat(item.ec_purchasedetail.Quantity) ;
                deOrden.Discount=parseFloat(item.ec_purchasedetail.Discount);
                deOrden.Price=parseFloat(item.crm_products.BuyPrice);
                deOrden.ID_Inventory =item.ID_Inventory;
                deOrden.Ingresados=requiredIncome.length > 0?parseFloat(item.ec_purchasedetail.Quantity):0;
                deOrden.State=requiredIncome.length > 0?1:0;
                deOrden.SubTotal=parseFloat((item.ec_purchasedetail.Quantity*item.crm_products.BuyPrice)-(item.ec_purchasedetail.Quantity*item.crm_products.BuyPrice)*item.ec_purchasedetail.Discount);
                PurchaseInvoiceDetails.create(deOrden).then(async result=>{
                    if(!result){res.status(500).send({message:"Error al ingresar el detalle de la orden"});}
                    }).catch(err=>{
                        console.log(err);
                    return err.message;
                    });
                    
                }
                if(requiredIncome.length > 0){
                    entryProduct.EntryDate=creacion;
                    entryProduct.ID_User=userId;
                    entryProduct.Comments="Ingreso generado automaticamente "+creacion;
                    entryProduct.State=0;
                    entryProduct.codentry=codIngreso;
                    console.log(entryProduct);
                    ProductEntries.create(entryProduct).then(async result=>{
                       let entryId=result.ID_ProductEntry;
                       if(entryId){
                          const factDetalle=await PurchaseInvoiceDetails.findAll({where:{ID_PurchaseInvoice:idPurchase}}).then(function(result){
                           return result;
                          }); 
                          console.log(factDetalle);
                          Object.assign({},factDetalle);
                       
                        
                        for(var i=0;i<factDetalle.length;i++){
                            console.log(factDetalle[i].dataValues. ID_PurchaseInvoiceDetail);
                            let inventarioId=factDetalle[i].dataValues.ID_Inventory;
                            let cantidadI=factDetalle[i].dataValues.Quantity;
                            invoiceEntriesD.ID_PurchaseInvoiceDetail=factDetalle[i].dataValues.ID_PurchaseInvoiceDetail;
                            invoiceEntriesD.ID_ProductEntry=entryId;
                            invoiceEntriesD.Quantity=factDetalle[i].dataValues.Quantity;
                            invoiceEntriesD.ID_Inventory=factDetalle[i].dataValues.ID_Inventory;
                            InvoiceEntriesDetails.create(invoiceEntriesD).then(async result => {
                                let invenrotyExist = await  Inventory.findAll({
                                    include: [
                                        {
                                           model:Product,
                                           attributes: [],
                                           on: {
                                            ID_Products: sequelize.where(sequelize.col("ec_inventory.ID_Products"), "=", sequelize.col("crm_products.ID_Products"))
                                           }
                                        }
                                    ],
                                    attributes: ['Stock'],
                                    where: {ID_Inventory:inventarioId}
                                }).then(orders => {
                                    return orders
                                });
                                cantidad=parseFloat(invenrotyExist[0].dataValues.Stock) + parseFloat(cantidadI);
                                console.log(cantidad);
                                let updateStock={
                                    Stock :cantidad
                                       
                                }
                                let inventario = await Inventory.update(updateStock,
                                    {             
                                      where: {ID_Inventory : inventarioId, ID_Bodega:8},
                                      attributes: ['Stock','inventory']
                                    }
                                  );
                            });
                        }
                       
                       }
                    })
                    
                }
               
            }
           
        }
        else {
            res.status(500).send({message:"Error al ingresar orden de compra"});
        }
      }).catch(err=>{
        console.log(err);
     return err.message;
 });
    }catch(error){
        res.status(500).json({
            message: "Fail!",
            error: error.message
        });
    }
}

async function createNewSupplierInvoice(req, res){
    let orden = {};
    let now= new Date();
    let creacion=now.getTime();
    let purchaseDetalle=req.body.details;
    let addTaxes=req.body.impuestos;
    let companyId = req.params.company;
    let userId = req.params.id; 
    let codigo=0;      //correlativo de la factura
    let codIngreso=0; //correlativo del ingreso
    let deuda=0;
    let diasEntrega=req.body.dias;
    let fechaInvoice=req.body.InvoiceDate;

    var date = new Date(fechaInvoice);
    console.log(date);
    // date.setMonth(date.getMonth() - 1/2);
    date.setDate(date.getDate() + diasEntrega);
    console.log("HOLA");
    console.log(date);
    console.log(diasEntrega);
    console.log(companyId);
    let requiredIncome=await Company.findByPk(companyId,{attributes:['RequiredIncome'], where:{RequiredIncome:false}}).then(function(result){return result});
    console.log(requiredIncome);
   
    if(requiredIncome.length > 0){
        let entrycod=await ProductEntries.max('codentry',{ 
       
            where: {ID_User:userId}
        
    }).then(function(orden) {
        
       return orden;
    });
    
    if(!entrycod){
        codIngreso =1;
    }else {codIngreso=entrycod+1}

    console.log("INGRESO NO REQUERIDOOOOOOO");
    }
    console.log(codIngreso);
    let codigoPurchase=await PurchaseInvoice.max('codInvoice',{ 
        include: [
            {
                model: PurchaseOrder,
                include: [
                    {
                        model:Supplier,
                        attributes: ['ID_Supplier','Name'],
                        where: {ID_Company:companyId},
                    }
                ]
                 
             }
            ],
            where: {ID_User:userId}, 
        
    }).then(function(orden) {
        
       return orden;
    });
    
    if(!codigoPurchase){
        codigo =1;
    }else {codigo=codigoPurchase+1}
    
    let supplierId=req.body.ID_Supplier
    let deudaProveedor=await Supplier.findAll({ 
        where:{	ID_Supplier:supplierId},
        attributes: ['DebsToPay']
    });
    console.log(deudaProveedor);
    for(let i=0; i<deudaProveedor.length;i++){
       deuda=deudaProveedor[i].dataValues.DebsToPay;
    }
    
    try{
        let details={};
        let deOrden={};
        let impuestos={};
        let entryProduct={};
        let invoiceEntriesD={};
        //asignando valores 
        orden.InvoiceDate=req.body.InvoiceDate;
        orden.ID_Supplier=req.body.ID_Supplier;
        orden.InvoiceNumber=req.body.InvoiceNumber;
        orden.CreationDate= creacion;
        orden.Total=req.body.Total;
        orden.ID_User=req.body.ID_User;
        orden.DeliverDay=date;
        orden.State='Creada'; 
        orden.InvoiceComments	=req.body.InvoiceComments;
        orden.Pagada=false;
        orden.Recibida=requiredIncome.length > 0?true:false;
        orden.codInvoice=codigo;
        orden.Comments='';
        console.log(orden);
        // Save to MySQL database
    PurchaseInvoice.create(orden)
      .then(async result => {    
        res.status(200).json(result);
        let idPurchase=result.ID_PurchaseInvoice;
        let updateDeuda={
            DebsToPay: parseFloat(deuda)+parseFloat(req.body.Total)
        };
        
        let updateDeudaProveedor = await Supplier.update(updateDeuda,
            {             
              where: {ID_Supplier:supplierId},
              attributes: ['DebsToPay']
            }
          );
        if(idPurchase){
            if(addTaxes.length > 0){
                for(const item of addTaxes){
                    impuestos.ID_PurchaseInvoice =idPurchase;
                    impuestos.ID_Taxes =item.id;
                    impuestos.Monto=item.monto;
                    InvoiceTaxes.create(impuestos).catch(err => {return err.message})
                }
               
            }
            if(purchaseDetalle.length > 0){
                for(const item of purchaseDetalle){
                    console.log(item.Name);
                    details.ProductName=item.Name;
                    details.ID_PurchaseInvoice=idPurchase;
                    details.Quantity=parseFloat(item.Quantity) ;
                    details.Discount=parseFloat(item.Discount);
                    details.Price=parseFloat(item.Price);
                    details.ID_Inventory =item.ID_Inventory;
                    details.Ingresados=requiredIncome.length > 0?parseFloat(item.Quantity):0;
                    details.State=requiredIncome.length  > 0?1:0;
                    details.SubTotal=parseFloat((item.Quantity*item.Price)-(item.Quantity*item.Price)*item.Discount)
                    console.log(details);
                    PurchaseInvoiceDetails.create(details).then(async result=>{
                        if(!result){res.status(500).send({message:"Error al ingresar el detalle de la orden"});}
                    }).catch(err=>{
                        console.log(err);
                     return err.message;
                 });
                 }
                 if(requiredIncome.length > 0){
                    entryProduct.EntryDate=creacion;
                    entryProduct.ID_User=userId;
                    entryProduct.Comments="Ingreso generado automaticamente "+creacion;
                    entryProduct.State=0;
                    entryProduct.codentry=codIngreso;
                    console.log(entryProduct);
                    ProductEntries.create(entryProduct).then(async result=>{
                       let entryId=result.ID_ProductEntry;
                       if(entryId){
                          const factDetalle=await PurchaseInvoiceDetails.findAll({where:{ID_PurchaseInvoice:idPurchase}}).then(function(result){
                           return result;
                          }); 
                          console.log(factDetalle);
                          Object.assign({},factDetalle);
                       
                        
                        for(var i=0;i<factDetalle.length;i++){
                            console.log(factDetalle[i].dataValues. ID_PurchaseInvoiceDetail);
                            let inventarioId=factDetalle[i].dataValues.ID_Inventory;
                            let cantidadI=factDetalle[i].dataValues.Quantity;
                            invoiceEntriesD.ID_PurchaseInvoiceDetail=factDetalle[i].dataValues.ID_PurchaseInvoiceDetail;
                            invoiceEntriesD.ID_ProductEntry=entryId;
                            invoiceEntriesD.Quantity=factDetalle[i].dataValues.Quantity;
                            invoiceEntriesD.ID_Inventory=factDetalle[i].dataValues.ID_Inventory;
                            InvoiceEntriesDetails.create(invoiceEntriesD).then(async result => {
                                let invenrotyExist = await  Inventory.findAll({
                                    include: [
                                        {
                                           model:Product,
                                           attributes: [],
                                           on: {
                                            ID_Products: sequelize.where(sequelize.col("ec_inventory.ID_Products"), "=", sequelize.col("crm_products.ID_Products"))
                                           }
                                        }
                                    ],
                                    attributes: ['Stock'],
                                    where: {ID_Inventory:inventarioId}
                                }).then(orders => {
                                    return orders
                                });
                                cantidad=parseFloat(invenrotyExist[0].dataValues.Stock) + parseFloat(cantidadI);
                                console.log(cantidad);
                                let updateStock={
                                    Stock :cantidad
                                       
                                }
                                let inventario = await Inventory.update(updateStock,
                                    {             
                                      where: {ID_Inventory : inventarioId, ID_Bodega:8},
                                      attributes: ['Stock','inventory']
                                    }
                                  );
                            });
                        }
                       
                       }
                    })
                    
                }
            }
         
           
        }
        else {
            res.status(500).send({message:"Error al ingresar orden de compra"});
        }
      }).catch(err=>{
        console.log(err);
     return err.message;
 });
    }catch(error){
        res.status(500).json({
            message: "Fail!",
            error: error.message
        });
    }
}

function getInvoiceDetails(req, res){
    let invoiceId = req.params.id; 
    try{
        Inventory.findAll({
            include: [
                {
                    model: PurchaseInvoiceDetails,
                    attributes: ['ID_PurchaseInvoiceDetail','ID_PurchaseInvoice','Quantity','Discount','ProductName','SubTotal','ID_Inventory','Ingresados','State','Price'],
                    on:{
                   
                       ID_Inventory: sequelize.where(sequelize.col("ec_purchaseinvoicedetail.ID_Inventory"), "=", sequelize.col("ec_inventory.ID_Inventory")),
                    
                    }
                },
                {
                    model: Product,
                    attributes: ['codproducts','ID_Measure','BuyPrice','ID_Products'],
                    on:{
                        ID_Products: sequelize.where(sequelize.col("ec_inventory.ID_Products"), "=", sequelize.col("crm_products.ID_Products")),
                    },
                    include: [
                        {
                            model:Measure,
                            attributes: ['Name'],
                            on: {
                               ID_Measure: sequelize.where(sequelize.col("crm_products.ID_Measure"), "=", sequelize.col("crm_products->crm_measures.ID_Measure")),
                              
                           }
                        },
                        {
                            model: Supplier,
                            attributes: ['ID_Supplier','Name'],
                           
                            on:{
                           
                                ID_Supplier: sequelize.where(sequelize.col("crm_products.ID_Supplier"), "=", sequelize.col("crm_products->crm_suppliers.ID_Supplier")),
                             
                             },
                             include: [{
                                 model:SupplierType,
                                 on:{
                           
                                    ID_SupplierType: sequelize.where(sequelize.col("crm_products.crm_suppliers.crm_suppliertype.ID_SupplierType"), "=", sequelize.col("crm_products.crm_suppliers.ID_SupplierType")),
                                 
                                 },
                                 attributes: ['Name']
                             }]

                        }
                    ]
                    
                }
            ],
            attributes: ['ID_Inventory','Stock'],
            where:{
                ID_PurchaseInvoice: sequelize.where(sequelize.col("ec_purchaseinvoicedetail.ID_PurchaseInvoice"), "=", invoiceId),
                ID_Bodega:8
            }
        })
        .then(details => {
            res.status(200).send({details});
            
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

async function updateInvoicePurchase(req, res){
   
    let purchaseId = req.params.id;
    
    let purchaseDetalle=req.body.details;
    let detailsAnt=req.body.ordenAnt;
    let diasEntrega=req.body.dias;
    let fechaInvoice=req.body.InvoiceDate;
    let orden={};
    let details={};

    var date = new Date(fechaInvoice);
    console.log(date);
    // date.setMonth(date.getMonth() - 1/2);
    date.setDate(date.getDate() + diasEntrega);
    console.log("HOLA");
    console.log(date);
    console.log(diasEntrega);    
    //asignando valores 
    const {Comments,DeliverDay,ID_PurchaseInvoice,InvoiceComments,InvoiceDate,Total,State,InvoiceNumber}= req.body;
    console.log(purchaseDetalle);
  
    try{
        let ordenExist = await PurchaseInvoice.findByPk(purchaseId,{ attributes:['ID_PurchaseInvoice']});
       
        if(!ordenExist){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el cliente con ID = " + purchaseId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = {             
              
               Comments: Comments?Comments:(''),
               DeliverDay: date,
               InvoiceComments: InvoiceComments,
               InvoiceDate: InvoiceDate,
               InvoiceNumber: InvoiceNumber,
               Total: Total,
               State: State,
            }
           
            let result = await PurchaseInvoice.update(updatedObject,
                              {            
                                where: {ID_PurchaseInvoice : purchaseId},
                                attributes: ['ID_PurchaseInvoice']
                              }
                            ).catch(err =>{ console.log(err);});
                            
                            
            if (result) {
               
                if(detailsAnt.length > 0) {
                   
                    for(const item of detailsAnt ){
                        let update={
                           Quantity: item.ec_purchaseinvoicedetail.Quantity,
                           Discount:item.ec_purchaseinvoicedetail.Discount,
                           Price:item.crm_product.BuyPrice,
                           SubTotal: parseFloat((item.crm_product.BuyPrice*item.ec_purchaseinvoicedetail.Quantity)-
                           (item.crm_product.BuyPrice*item.ec_purchaseinvoicedetail.Quantity)*item.ec_purchaseinvoicedetail.Discount)
                        }
                      
                        let resultUpdateD = await PurchaseInvoiceDetails.update(update,
                            { 
                              returning: true,                
                              where: {[Op.and]: [
                                { ID_PurchaseInvoiceDetail: item.ec_purchaseinvoicedetail.ID_PurchaseInvoiceDetail },
                                { ID_PurchaseInvoice:item.ec_purchaseinvoicedetail.ID_PurchaseInvoice}
                              ]},
                              attributes: ['ID_PurchaseInvoiceDetail']
                            }
                          );
                    }
                }    
                 if(purchaseDetalle.length>0){  //agregando nuevo detalle a la orden ya existente
                    console.log("AGREGAAAAANDOOOOO");
                    console.log(req.body.details);
                    for(const item of purchaseDetalle ){
                        let detalleNuevo={
                           Quantity: item.Quantity,
                           Discount:item.Discount,
                           Price:item.Price,
                           SubTotal: parseFloat((item.Price*item.Quantity)-
                           (item.Price*item.Quantity)*item.Discount),
                           ProductName: item.Name,
                           ID_Inventory:item.ID_Inventory,
                           ID_PurchaseInvoice:purchaseId
                        }
                        console.log(detalleNuevo);
                        PurchaseInvoiceDetails.create(detalleNuevo).then(async result=>{
                            console.log(result);
                            if(!result){res.status(500).send({message:"Error al ingresar el detalle de la orden"});}
                        }).catch(err=>{
                            console.log(err);
                         return err.message;
                     });
                    }
                }
            
            }

            // retornamos el resultado al cliente
            if(!result) {
                res.status(500).json({
                    message: "Error -> No se puede actualizar el cliente con ID = " + req.params.id,
                    error: "No se puede actualizar",
                });
            }

            res.status(200).json(result);
        }
    } catch(error){
        res.status(500).json({
            message: "Error -> No se puede actualizar el cliente con ID = " + req.params.id,
            error: error.message
        });
    }
}


async function deleteInvoiceDetail(req, res){
    console.log(req.params.id);

    try{
        let detailId = req.params.id;
        let detalle= await PurchaseInvoiceDetails.findByPk(detailId,{ attributes:['ID_PurchaseInvoiceDetail']});
        console.log(detalle);
        if(!detalle){
            res.status(404).json({
                message: "La compañia con este ID no existe = " + detailId,
                error: "404",
            });
        } else {
            await detalle.destroy();
            res.status(200).send({
                message:"Compañia eliminada con exito"
            });
        }
    } catch(error) {
        res.status(500).json({
            message: "Error -> No se puede eliminar el detalle de la orden con el ID = " + req.params.id,
            error: error.message
        });
    }
}

async function changeInvoiceState(req, res){
   
    let purchaseId = req.params.id; 
    console.log(purchaseId);
    const {estado,PurchaseOrderId} = req.body;  //
   console.log(PurchaseOrderId);
    try{
        let purchase = await PurchaseInvoice.findByPk(purchaseId,{
            attributes: ['ID_PurchaseInvoice','ID_PurchaseOrder']});
       
        if(!purchase){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el cliente con ID = " + purchaseId,
                error: "404"
            });
        } else {    
            
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = { 
               
                State:estado          
            }
           
            let result = await purchase.update(updatedObject,
                { 
                returning: true,                
                where: {ID_PurchaseInvoice  : purchaseId},
                attributes:['ID_PurchaseInvoice' ]
                }
            ).then(async result =>{
                if(PurchaseOrderId!==null){
                    console.log("ORDEN");
                    let purchaseorder = await PurchaseOrder.findByPk(PurchaseOrderId,{
                       attributes: ['ID_PurchaseOrder']});
                       console.log(purchaseorder);
                   let updateOrden = { 
                  
                       State:'Cerrada'          
                   }
                  
                   let resultorden = await purchaseorder.update(updateOrden,
                       { 
                       returning: true,                
                       where: {ID_PurchaseOrder  : PurchaseOrderId},
                       attributes:['ID_PurchaseOrder' ]
                       }
                   );
                   console.log(resultorden);
                }
            });


             if(PurchaseOrder!==null){
                 console.log("ORDEN");
                 let purchaseorder = await PurchaseOrder.findByPk(PurchaseOrder,{
                    attributes: ['ID_PurchaseOrder']});
                    console.log(purchaseorder);
                let updateOrden = { 
               
                    State:'Cerrada'          
                }
               
                let resultorden = await purchaseorder.update(updateOrden,
                    { 
                    returning: true,                
                    where: {ID_PurchaseOrder  : PurchaseOrder},
                    attributes:['ID_PurchaseOrder' ]
                    }
                );
                console.log(resultorden);
             }
        
            // retornamos el resultado al cliente
            if(!result) {
                res.status(500).json({
                    message: "Error -> No se puede actualizar el usuario con ID = " + req.params.id,
                    error: "No se puede actualizar",
                });
            }

            res.status(200).json(result);
        }
    } catch(error){
        res.status(500).json({
            message: "Error -> No se puede actualizar el usuario con ID = " + req.params.id,
            error: error.message
        });
    }
}
//no recibidas
function getSuppliersInvoicesPendientes(req, res){
    let userId = req.params.id; 
    let companyId = req.params.company;
    let antCod=0;
    
    try{
        PurchaseInvoice.findAll({    
             include: [
            {
                    model: Supplier,
                    attributes: ['ID_Supplier','Name'],
                    where: {ID_Company:companyId, },
                    on:{
                   
                        ID_Supplier: sequelize.where(sequelize.col("ec_purchaseinvoice.ID_Supplier"), "=", sequelize.col("crm_suppliers.ID_Supplier")),
                     
                     }
                }]
                 
            ,
            where: {ID_User:userId,Recibida:false},
           
          })
        .then(invoices => {
            res.status(200).send({invoices});
            
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

function getSuppliersInvoicesNoPagada(req, res){
    let userId = req.params.id; 
    let companyId = req.params.company;
    let antCod=0;
    console.log(userId);
    console.log(companyId);
    try{
        PurchaseInvoice.findAll({    
             include: [
            {
                    model: Supplier,
                    attributes: ['ID_Supplier','Name'],
                    where: {ID_Company:companyId},
                    on:{
                   
                        ID_Supplier: sequelize.where(sequelize.col("ec_purchaseinvoice.ID_Supplier"), "=", sequelize.col("crm_suppliers.ID_Supplier")),
                    
                     }
                }
            ]  
            ,
            where: {ID_User:userId,
            Pagada:false},
           
          })
        .then(invoices => {
            res.status(200).send({invoices});
            
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


function getInfoInvoice(req, res){
    let userId = req.params.id; 
    let invoiceid = req.params.invoice;
    let companyId = req.params.company
    let antCod=0;
    
    try{
        PurchaseInvoice.findAll({    
             include: [
            {
                    model: Supplier,
                    attributes: ['ID_Supplier','Name'],
                    where: {ID_Company:companyId},
                    on:{
                   
                        ID_Supplier: sequelize.where(sequelize.col("ec_purchaseinvoice.ID_Supplier"), "=", sequelize.col("crm_suppliers.ID_Supplier")),
                     
                     }
                }]
                 
            ,
            where: {ID_User:userId, ID_PurchaseInvoice:invoiceid},
           
          })
        .then(invoices => {
            res.status(200).send({invoices});
            
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
    getInfoInvoice
}