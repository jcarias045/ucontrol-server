const product = require('../models/product.model');
const measure = require('../models/measure.model');
const inventory = require('../models/inventory.model');
const bodega = require('../models/bodega.model');
const company = require('../models/company.model');
const fs =require("fs");
const path=require("path");
const PDFDocument=require('pdfkit'); 


function getPoducts(req, res){

    product.find({Company: req.params.id}).populate({path: 'Company', model: 'Company'}).
    populate({path: 'Supplier', model: 'Supplier'}).
    populate({path: 'Brand', model: 'Brand'}).
    populate({path: 'CatProduct', model: 'CatProduct'}).
    populate({path: 'Measure', model: 'Measure'})
    .then(product => {
        if(!product){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({product})
        }
    });
    console.log(product);
}

async function createProduct(req, res){
    
    const Product = new product()
    const Inventory=new inventory();
    const InventoryReserva=new inventory();
    const { Name, Brand, SellPrice, ShortName, Company, CatProduct, Supplier,
    Logo, MinStock, MaxStock, Active, BuyPrice, codproducts, Measure, Inventary, AverageCost} = req.body

  
    //obteniendo informacion de la compañia para validar
    let companyParams=await company.findById(Company) //esta variable la mando a llamar luego que se ingreso factura
    .then(params => {
        if(!params){
            res.status(404).send({message:"No hay "});
        }else{
            return(params)
        }
    });
        Product.Name = Name;
        Product.Brand= Brand;
        Product.SellPrice= SellPrice;
        Product.ShortName= ShortName;
        Product.CatProduct= CatProduct;
        Product.Supplier=Supplier;
        Product.Measure=Measure;
        Product.Company=Company;
        Product.Logo= Logo;
        Product.MinStock= MinStock;
        Product.MaxStock= MaxStock;
        Product.Active=Active;
        Product.BuyPrice= BuyPrice;
        Product.codproducts = codproducts;
        Product.AverageCost= 0;


                console.log(Product);
                Product.save(async (err, ProductStored)=>{
                    if(err){
                        res.status(500).send({message: err});
                    }else{
                        if(!ProductStored){
                            res.status(500).send({message: "Error"});
                        }else{
                            let productId=ProductStored._id;
                            let nombreProduct=ProductStored.Name;
                           //obteniendo id de la bodega pricipal de la empresa
                           let bodegaPrincipal=await bodega.findOne({Name:'Principal', Company:Company},['_id'])
                           .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                            //obteniendo id de la bodega de reserva de la empresa
                            let bodegaReserva=await bodega.findOne({Name:'Reserva', Company:Company},['_id'])
                            .then(resultado =>{return resultado}).catch(err =>{console.log("error en proveedir");return err});
                            
                           
                            Inventory.Product=productId;
                            Inventory.Stock=0;
                            Inventory.Description="Inventario principal producto: "+ nombreProduct;
                            Inventory.Bodega=bodegaPrincipal._id;
                            Inventory.Company=Company;
                        
                            Inventory.save(async (err, inventoryStored)=>{
                                if(err){
                                    res.status(500).send({message: err});
                                }else{
                                    if(!inventoryStored){
                                        res.status(500).send({message: "Error"});
                                    }else{}
                                }
                            });
                            if(companyParams.AvailableReservation){
                                InventoryReserva.Product=productId;
                                InventoryReserva.Stock=0;
                                InventoryReserva.Description="Inventario de reserva producto: "+ nombreProduct;
                                InventoryReserva.Bodega=bodegaReserva._id;
                                InventoryReserva.Company=Company;
                                InventoryReserva.save(async (err, inventoryStored)=>{
                                    if(err){
                                        res.status(500).send({message: err});
                                    }else{
                                        if(!inventoryStored){
                                            res.status(500).send({message: "Error"});
                                        }else{}
                                    }
                                });
                            }
                            res.status(200).send({Product: ProductStored})
                        }
                    }
                });       
}


function uploadLogo(req,res){
    const params= req.params;
    const id=params.id;
    console.log(req.files);
    Product.find({_id:id}).then((productData)=>{        
          if(!productData){
            res.status(404)
            .send({message:"no se encontro usuario"});
          }
          else{
            let product =productData;
            console.log(productData);
            if(req.files){
                let filePath=req.files.avatar.path;                
                let fileSplit=filePath.split("\\");
                let fileName=fileSplit[3];
                let extSplit=fileName.split(".");
                let fileExt=extSplit[1];
                console.log(fileName);
                if(fileExt !== "png" && fileExt!=="jpg"){
                    res.status(400)
                    .send({message: "la extesion no es valida"});
                }    
            else{          
                console.log();
                let updatedObject = {                   
                    Logo: fileName,
                  }
                 Product.findByIdAndUpdate({_id:id},updatedObject,(err, updateObject)=>{
                           if(err){
                              res.status(500).json(err);

                           }else{
                               if(updateObject){
                                    res.status(200).json(updateObject);
                               }
                           }
                 })
                  
    
               
            }
            
        }
        else{
            console.log("no reconoce ");
        }
          }
       });
}

function getLogo(req,res){
    const logoName=req.params.logoName;
    const filePath="./app/uploads/avatar/"+logoName;
    console.log(filePath);
    fs.exists(filePath,exists=>{
        if(!exists){
            res.status(404)
            .send({message:"el avatar que buscas no existe"});
        }
        else{
            res.sendFile(path.resolve(filePath));
        }
       
    });
}


async function updateProduct(req, res){
    let productData = req.body;
    const params = req.params;

    product.findByIdAndUpdate({_id: params.id}, productData, (err, productUpdate)=>{
        if(err){
            res.status(500).sen({message: "Error del Servidor."});
        } else {
            if(!productUpdate){
                res.status(404).sen({message: "No hay"});
            }else{
                res.status(200).send({message: "Producto Actualizado"})
            }
        }
    })
}

async function deleteProduct(req, res){
    const { id } = req.params;
  
    product.findByIdAndRemove(id, (err, productDeleted) => {
      if (err) {
        res.status(500).send({ message: "Error del servidor." });
      } else {
        if (!productDeleted) {
          res.status(404).send({ message: "Producto no encontrado." });
        } else {
          res
            .status(200)
            .send({ message: "El Producto ha sido eliminado correctamente." });
        }
      }
    });
}


function getPoductsId(req, res){
    // Buscamos informacion para llenar el modelo de 
    try{
        Product.findAll({attributes:['ID_Products', 'Name']})
        .then(products => {
            res.status(200).send({products});
          
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


async function desactiveProduct(req, res){
    let productId = req.params.id; 
  
    const {Active} = req.body;  //
    try{
        
        await product.findByIdAndUpdate(productId, {Active}, (productStored) => {
            if (!productStored) {
                res.status(404).send({ message: "No se ha encontrado el producto." });
            }
            else if (Active === false) {
                res.status(200).send({ message: "Producto desactivado correctamente." });
            }
        })
        
    } catch(error){
        res.status(500).json({
            message: "Error -> No se puede actualizar el usuario con ID = " + req.params.id,
            error: error.message
        });
    }
}

function getRecommendedProducts(req,res){
   // Buscamos informacion para llenar el modelo de 
   let companyId = req.params.id;
   let ProductId=req.params.Product;
   try{
    Inventory.findAll({
        include: [
            {
                 model: Product ,
                 on: {
                     MinStock: sequelize.where(sequelize.col("crm_product.MinStock"), ">", sequelize.col("ec_inventory.Stock")),
                     ID_Products: sequelize.where(sequelize.col("ec_inventory.ID_Products"), "=", sequelize.col("crm_product.ID_Products"))
                    
                  },
                    attributes: ['Name','MinStock','MaxStock','BuyPrice','ID_Measure','codproducts'] ,
                    where:{
           
                        ID_Company:companyId,
                        ID_Product:ProductId
                    },
                    include: [
                        {
                            model:Measure,
                            attributes: ['Name'],
                            on: {
                               ID_Measure: sequelize.where(sequelize.col("crm_product.ID_Measure"), "=", sequelize.col("crm_product->crm_measures.ID_Measure")),
                           }
                        }
                    ]
             }
            ],
       
       attributes: ['Stock','ID_Inventory']
    })
    .then(products => {
        res.status(200).send({products});
      
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

// function getImages(req,res){
//     const logoName=req.params.logoName;
//     const filePath="./app/uploads/avatar/"+logoName;
//     console.log(filePath);
//     fs.exists(filePath,exists=>{
//         if(!exists){
//             res.status(404)
//             .send({message:"el avatar que buscas no existe"});
//         }
//         else{
//             res.sendFile(path.resolve(filePath));
//         }
       
//     });
// }

// function uploadImages(req, res) {
//     const params= req.params;
//     const id=params.id;
//     console.log(req.files);
//     Product.findByPk(id).then((productData)=>{        
//           if(!productData){
//             res.status(404)
//             .send({message:"no se encontro usuario"});
//           }
//           else{
//             let product =productData;
//             console.log(productData);
//             if(req.files){
//                 let filePath=req.files.avatar.path;
                
//                 let fileSplit=filePath.split("\\");
//                 let fileName=fileSplit[3];
//                 let extSplit=fileName.split(".");
//                 let fileExt=extSplit[1];
//                 console.log(fileName);
//                 if(fileExt !== "png" && fileExt!=="jpg"){
//                     res.status(400)
//                     .send({message: "la extesion no es valida"});
//                 }    
//             else{          
//                 console.log();
//                 let updatedObject = {                   
//                     Logo: fileName,
//                   }
//                 let result =  Product.update(updatedObject,
//                     { 
//                       returning: true,                
//                       where: {ID_Products: id},
//                       attributes: [ 'Logo']
//                     }
//                   );
//                   if(!result) {
//                     res.status(500).json({
//                         message: "Error -> No se puede actualizar el cliente con ID = " + req.params.id,
//                         error: "No se puede actualizar",
//                     });
//                 }
    
//                 res.status(200).json(result);
//             }
            
//         }
//         else{
//             console.log("no reconoce ");
//         }
//           }
//        });
    
// }

// function getRecommendedProductsInventory(req,res){
//     // Buscamos informacion para llenar el modelo de 
//     let companyId = req.params.id;
//     let ProductId=req.params.Product;
//     try{
//      Product.findAll({
//          attributes:['Name','MinStock','MaxStock','ID_Products','Inventary','BuyPrice','codproducts'],
        
//          include:[{
//              model:Measure,
//              attributes: ['Name'],
//              on:{
//                 ID_Measure: sequelize.where(sequelize.col("crm_products.ID_Measure"), "=", sequelize.col("crm_measures.ID_Measure"))
//              }  
//          },
//          {
//              model: Inventory,
//              attributes: ['ID_Inventory','Stock'],

//              on:{
//                 ID_Products: sequelize.where(sequelize.col("crm_products.ID_Products"), "=", sequelize.col("ec_inventory.ID_Products")),
//                 Stock:sequelize.where(sequelize.col("crm_products.MinStock"), ">", sequelize.col("ec_inventory.Stock"))
//              } ,
//              where: {ID_Bodega:8}
//          }
//         ], 
         
//         })
//      .then(products => {
//          res.status(200).send({products});
         
//      })
//  }catch(error) {
//      // imprimimos a consola
//      console.log(error);
 
//      res.status(500).json({
//          message: "Error en query!",
//          error: error
//      });
//  }
 
//  }
function getRecommendedProductsInventory(req,res){
  
    const { id,supplier } = req.params;
    console.log('recomendados');
    console.log(id);
    console.log(supplier);
    
    inventory.find().populate({path: 'Bodega', model: 'Bodega',match:{Name: 'Principal'}})
    .populate({path: 'Product', model: 'Product',populate:{path: 'Measure', model: 'Measure'},match:{Supplier: supplier,Company: id}})
    .exec((err, products) => {
        if (err) {
            console.log(err);
            return res.send(err.message);
          }
          if(!products){

          }else{
              console.log(products);
              const productsByCourse = products.filter(
                (product) => {
                    
                    let minStocks=product.Product;
                    if(minStocks!==null){
                         return(product.Stock < minStocks.MinStock ) 
                    }
                    else{
                        return(null) 
                    }
                   
                }
            );
  
          res.status(200).send(productsByCourse);
          }
          
    })
 
 }

 function getProductByInventory(req,res){
  
    const { id,company } = req.params;
    console.log('recomendados');
    console.log(id);
    console.log(company);
    
    inventory.find().populate({path: 'Bodega', model: 'Bodega',match:{Name: { $eq: 'Principal' }}})
    .populate({path: 'Product', model: 'Product',populate:{path: 'Measure', model: 'Measure'},match:{Company: company}})
    // inventory.aggregate([
    //     {
    //         $lookup: {
    //             from: "bodegas",
    //             let: { order_item: "$Bodega" },
    //             pipeline: [
    //                 { $match:
    //                    { $expr:
    //                       { $and:
    //                          [
    //                            { $eq: [ "$_id",  "$$order_item" ] },
    //                            { $eq: [ "$Name", "Principal" ] }
    //                          ]
    //                       }
    //                    }
    //                 },
    //                 // { $project: { $expr:{ Name:  { $in:"Principal" }} }}
    //              ],
    //             as:"bodega",
                
    //         }
    //     }, 
    //     {
    //         $lookup: {
    //             from:"products",
    //             localField:"_id",
    //             foreignField:"Product",
    //             // let:{idiv:"Inventory" },
    //             // pipeline:[
    //             //     // { "$match": { "$expr": { "$eq": ["$_id", "$$idiv"] }}},,
    //             //     {
    //             //         $lookup: {
    //             //             from:"inventories",
    //             //             as:"children"
    //             //         }
    //             //     }
    //             // ],
    //             as:"detalles",
                
    //         }
    //     }
       

    // ])
    // // product
    .then(product => {
        if(!product){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({product})
        }
    });
 
 }

// function getProduct(req,res){
//     console.log(req.params.id);
//     Product.findByPk(req.params.id,
//         {attributes:[
//             'ID_Products','Name','ID_Brand','SellPrice',
//             'ShortName', 'ID_Company','ID_CatProduct',
//             'ID_Product', 'ID_Measure', 'Logo', 'MinStock',
//             'MaxStock', 'Active', 'BuyPrice', 'codproducts'
//         ]})
//         .then(products => {
//           res.status(200).json(products);
//         }).catch(error => {
//         // imprimimos a consola
//           console.log(error);

//           res.status(500).json({
//               message: "Error!",
//               error: error
//           });
//         })
// }

function ExportProductList(req, res){
    
    product.find({Company: req.params.id}).populate({path: 'Company', model: 'Company'}).
    populate({path: 'Supplier', model: 'Supplier'}).
    populate({path: 'Brand', model: 'Brand'}).
    populate({path: 'CatProduct', model: 'CatProduct'}).
    populate({path: 'Measure', model: 'Measure'})
    .then(product => {
        if(!product){
            res.status(404).send({message:"No hay "});
        }else{
            // res.status(200).send({product})
            console.log(product);
            const listproducts= product;
            console.log(listproducts);

            const doc = new PDFDocument();
            doc.pipe(fs.createWriteStream('ListaProductos.pdf'));
            doc.pipe(res);

            listproducts.map(producto=>{
                let ypos = doc.y;
                doc
                .font('Courier')
                .fillColor('blue')
                .fontSize(16)
                // .font('fonts/delicious-roman-webfont.ttf')
                .text('Productos de Compañia:'+ producto.Company.Name,{
                    width: 410,
                    align: 'center',
                    underline: true
                })
                .text('Codigo Producto: ' +producto.codproducts)
                .text('Nombre Producto: '+producto.Name)
                .text('Marca: '+ producto.Brand.Name)
                .text('Precio de Venta:'+producto.SellPrice)
                .text('Nombre Corto: '+ producto.ShortName)
                .text('Categoria Producto: '+ producto.CatProduct.Name)
                .text('Nombre Proveedor: '+producto.Supplier.Name)
                .text('Medida: ' + producto.Measure.Name)
                .text('Minimo Establecido: '+ producto.MinStock)
                .text('Maximo Permitido: '+producto.MaxStock)
                .text('Estado Activo: '+producto.Active)
                .text('Precio de Compra: '+producto.BuyPrice)
                .text('En Inventario: '+producto.Inventary)
                .text('Costo Promedio: '+producto.AverageCost )
                .addPage()
            })
            doc.end();
        }
    });

    

}
 
module.exports={
    getPoducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getPoductsId,
    desactiveProduct,
    uploadLogo,
    getLogo,
    getRecommendedProducts,
    // getImages
    getRecommendedProductsInventory,
    ExportProductList,
    // getProduct
    // getProduct,
    getProductByInventory

}