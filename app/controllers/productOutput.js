const productOutput = require("../models/productoutput.model");
const productOutputDetail = require("../models/productoutputdetail.model");
const company = require("../models/company.model");
const inventory=require("../models/inventory.model");
const inventoryTraceability = require("../models/inventorytraceability.model");
const MovementTypes = require("../models/movementtype.model");
const saleOrderInvoice = require("../models/saleorderinvoice.model");
const saleOrderInvoiceDetails = require("../models/saleorderinvoicedetails.model");

function getProductOutput(req, res){

    const { id } = req.params;
    var ObjectID = require('mongodb').ObjectID;
 //    productEntry.find({User:id}).populate({path: 'Company', model: 'Company'}).populate('members')
       productOutput.aggregate([
        {  $match: {User:ObjectID(id)}},
         {
             $lookup: {
                 from:"productoutputdetails",
                 let: { customerId: "$_id" },
                 pipeline: [
                    { $match:
                        { $expr:
                            { 
                                 $eq: [ "$ProductOutput",  "$$customerId" ] ,
                                
                               
                            }
                         }
                    },
                   
                   
                 ],
                 as:"detalles",
                 
             }
         }, 
         {
            $lookup: {
                from:"customers",
                localField:"Customer",
                foreignField:"_id",
  
                as:"customer",
                
            }
        },
        
 
     ]).sort({CodOutput:-1})
     .then(output =>{
         res.status(200).send({output})
     })
 }

async function createProductOutput(req, res) {
    const ProductOuput= new productOutput();
    const salida=req.body.entries;
        let now= new Date();
        let fecha=now.getTime();
        let creacion=now.toISOString().substring(0, 10);
        let codigo=0;
        const {User,SaleInvoiceId,Company,Customer,InvoiceNumber,Comments}=req.body;
        let outputDataDetail=[];
    
            //obteniendo informacion de la compañia para validar
    let companyParams=await company.findById(Company) //esta variable la mando a llamar luego que se ingreso factura
    .then(params => {
        if(!params){
            res.status(404).send({message:"No hay "});
        }else{
            return(params)
        }
    });
    //para generar el correctivo del ingreso en caso de que sea requerido
    let codOutout=await productOutput.findOne({Company:Company}).sort({CodOutput:-1})
    .then(function(doc){
            if(doc){
                    if(doc.CodOutput!==null){
                return(doc.CodOutput)
            }
        }  
    });

        if(!codOutout){
        codigo =1;
    }else {codigo=codOutout+1}
        let salidaId=null;
        ProductOuput.EntryDate=creacion;
        ProductOuput.User=User;
        ProductOuput.Comments=Comments;
        ProductOuput.State=true;
        ProductOuput.CodOutput=codigo;
        ProductOuput.Company=Company;
        ProductOuput.SaleOrderInvoice=SaleInvoiceId!==null?SaleInvoiceId:null;
        ProductOuput.Customer=Customer;
        ProductOuput.InvoiceNumber=InvoiceNumber!==null?InvoiceNumber:null;
        ProductOuput.save((err, outputStored)=>{
            if(err){
                console.log(err);
    
            }else {
                if(!outputStored){
                    console.log('no se ingreso entrada');
    
                }
                else{
                    let salidaId=outputStored._id;
                  
                    salida.map(item =>{
                        outputDataDetail.push({
                            SaleInvoiceDetail:item.SaleInvoiceIdDetail,
                            ProductOutput:salidaId,
                            Quantity:item.Quantity,
                            Inventory:item.Inventory,
                            ProductName:item.Nombre,
                            Price:item.Price,
                            Measure:item.Measure,
                            CodProduct:item.codigo,
                            Product:item.ID_Products
                             });
                    });
                    productOutputDetail.insertMany(outputDataDetail) .then(async function (outputStored) {
                        console.log("INSERTANDO DETALLES");
                        console.log(outputStored);
                            if(outputStored){
                                outputStored.map(async item=>{
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

                        //cambios de cantidad ingresada 
                        let proIngresados=await saleOrderInvoiceDetails.findOne({_id:item.SaleInvoiceDetail},'Entregados')
                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                        let quantityInvoice=await saleOrderInvoiceDetails.findOne({_id:item.SaleInvoiceDetail},'Quantity')
                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                        
                        let cantidad=0.0;
                        let ingresos=0.0;
                        let productRestante=0.0;
                        let ingresoUpdate=0.0;
                        
                        console.log("PRODUCTOS ENTREGADOS",proIngresados);
                        console.log("PRODUCTOS de factura",quantityInvoice);
                        ingresos=parseFloat(proIngresados.Entregados) + parseFloat(item.Quantity);
                        console.log("a entregar",ingresos);
                              //cambiando estados e ingresos de  detalle factur
                              if(proIngresados!==null){
                                if(parseFloat(ingresos)===parseFloat(quantityInvoice.Quantity)){
                                    console.log('COMPLETADO INGRESO');
                                   await saleOrderInvoiceDetails.updateMany({_id:item.SaleInvoiceDetail},{
                                        Entregados:ingresos,
                                        State:true
                                    })
                                    .catch(err => {console.log(err);})
                                    
                                }
                                 else{
                                console.log('NO COMPLETADO INGRESO');
    
                                await saleOrderInvoiceDetails.updateMany({_id:item.SaleInvoiceDetail},{
                                    Entregados:ingresos,
                                    State:false
                                }).catch(err => {console.log(err);})
                                
                               }
                               actualizado=true;
                            } 

                        if(parseFloat(infoInventary.Stock)>=parseFloat(item.Quantity) && !companyParams.AvailableReservation){
                                //descontando cantidad que se reservara
                                inventory.findByIdAndUpdate({_id:item.Inventory},{
                                    Stock:parseFloat(infoInventary.Stock - item.Quantity),
                                }).then(async function(update){
                                    if(!update){

                                    }
                                    else{
                                        let completados=await  saleOrderInvoiceDetails.countDocuments({State: true, SaleOrderInvoice:SaleInvoiceId} ).then(c => {
                                            return c
                                            });
                                        
                                            let registrados=await saleOrderInvoiceDetails.countDocuments({SaleOrderInvoice:SaleInvoiceId }, function (err, count) {
                                            console.log(count); return (count)
                                            });
                                            console.log('PURCHASE INVOICE',SaleInvoiceId);
                                            console.log('completados',completados);
                                            console.log('todos',registrados);
                                            //validando si todos los productos estan ingresados
                                            if(parseInt(completados)===parseInt(registrados)){
                                            console.log("cambiando");
                                            saleOrderInvoice.findByIdAndUpdate({_id:SaleInvoiceId},{
                                                Entregada:true,
                                            })
                                            .catch(err => {console.log(err);}); 
                                            
                                        }
                                            const inventorytraceability= new inventoryTraceability();
                                            inventorytraceability.Quantity=item.Quantity;
                                            inventorytraceability.Product=item.Product;
                                            inventorytraceability.WarehouseDestination=null; //destino
                                            inventorytraceability.MovementType=movementId._id;
                                            inventorytraceability.MovDate=creacion;
                                            inventorytraceability.WarehouseOrigin=item.Inventory; //origen
                                            inventorytraceability.User=User;
                                            inventorytraceability.Company=Company;
                                            inventorytraceability.DocumentId=salidaId;
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
                                }).then(async function(update){
                                    if(!update){
                                        res.status(500).send({message: "No se actualizo inventario"});
                                    }else{
                                
                                       
                                                    let completados=await  saleOrderInvoiceDetails.countDocuments({State: true, SaleOrderInvoice:SaleInvoiceId} ).then(c => {
                                                        return c
                                                      });
                                                   
                                                      let registrados=await saleOrderInvoiceDetails.countDocuments({SaleOrderInvoice:SaleInvoiceId }, function (err, count) {
                                                       console.log(count); return (count)
                                                      });
                                                      console.log('PURCHASE INVOICE',SaleInvoiceId);
                                                      console.log('completados',completados);
                                                      console.log('todos',registrados);
                                                      //validando si todos los productos estan ingresados
                                                      if(parseInt(completados)===parseInt(registrados)){
                                                        console.log("cambiando");
                                                        saleOrderInvoice.findByIdAndUpdate({_id:SaleInvoiceId},{
                                                            Entregada:true,
                                                        })
                                                        .catch(err => {console.log(err);}); 
                                                      
                                                    }

                                                    //transaccion
                                                    const inventorytraceability= new inventoryTraceability();
                                                    inventorytraceability.Quantity=item.Quantity;
                                                    inventorytraceability.Product=item.Product;
                                                    inventorytraceability.WarehouseDestination=null; //destino
                                                    inventorytraceability.MovementType=movementId._id;
                                                    inventorytraceability.MovDate=creacion;
                                                    inventorytraceability.WarehouseOrigin=productreserved._id; //origen
                                                    inventorytraceability.User=User;
                                                    inventorytraceability.Company=Company;
                                                    inventorytraceability.DocumentId=salidaId;
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
                                
                                })
                                .catch(err => {console.log(err);});    
                                
                        }
                        else{

                            res.status(500).send({ message: "Verificar Inventario" });
                            
                        }

                        })
                            }
                    })
                    salida.map(async item=>{
                                                
                     
       
        
                    })
                    


                }
            }
            res.status(200).send({salida:outputStored })  

        });
      
       

}

async function createProductOutputsinInvoice(req, res) {
    const ProductOuput= new productOutput();
    const salida=req.body.entries;
        let now= new Date();
        let fecha=now.getTime();
        let creacion=now.toISOString().substring(0, 10);
        let codigo=0;
        const {User,SaleInvoiceId,Company,Customer,InvoiceNumber,Comments}=req.body;
        let outputDataDetail=[];
    
            //obteniendo informacion de la compañia para validar
    let companyParams=await company.findById(Company) //esta variable la mando a llamar luego que se ingreso factura
    .then(params => {
        if(!params){
            res.status(404).send({message:"No hay "});
        }else{
            return(params)
        }
    });
    //para generar el correctivo del ingreso en caso de que sea requerido
    let codOutout=await productOutput.findOne({Company:Company}).sort({CodOutput:-1})
    .then(function(doc){
            if(doc){
                    if(doc.CodOutput!==null){
                return(doc.CodOutput)
            }
        }  
    });

        if(!codOutout){
        codigo =1;
    }else {codigo=codOutout+1}
        let salidaId=null;
        ProductOuput.EntryDate=creacion;
        ProductOuput.User=User;
        ProductOuput.Comments=Comments;
        ProductOuput.State=true;
        ProductOuput.CodOutput=codigo;
        ProductOuput.Company=Company;
        ProductOuput.SaleOrderInvoice=SaleInvoiceId!==null?SaleInvoiceId:null;
        ProductOuput.Customer=Customer;
        ProductOuput.InvoiceNumber=InvoiceNumber!==null?InvoiceNumber:null;
        ProductOuput.save((err, outputStored)=>{
            if(err){
                console.log(err);
    
            }else {
                if(!outputStored){
                    console.log('no se ingreso entrada');
    
                }
                else{
                    let salidaId=outputStored._id;
                  
                    salida.map(item =>{
                        outputDataDetail.push({
                            SaleInvoiceDetail:null,
                            ProductOutput:salidaId,
                            Quantity:item.Quantity,
                            Inventory:item.Inventory,
                            ProductName:item.Name,
                            Price:item.Price,
                            Measure:item.Measures,
                            CodProduct:item.codproducts,
                            Product:item.ID_Products
                             });
                    });
                    productOutputDetail.insertMany(outputDataDetail) .then(async function (outputStored) {
                        console.log("INSERTANDO DETALLES");
                        console.log(outputStored);
                            if(outputStored){
                                outputStored.map(async item=>{
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

                        //cambios de cantidad ingresada 
                        let proIngresados=await saleOrderInvoiceDetails.findOne({_id:item.SaleInvoiceDetail},'Entregados')
                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                        let quantityInvoice=await saleOrderInvoiceDetails.findOne({_id:item.SaleInvoiceDetail},'Quantity')
                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                        
                        let cantidad=0.0;
                        let ingresos=0.0;
                        let productRestante=0.0;
                        let ingresoUpdate=0.0;
                        
                        console.log("PRODUCTOS ENTREGADOS",proIngresados);
                        console.log("PRODUCTOS de factura",quantityInvoice);
                       
                         

                        if(parseFloat(infoInventary.Stock)>=parseFloat(item.Quantity) && !companyParams.AvailableReservation){
                                //descontando cantidad que se reservara
                                inventory.findByIdAndUpdate({_id:item.Inventory},{
                                    Stock:parseFloat(infoInventary.Stock - item.Quantity),
                                }).then(async function(update){
                                    if(!update){

                                    }
                                    else{
                                       
                                            const inventorytraceability= new inventoryTraceability();
                                            inventorytraceability.Quantity=item.Quantity;
                                            inventorytraceability.Product=item.Product;
                                            inventorytraceability.WarehouseDestination=null; //destino
                                            inventorytraceability.MovementType=movementId._id;
                                            inventorytraceability.MovDate=creacion;
                                            inventorytraceability.WarehouseOrigin=item.Inventory; //origen
                                            inventorytraceability.User=User;
                                            inventorytraceability.Company=Company;
                                            inventorytraceability.DocumentId=salidaId;
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
                                }).then(async function(update){
                                    if(!update){
                                        res.status(500).send({message: "No se actualizo inventario"});
                                    }else{
                                
                                       
                                              

                                                    //transaccion
                                                    const inventorytraceability= new inventoryTraceability();
                                                    inventorytraceability.Quantity=item.Quantity;
                                                    inventorytraceability.Product=item.Product;
                                                    inventorytraceability.WarehouseDestination=null; //destino
                                                    inventorytraceability.MovementType=movementId._id;
                                                    inventorytraceability.MovDate=creacion;
                                                    inventorytraceability.WarehouseOrigin=productreserved._id; //origen
                                                    inventorytraceability.User=User;
                                                    inventorytraceability.Company=Company;
                                                    inventorytraceability.DocumentId=salidaId;
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
                                
                                })
                                .catch(err => {console.log(err);});    
                                
                        }
                        else{

                            res.status(500).send({ message: "Verificar Inventario" });
                            
                        }

                        })
                            }
                    })
                    salida.map(async item=>{
                                                
                     
       
        
                    })
                    


                }
            }
            res.status(200).send({salida:outputStored })  

        });
      
       

}


async function viewProductOutputDetails(req, res){
    let saleId = req.params.id;
    console.log("OBTENIENDO DETALLES");
    productOutputDetail.find({ProductOutput:saleId}).populate({path: 'Inventory', model: 'Inventory',
    populate:({path: 'Bodega', model: 'Bodega', match:{Name:'Principal'}}),
    populate:({path: 'Product',model:'Product',populate:{path: 'Measure',model:'Measure'}})})
    // .populate({path: 'ProductOutput', model: 'ProductOutput'})
    .then(details => {
        if(!details){
            res.status(404).send({message:"No hay "});
            
        }else{
            res.status(200).send({details})
            console.log(details);
        }
    });
}

async function anularOutput(req, res){
    let outputId=req.params.id;
    let Company=req.params.company;
    let now= new Date();
    let fecha=now.getTime();
    let creacion=now.toISOString().substring(0, 10); 
    console.log("bo",req.body);
    let User=req.body.id;
    let companyParams=await company.findById(Company) //esta variable la mando a llamar luego que se ingreso factura
    .then(params => {
        if(!params){
            res.status(404).send({message:"No hay "});
        }else{
            return(params)
        }
    });
    console.log(outputId);
    productOutput.findByIdAndUpdate({_id:outputId},{State:false},async (err,update)=>{
        if(err){
            res.status(500).send({ message: "Error del servidor." });
            console.log(err);
        }
        if(update){
            let saleOrderInvoiceId=update.SaleOrderInvoice;
        
            productOutputDetail.find({ProductOutput : outputId})
            .then(function (detalles){
               console.log("detallles");
              console.log(detalles);
                    detalles.map(async item =>{
                        //obteniendo stock de producto  (bodega principal)
                        let infoInventary=await inventory.findOne({_id:item.Inventory},['Stock','Product'])
                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                        console.log('EN STOCK:',infoInventary);

                        let productreserved=await inventory.findOne({Product:infoInventary.Product, _id: { $nin: infoInventary._id }},['Stock','Product'])
                        .populate({path: 'Bodega', model: 'Bodega', match:{Name:'Reserva'}})
                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                        
                        console.log(productreserved);

                        //obteniendo id del movimiento de tipo reserva
                        let movementId=await MovementTypes.findOne({Name:'reversion'},['_id'])
                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                    
                        let proIngresados=await saleOrderInvoiceDetails.findOne({_id:item.SaleInvoiceDetail},'Entregados')
                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                        let quantityInvoice=await saleOrderInvoiceDetails.findOne({_id:item.SaleInvoiceDetail},'Quantity')
                        .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                        
                        let cantidad=0.0;
                        let ingresos=0.0;
                        let productRestante=0.0;
                        let ingresoUpdate=0.0;
                        
                       
                        if(saleOrderInvoiceId!==null){
                            console.log("PRODUCTOS ENTREGADOS",proIngresados);
                            console.log("PRODUCTOS de factura",quantityInvoice);
                            ingresos=parseFloat(proIngresados.Entregados) + parseFloat(item.Quantity);
                            ingresoUpdate=parseFloat(proIngresados.Entregados -item.Quantity);
                            console.log("ACTUALIZAR LOS INGRESADOS",ingresoUpdate);
                            saleOrderInvoiceDetails.findByIdAndUpdate({_id:item.SaleInvoiceDetail},{
                                Entregados:parseFloat(ingresoUpdate),
                                State:false
                            })
                            .catch(err => {console.log(err);});
    
                            saleOrderInvoice.findByIdAndUpdate({_id:saleOrderInvoiceId},{
                                Entregada:false,
                            })
                            .catch(err => {console.log(err);});
                        }
                      
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
                                inventorytraceability.Company=Company;
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
                        console.log('BODEGA RESERVA');
                                            //descontando cantidad que se reservara
                            inventory.findByIdAndUpdate({_id:productreserved._id},{
                                Stock:parseFloat((productreserved.Stock + parseFloat(item.Quantity)) ),
                            }).then(result=> console.log(result))
                            .catch(err => {console.log(err);});

                            //stock de bodega de reserva
                            console.log(productreserved.Product);
                        
                            console.log('id del moviminto de reserva res', movementId);
                            //registro de movimiento
                            const inventorytraceability= new inventoryTraceability();
                            inventorytraceability.Quantity=item.Quantity;
                            inventorytraceability.Product=item.Product;
                            inventorytraceability.WarehouseDestination=productreserved._id; //destino
                            inventorytraceability.MovementType=movementId._id;
                            inventorytraceability.MovDate=creacion;
                            inventorytraceability.WarehouseOrigin=null; //origen
                            inventorytraceability.User=User;
                            inventorytraceability.Company=Company;
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
        }
    });
}

module.exports={
    createProductOutput,
    getProductOutput,
    viewProductOutputDetails,
    anularOutput,
    createProductOutputsinInvoice
    
}