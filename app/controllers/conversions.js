const conversion= require('../models/conversion.model');
const conversionDetails= require('../models/conversiondetail.model');
const bodega= require('../models/bodega.model');
const inventory= require('../models/inventory.model');
const inventoryTraceability= require('../models/inventorytraceability.model');
const MovementTypes = require('../models/movementtype.model');
const productEntry = require('../models/productEntries.model');
const productEntryDetails = require('../models/invoiceEntriesDetails.model');
const supplier = require('../models/supplier.model');

async function createConversion(req, res){
    const Conversion = new conversion();

    const {User, Product, Company,productos, Quantity} = req.body
    let now= new Date();
    let creacion=now.toISOString().substring(0, 10);
    let codigo=0;
    let detalles=[];
    let codigoConversion=await conversion.findOne().populate({path: 'User' , model: 'User', match:{Company:Company}})
    .sort({Codigo:-1})
    .then(function(doc){
            if(doc){
                    if(doc.Codigo!==null){
                return(doc.Codigo)
            }
        }
    });
    
    if(!codigoConversion){
        codigo =1;
    }else {codigo=codigoConversion+1}
    Conversion.User= User
    Conversion.Receta= Product;
    Conversion.CreationDate= creacion;
    Conversion.Codigo=codigo;
    Conversion.State="Creada";
    Conversion.Quantity=Quantity;
   

    let exist=await conversion.findOne({Receta: Product}).then(result =>{
        if(result){
            return result.Receta
        }
        else{ return null}
    });
    console.log(exist);
    if(exist){
        
       res.status(500).send({message: "Ya existe conversión"});
    }else{
        Conversion.save((err, ConversionStored)=>{
            if(err){
                res.status(500).send({message: err});
            }else{
                if(!ConversionStored){
                    res.status(500).send({message: "Error"});
                }else{
                    let conversionId=ConversionStored._id;
                    productos.map(item=>{
                        detalles.push({
                            Name: item.Name,
                            Codigo: item.Codigo, 
                            Measure: item.Measure,
                            Product: item.RecipeProduct,
                            Utilizar: parseFloat(item.Utilizar), 
                            Quantity: parseFloat(item.Quantity),
                            Conversion: conversionId
                             // autopopulate: true,
                        })
                    })
                    if(detalles.length>0){
                         conversionDetails.insertMany(detalles)
                        .then(function (detalles) {})
                    }
                    res.status(200).send({Conversion: ConversionStored})
                }
            }
        });
       
    }
 
}


function getConversion(req, res){
    // Buscamos informacion para llenar el modelo de 
    let id=req.params.id;
    let companyId=req.params.company;
    try{
        conversion.find({User:id}).populate({path: 'User' , model: 'User', match:{Company:companyId}})
        .populate({path: 'Receta', model: 'Product', populate:{path: 'Measure', model: 'Measure'}})
        .then(Conversion => {
            res.status(200).send({Conversion});
          
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

async function getConversionDetails(req, res){
    var ObjectID = require('mongodb').ObjectID
    const { id,company}=req.params;
     console.log(id);
    conversionDetails.aggregate([
        {  $match: {Conversion:ObjectID(id),}},
    
        {
            $lookup: {
                from:"inventories",
               
                let:{productId:"$Product" },
                pipeline: [
                    { $match:
                        { $expr:
                            { $and:
                                [
                                    { $eq: [ "$Product",  "$$productId" ] },
                                
                                 
                                ]
                             }
                           
                               
                               
                            }
                        },
                        {
                            $lookup: {
                                from:"bodegas",
                                let: {idinventario:"$Bodega"},
                                pipeline: [
                                    { $match:
                                        { $expr:
                                            { $and:
                                                [
                                                    { $eq: [ "$_id",  "$$idinventario" ] },
                                                    { $eq: [ "$Name",  "Principal" ] },
                                                
                                                 
                                                ]
                                             }
                                           
                                            }
                                        },
                                    ],
                                    as:"bodega"
                            }
                        },
                        {
                            $lookup: {
                                from:"products",
                                let: {idproduct:"$Product"},
                                pipeline: [
                                    { $match:
                                        { $expr:
                                            { $and:
                                                [
                                                    { $eq: [ "$_id",  "$$productId" ] },
                                                    
                                                 
                                                ]
                                             }
                                           
                                            }
                                        },
                                    ],
                                    as:"infoProducto"
                            }
                        },
                   

                ],
                as:"product",
                
            },
            
              
            
        }, 
       
        
    ])
    .then(recipe => {
        res.status(200).send({recipe});
      console.log(recipe);
    })
}

function getConversionInfo(req, res){
    // Buscamos informacion para llenar el modelo de 
    let id=req.params.id;
    try{
        conversion.find({_id:id})
        .populate({path: 'Receta', model: 'Product', populate:{path: 'Measure', model: 'Measure'}})
        .then(Conversion => {
            res.status(200).send({Conversion});
          
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

function ConversionInProcess(req, res){
    const {productConversion}= req.body;
    const {id}= req.params;
    let now= new Date();
    let creacion=now.toISOString().substring(0, 10);
    conversion.findByIdAndUpdate({_id:id},{State:"EnProceso"},async (err,update)=>{
        if(err){
            res.status(500).send({ message: "Error del servidor." });
        }
        if(update){
            conversionDetails.find({Conversion:id}).populate({path: 'Product', model: 'Product'})
            .then(async detalles=>{
                if(!detalles){
                    res.status(500).send({ message: "No hay detalles." });
                }
                else{
                    detalles.map(async item=>{
                        console.log("detalles", productConversion);
                        let bodegaPrincipal=await bodega.findOne({Name:'Principal', Company:productConversion.User.Company},['_id'])
                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                        
                        let bodegaReproceso=await bodega.findOne({Name:'Reproceso', Company:productConversion.User.Company},['_id'])
                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                        
                        let inventarioPrincipal=await inventory.findOne({Product:item.Product, Bodega:bodegaPrincipal._id},['Stock','Product'])
                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

                        let inventarioReproceso=await inventory.findOne({Product:item.Product, Bodega:bodegaReproceso._id},['Stock','Product'])
                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                        
                        let movementId=await MovementTypes.findOne({Name:'conversion'},['_id'])
                             .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

                        console.log("EN INVENTARIO PRINCIPAL",inventarioPrincipal.Stock);
                        console.log("EN INVENTARIO Reproceso",inventarioReproceso);
                        console.log(item.Utilizar);

                        if(parseFloat(item.Utilizar) <= parseFloat(inventarioPrincipal.Stock)){
                            console.log("ENTRO A UPDATE");
                            inventory.findByIdAndUpdate({_id:inventarioPrincipal._id},{
                                Stock:parseFloat((inventarioPrincipal.Stock - parseFloat(item.Utilizar)) ),
                            }).then(result=> console.log(result))
                            .catch(err => {console.log(err);});

                            inventory.findByIdAndUpdate({_id:inventarioReproceso._id},{
                                Stock:parseFloat((inventarioReproceso.Stock + parseFloat(item.Utilizar)) ),
                            }).then(result=> console.log(result))
                            .catch(err => {console.log(err);});

                            //registro de movimiento
                            const inventorytraceability= new inventoryTraceability();
                            inventorytraceability.Quantity=item.Utilizar;
                            inventorytraceability.Product=item.Product;
                            inventorytraceability.WarehouseDestination=inventarioReproceso._id; //destino
                            inventorytraceability.MovementType=movementId._id;
                            inventorytraceability.MovDate=creacion;
                            inventorytraceability.WarehouseOrigin=inventarioPrincipal._id; //origen
                            inventorytraceability.User=productConversion.User._id;
                            inventorytraceability.Company=productConversion.User.Company;
                            inventorytraceability.DocumentId=productConversion._id;
                            inventorytraceability.ProductDestiny=productConversion.Receta._id;
                            inventorytraceability.Cost=parseFloat(item.Utilizar)*parseFloat(item.Product.BuyPrice);
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
                                    }}})
                        }
                    })
                    
                }
            })

            res.status(200).send({Entry: update});

        }
    })

}

function ConversionCompleted(req, res){
    const {productConversion}= req.body;
    const {id}= req.params;
    const entryData=new productEntry();

    let now= new Date();
    let creacion=now.toISOString().substring(0, 10);
    let codigoEntradas=0;
    
    conversion.findByIdAndUpdate({_id:id},{State:"Terminada"},async (err,update)=>{
        if(err){
            res.status(500).send({ message: "Error del servidor." });
        }
        if(update){

            conversionDetails.find({Conversion:id}).populate({path: 'Product', model: 'Product'})
            .then(async detalles=>{
                if(!detalles){
                    res.status(500).send({ message: "No hay detalles." });
                }
                else{
                    detalles.map(async item=>{
                        console.log("detalles", productConversion);
                        let bodegaPrincipal=await bodega.findOne({Name:'Principal', Company:productConversion.User.Company},['_id'])
                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                        
                        let bodegaReproceso=await bodega.findOne({Name:'Reproceso', Company:productConversion.User.Company},['_id'])
                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                        
                        let inventarioPrincipal=await inventory.findOne({Product:productConversion.Receta._id, Bodega:bodegaPrincipal._id},['Stock','Product'])
                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

                        let inventarioReproceso=await inventory.findOne({Product:item.Product, Bodega:bodegaReproceso._id},['Stock','Product'])
                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                        
                        let movementId=await MovementTypes.findOne({Name:'salida'},['_id'])
                             .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});

                        console.log("EN INVENTARIO PRINCIPAL",inventarioPrincipal.Stock);
                        console.log("EN INVENTARIO Reproceso",inventarioReproceso);
                        console.log(item.Utilizar);

                        if(parseFloat(item.Utilizar) <= parseFloat(inventarioReproceso.Stock)){
                            console.log("ENTRO A UPDATE");


                            inventory.findByIdAndUpdate({_id:inventarioReproceso._id},{
                                Stock:parseFloat((inventarioReproceso.Stock - parseFloat(item.Utilizar)) ),
                            }).then(result=> {})
                            .catch(err => {console.log(err);});

                            //registro de movimiento
                            const inventorytraceability= new inventoryTraceability();
                            inventorytraceability.Quantity=item.Utilizar;
                            inventorytraceability.Product=item.Product;
                            inventorytraceability.WarehouseDestination=inventarioPrincipal._id; //destino
                            inventorytraceability.MovementType=movementId._id;
                            inventorytraceability.MovDate=creacion;
                            inventorytraceability.WarehouseOrigin=inventarioReproceso._id; //origen
                            inventorytraceability.User=productConversion.User._id;
                            inventorytraceability.Company=productConversion.User.Company;
                            inventorytraceability.DocumentId=productConversion._id;
                            inventorytraceability.ProductDestiny=productConversion.Receta._id;
                            inventorytraceability.Cost=parseFloat(item.Utilizar)*parseFloat(item.Product.BuyPrice);
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
                                       
                                    }}})
                        }
                    })
                    
                }
            });

            conversion.findOne({_id:id})
            .populate({path:'Receta', model: 'Product',populate:{path: 'Supplier', model: 'Supplier'}, populate:{path: 'Measure', model: 'Measure'}})
            .then(async result =>{
                if(result){
                    let codEntry=await productEntry.findOne({Company:result.Receta.Company}).sort({CodEntry:-1})
                    .then(function(doc){
                            if(doc){
                                    if(doc.CodEntry!==null){
                                return(doc.CodEntry)
                            }
                        }  
                    });
                    let bodegaPrincipal=await bodega.findOne({Name:'Principal', Company:productConversion.User.Company},['_id'])
                    .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                     let inventarioPrincipal=await inventory.findOne({Product:productConversion.Receta._id, Bodega:bodegaPrincipal._id},['Stock','Product'])
                      .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                     
                      let proveedor=await supplier.findOne({_id:result.Receta.Supplier},['Name'])
                      .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                    if(!codEntry){
                    codigoEntradas =1;
                    }else {codigoEntradas=codEntry+1}
                    console.log("el codigo", codigoEntradas);
                    console.log("CONVERSION INFO", result);
                    entryData.EntryDate=creacion;
                    entryData.User=productConversion.User._id;
                    entryData.Comments="Entrada por conversion de recetas"+result.Receta.Name;
                    entryData.State=true;
                    entryData.CodEntry=codigoEntradas;
                    entryData.Company=result.Receta.Company;
                    entryData.PurchaseInvoice=null;
                    entryData.Supplier=proveedor.Name;
                
                    entryData.InvoiceNumber='';

                    entryData.save(async (err, entryStored)=>{
                        if(err){
                            res.status(500).send({message: "Error del Servidor."});

                        }else {
                            if(!entryStored){
                                res.status(404).send({message: "No se agrego registro."});

                            }
                            else{
                                console.log("entrada",entryStored);
                                let entryid=entryStored._id;
                                const details=new productEntryDetails();
                                details.PurchaseInvoiceDetail=null;
                                details.ProductEntry=entryid;
                                details.Quantity=result.Quantity;
                                details.Inventory=inventarioPrincipal._id;
                                details.ProductName=result.Receta.Name;
                                details.Price=result.Receta.BuyPrice;
                                details.Measure=result.Receta.Measure.Name;
                                details.CodProduct=result.Receta.codproducts;
                                details.Product=result.Receta._id;

                                details.save(async (err, entryDetailStored)=>{
                                    if(err){
                                        res.status(500).send({message: "Error del Servidor."});
            
                                    }else {
                                        if(!entryDetailStored){
                                            res.status(404).send({message: "No se agrego registro."});
            
                                        }
                                        else{
                                             console.log("detalles ingresados",entryDetailStored );
                                             let invenrotyExist=await inventory.findOne({_id:entryDetailStored.Inventory},'Stock')
                                             .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                             
                                         
                                             let cantidad=0.0;
                                             let ingresos=0.0;
                                             let productRestante=0.0;
                                             cantidad=parseFloat(invenrotyExist.Stock) + parseFloat(entryDetailStored.Quantity);
                                            
                                          
                                             let updateIngresados={};
                                             console.log('inventario',entryDetailStored.Inventory);
                                             console.log('cantidad',cantidad);
                                             
                                            
                                         
                                          
             
                                             //actualizando el stock
                                             inventory.findByIdAndUpdate({_id:entryDetailStored.Inventory},{
                                                 Stock:parseFloat(cantidad),
                                             })
                                             .catch(err => {console.log(err);});
                                             //contando 
                                            
                                             console.log("movimiento de inventario");
                                            
                                             let movementId=await MovementTypes.findOne({Name:'ingreso'},['_id'])
                                                 .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                                                 const inventorytraceability= new inventoryTraceability();

                                                 inventorytraceability.Quantity=entryDetailStored.Quantity;
                                                 inventorytraceability.Product=entryDetailStored.Product;
                                                 inventorytraceability.WarehouseDestination=entryDetailStored.Inventory; //destino
                                                 inventorytraceability.MovementType=movementId._id;
                                                 inventorytraceability.MovDate=creacion;
                                                 inventorytraceability.WarehouseOrigin=null; //origen
                                                 inventorytraceability.User=productConversion.User._id;
                                                 inventorytraceability.Company=productConversion.User.Company;
                                                 inventorytraceability.DocumentId=entryid;
                                                 inventorytraceability.ProductDestiny=null;
                                                 inventorytraceability.Cost=parseFloat(entryDetailStored.Quantity)*parseFloat(entryDetailStored.Price);
                                                 inventorytraceability.save((err, traceabilityStored)=>{
                                                     if(err){
                                                           console.log(err);
                                                     }else {
                                                         if(!traceabilityStored){
                                                             // res.status(500).send({message: "Error al crear el nuevo usuario."});
                                                             console.log(traceabilityStored);
                                                         }
                                                         else{
                                                            console.log(traceabilityStored);
                                                             //   res.status(200).send({orden: traceabilityStored});
                                                         }
                                                     }
                                                  });
                                        
                                        }
                                    }
                                })
                            }
                        }
                    })


             }
        })
        res.status(200).send({Entry: update});
       
    } 
})



}

function ConversionAnular(req, res){
    const {productConversion}= req.body;
    const {id}= req.params;
    let now= new Date();
    let creacion=now.toISOString().substring(0, 10);
    console.log("CONVERSION",productConversion);
    conversion.findByIdAndUpdate({_id:id},{State:"Anulada"},async (err,update)=>{
        if(err){
            res.status(500).send({ message: "Error del servidor." });
        }
        if(update){
            conversionDetails.find({Conversion:id}).populate({path: 'Product', model: 'Product'})
            .then(async detalles=>{
                if(!detalles){
                    res.status(500).send({ message: "No hay detalles." });
                }
                else{
                    if(productConversion.State==="Creada"){
                        console.log();
                        res.status(200).send({Entry: update});
                    }else{
                        detalles.map(async item=>{
                            console.log("detalles", productConversion);
                            let bodegaPrincipal=await bodega.findOne({Name:'Principal', Company:productConversion.User.Company},['_id'])
                            .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                            
                            let bodegaReproceso=await bodega.findOne({Name:'Reproceso', Company:productConversion.User.Company},['_id'])
                            .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                            
                            let inventarioPrincipal=await inventory.findOne({Product:item.Product, Bodega:bodegaPrincipal._id},['Stock','Product'])
                            .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
    
                            let inventarioReproceso=await inventory.findOne({Product:item.Product, Bodega:bodegaReproceso._id},['Stock','Product'])
                            .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                            
                            let movementId=await MovementTypes.findOne({Name:'reversion'},['_id'])
                                 .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
    
                            console.log("EN INVENTARIO PRINCIPAL",inventarioPrincipal.Stock);
                            console.log("EN INVENTARIO Reproceso",inventarioReproceso);
                            console.log(item.Utilizar);
    
                            if(parseFloat(inventarioPrincipal.Stock) <= parseFloat(item.Utilizar)){
                                console.log("ENTRO A UPDATE");
                                inventory.findByIdAndUpdate({_id:inventarioPrincipal._id},{
                                    Stock:parseFloat((inventarioPrincipal.Stock + parseFloat(item.Utilizar)) ),
                                }).then(result=> console.log(result))
                                .catch(err => {console.log(err);});
    
                                inventory.findByIdAndUpdate({_id:inventarioReproceso._id},{
                                    Stock:parseFloat((inventarioReproceso.Stock - parseFloat(item.Utilizar)) ),
                                }).then(result=> console.log(result))
                                .catch(err => {console.log(err);});
    
                                //registro de movimiento
                                const inventorytraceability= new inventoryTraceability();
                                inventorytraceability.Quantity=item.Utilizar;
                                inventorytraceability.Product=item.Product;
                                inventorytraceability.WarehouseDestination=inventarioPrincipal._id; //destino
                                inventorytraceability.MovementType=movementId._id;
                                inventorytraceability.MovDate=creacion;
                                inventorytraceability.WarehouseOrigin=inventarioReproceso._id; //origen
                                inventorytraceability.User=productConversion.User._id;
                                inventorytraceability.Company=productConversion.User.Company;
                                inventorytraceability.DocumentId=productConversion._id;
                                inventorytraceability.ProductDestiny=productConversion.Receta._id;
                                inventorytraceability.Cost=parseFloat(item.Utilizar)*parseFloat(item.Product.BuyPrice);
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
                                        }}})
                            }else{
                                return
                            }
                        })
                        res.status(200).send({Entry: update});
                    }
                    
                    
                }
            })

           
        }
    })

}

module.exports={
    getConversion,
    createConversion,
    getConversionDetails,
    getConversionInfo,
    ConversionInProcess,
    ConversionCompleted,
    ConversionAnular
    
}