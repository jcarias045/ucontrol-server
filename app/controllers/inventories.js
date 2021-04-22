const Inventory = require("../models/inventory.model");
const Product=require("../models/product.model");

function getInventory(req, res){
    const { id } = req.params;
    Inventory.find({Company:id}).populate({path: 'Bodega', model: 'Bodega', match:{Company: id}})
    .populate({path: 'Product', model: 'Product' ,
    populate:{path: 'Measure', model: 'Measure'},
    populate:{path: 'CatProduct', model: 'CatProduct'},
   })
     .then(inventory => {
         if(!inventory){
             res.status(404).send({message:"No hay "});
         }else{
             
             res.status(200).send({inventory})
         }
     });
}

function getInventories(req, res){
    const { id } = req.params;
    Inventory.aggregate([
        {$match:{ $expr:
            { $and:
               [
                 { Company: id},
               
                
               ]
            }
         }},
        
            {
                
                $lookup: {
                    from: "products",
                    let: { productid: "$Product" },
                    pipeline: [
                            { $match:
                            { $expr:
                                
                                     { $eq: [ "$_id",  "$$productid" ] }
                                    
                                }
                             },
                             {$lookup: {
                                from: "catproducts" ,
                                let: {catId: "$CatProduct"}, 
                                pipeline: [
                                    { $match:  { $expr:
                                
                                        { $eq: [ "$_id",  "$$catId" ] }
                                       
                                   } },
                                  
                                ],
                                as: "categoria"
                            }
                            },
                            {
                                $lookup: {
                                from: "brands" ,
                                let: {brandId: "$Brand"}, 
                                pipeline: [
                                    { $match:  { $expr:
                                
                                        { $eq: [ "$_id",  "$$brandId" ] }
                                       
                                   } },
                                  
                                ],
                                as: "marca"
                              }
                            },
                            {
                                $lookup: {
                                from: "measures" ,
                                let: {meedidaId: "$Measure"}, 
                                pipeline: [
                                    { $match:  { $expr:
                                
                                        { $eq: [ "$_id",  "$$meedidaId" ] }
                                       
                                   } },
                                  
                                ],
                                as: "medida"
                              }
                            }

                     ],
                    as:"producto",
                    
                },
                
            },
            {
                    
                $lookup: {
                    from: "bodegas",
                    let: { bodegaId: "$Bodega" },
                    pipeline: [
                        { $match:
                            { $expr:
                               
                                     { $eq: [ "$_id",  "$$bodegaId" ] },
                             }
                        },
                       
                       
                     ],
                    as:"bodega",
                    
                },
                
            },
            //   {
            //      $unwind:  "$invoice"
            //   },
              
        ])
     .then(inventory => {
         if(!inventory){
             res.status(404).send({message:"No hay "});
         }else{
             
             res.status(200).send({inventory})
         }
     });
}


function createInventory(req, res){
    let inventory = new Inventory();

    
    // Construimos el modelo del objeto inventory para enviarlo como body del request
    inventory.Product = req.body.Product;
    inventory.Stock=req.body.Stock;
    inventory.Description= req.body.Description; 
    inventory.Bodega=req.body.Bodega;
    inventory.Company=req.body.Company;  
    
    inventory.save((err, inventoryStored)=>{
        if(err){
            res.status(500).send({message: err});
        }
        else{
            if(!inventoryStored){
                res.status(500).send({message: "Error al registrar Inventario."});
               
            }
            else{
                res.status(200).send({inventory: inventoryStored})
            }
        }
    });
        
}

function getNameProduct(req,res){
    const { id,supplier } = req.params;
    console.log('productos nombre');
    console.log(id);
    console.log(supplier);
    if(supplier){
         Inventory.find().populate({path: 'Product', model: 'Product', match:{Company: id,Supplier:supplier}})
        .populate({path: 'Bodega', model: 'Bodega', match:{Name: "Principal"}})
        .then(inventories => {
            if(!inventories){
                res.status(404).send({message:"No hay "});
            }else{
                console.log(inventories);
                res.status(200).send({inventories})
            }
        });
}
    }
   

function getProductInfoxInventary(req,res){
    
    const { id} = req.params;
    
      
    console.log(id);
    
    Inventory.find({_id:id}).populate({path: 'Product', model: 'Product',populate:{path: 'Measure', model: 'Measure'}})
    .populate({path: 'Bodega', model: 'Bodega', match:{Name: "Principal"}})
    .then(inventories => {
        if(!inventories){
            res.status(404).send({message:"No hay "});
        }else{
            console.log(inventories);
            res.status(200).send({inventories})
        }
    });
    
    
}

module.exports={
    getInventory,
    createInventory,
    getInventories,
    // updateInventory,
    // deleteInventory,
    // getInventoriesID,
    getNameProduct,
    getProductInfoxInventary
};
// const db = require('../config/db.config.js');
// const { Op } = require("sequelize");
// const sequelize = require('sequelize');
// const { Supplier } = require('../config/db.config.js');

// const Inventory = db.Inventory;
// const Product = db.Product;
// const Company = db.Company;
// const Measure = db.Measure;
// const Bodega = db.Bodega;
// const Brand = db.Brand;


// function getInventories(req, res){
    
//     let companyId = req.params.id;
//     try{
//         Inventory.findAll(
//             {include: [
//                 {
//                     model:Product,
//                     attributes: ['ID_Products','Name','codproducts','ID_Measure','ID_Supplier', 'ID_Brand'],
//                     include:[
//                         {
//                             model:Brand,
//                             attributes: ['ID_Brand','Name']
//                         },
//                         {
//                             model: Supplier,
//                             attributes:['ID_Supplier','Name','codsupplier']
//                         },
//                         {
//                             model: Measure,
//                             attributes:['ID_Measure','Name']
//                         }
//                     ],
//                     on:{
//                         ID_Products: sequelize.where(sequelize.col("ec_inventory.ID_Products"),"=",sequelize.col("crm_product.ID_Products")),
//                     }
//                 },
//                 {
//                     model: Bodega,
//                     attributes: ['ID_Bodega','Name'],
//                     on:{
//                         ID_Bodega: sequelize.where(sequelize.col("ec_inventory.ID_Bodega"),"=", sequelize.col("crm_bodega.ID_Bodega")),
//                     }
//                 },
//                 {
//                     model: Company,
//                     attributes: ['ID_Company','Name','ShortName'],
//                     on:{
//                         ID_Company: sequelize.where(sequelize.col("ec_inventory.ID_Company"),"=", sequelize.col("sys_company.ID_Company")),
//                     }
//                 }
//             ],
//             where: {ID_Company: companyId}
//             })
//         .then(inventories => {
//             res.status(200).json(inventories);
          
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

// function createInventory(req, res){
//     let inventory = {};

//     try{
//         // Construimos el modelo del objeto inventory para enviarlo como body del request
//         inventory.ID_Products = req.body.ID_Products;
//         inventory.Stock=req.body.Stock;
//         inventory.Description= req.body.Description; 
//         inventory.ID_Bodega=req.body.ID_Bodega;
//         inventory.ID_Company=req.body.ID_Company;   
//         // Save to MySQL database
//         console.log(inventory);
//        Inventory.create(inventory)
//       .then(result => {    
//         res.status(200).json(result);
    
//       });  
//     }catch(error){
//         res.status(500).json({
//             message: "Fail!",
//             error: error.message
//         });
//     }
// }

// async function updateInventory(req, res){
   
//     let inventoryID = req.params.id; 
//     console.log(inventoryID); 

//     const { ID_Products,Stock,Description,ID_Bodega,} = req.body;  //
//     try{
//         let inventory = await Inventory.findByPk(inventoryID);
//         console.log(inventory);
//         if(!inventory){
//            // retornamos el resultado al cliente
//             res.status(404).json({
//                 message: "No se encuentra el cliente con ID = " + inventoryID,
//                 error: "404"
//             });
//         } else {    
//             // actualizamos nuevo cambio en la base de datos, definición de
//             let updatedObject = {             
//                 ID_Products:ID_Products,
//                 Stock: Stock,
//                 Description:Description ,
//                 ID_Bodega: ID_Bodega              
//             }
//             console.log(updatedObject);    //agregar proceso de encriptacion
//             let result = await inventory.update(updatedObject,
//                               { 
//                                 returning: true,                
//                                 where: {ID_Inventory: inventoryID}
//                               }
//                             );

//             // retornamos el resultado al cliente
//             if(!result) {
//                 res.status(500).json({
//                     message: "Error -> No se puede actualizar el inventario con ID = " + req.params.id,
//                     error: "No se puede actualizar",
//                 });
//             }

//             res.status(200).json(result);
//         }
//     } catch(error){
//         res.status(500).json({
//             message: "Error -> No se puede actualizar el cliente con ID = " + req.params.id,
//             error: error.message
//         });
//     }
// }

// async function deleteInventory(req, res){
//     console.log(req.params.id);
//     try{
//         let inventoryId = req.params.id;
//         let inventory = await Inventory.findByPk(inventoryId);
       
//         if(!inventory){
//             res.status(404).json({
//                 message: "La compañia con este ID no existe = " + inventoryId,
//                 error: "404",
//             });
//         } else {
//             await inventory.destroy();
//             res.status(200).send({
//                 message:"Compañia eliminada con exito"
//             });
//         }
//     } catch(error) {
//         res.status(500).json({
//             message: "Error -> No se puede eliminar el cliente con el ID = " + req.params.id,
//             error: error.message
//         });
//     }
// }


// function getInventoriesID(req, res){
//     // Buscamos informacion para llenar el modelo de 
//     try{
//         Inventory.findAll({attributes:['ID_Inventory', 'ID_Products']})
//         .then(inventories => {
//             res.status(200).send({inventories});
          
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


// function getNameProduct(req,res){
//     let companyId = req.params.id; 
//     let supplierId=req.params.supplier;
//     try{
//         Inventory.findAll({    
//              include: [
//             {
//                  model: Product,
//                  attributes: ['ID_Products','Name','codproduct','ID_Measure'],
//                  where:{[Op.and]: [
//                     { ID_Supplier:supplierId },
//                     { ID_Company:companyId}
//                   ]},
//                   on:{
//                     ID_Products: sequelize.where(sequelize.col("ec_inventory.ID_Products"), "=", sequelize.col("crm_products.ID_Products"))
//                  }  
//                 }  
//             ],
//             attributes: ['ID_Inventory','Stock'],
//             where: {ID_Bodega:8}
//           })
//         .then(inventories => {
//             res.status(200).send({inventories});
            
//         })
//     }catch(error) {
//         // imprimimos a consola
//         console.log(error);

//         res.status(500).json({
//             message: "Error!",
//             error: error
//         });
//     }
    
// }

// function getProductInfoxInventary(req,res){
//     let inventoryId = req.params.id; 
//     try{
//         Inventory.findAll({    
//              include: [
//                 {
//                  model: Product,
//                  attributes: ['ID_Products','Name','MinStock','MaxStock','BuyPrice','codproducts'],  
//                  on:{
//                     ID_Products: sequelize.where(sequelize.col("crm_products.ID_Products"), "=", sequelize.col("ec_inventory.ID_Products")),
//                  },
//                  include: [
//                      {
//                          model:Measure,
//                          attributes: ['Name'],
//                          on: {
//                             ID_Measure: sequelize.where(sequelize.col("crm_products.ID_Measure"), "=", sequelize.col("crm_products->crm_measures.ID_Measure")),
//                         }
//                      }
//                  ]    
//                 }  
//             ],
//             attributes: ['ID_Inventory','Stock'],
//             where:{ID_Inventory:inventoryId,
//                 ID_Bodega:8}  //8 ES DE BODEGA PRINCIPAL
//           })
//         .then(inventories => {
//             res.status(200).send({inventories});
            
//         })
//     }catch(error) {
//         // imprimimos a consola
//         console.log(error);

//         res.status(500).json({
//             message: "Error!",
//             error: error
//         });
//     }
    
// }


