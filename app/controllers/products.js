const product = require('../models/product.model')
const fs =require("fs");
const path=require("path");



function getPoducts(req, res){
    product.find().populate({path: 'Company', model: 'Company'}).
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
}

function createProduct(req, res){
    
    const Product = new product()

    const { Name, Brand, SellPrice, ShortName, Company, CatProduct, Supplier,
    Logo, MinStock, MaxStock, Active, BuyPrice, codproducts, Measure, Inventary, AverageCost} = req.body

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
        Product.Inventary= Inventary;
        Product.AverageCost= AverageCost;

        console.log(Product);
        Product.save((err, ProductStored)=>{
            if(err){
                res.status(500).send({message: err});
            }else{
                if(!ProductStored){
                    res.status(500).send({message: "Error"});
                }else{
                    res.status(200).send({Product: ProductStored})
                }
            }
        });
}


function uploadLogo(req,res){
    const params= req.params;
    const id=params.id;
    console.log(req.files);
    Product.findByPk(id).then((productData)=>{        
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
                let result =  Product.update(updatedObject,
                    { 
                      returning: true,                
                      where: {ID_Products: id},
                      attributes: [ 'Logo']
                    }
                  );
                  if(!result) {
                    res.status(500).json({
                        message: "Error -> No se puede actualizar el cliente con ID = " + req.params.id,
                        error: "No se puede actualizar",
                    });
                }
    
                res.status(200).json(result);
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

function getRecommendedProductsInventory(req,res){
    // Buscamos informacion para llenar el modelo de 
    let companyId = req.params.id;
    let ProductId=req.params.Product;
    try{
     Product.findAll({
         attributes:['Name','MinStock','MaxStock','ID_Products','Inventary','BuyPrice','codproducts'],
        
         include:[{
             model:Measure,
             attributes: ['Name'],
             on:{
                ID_Measure: sequelize.where(sequelize.col("crm_products.ID_Measure"), "=", sequelize.col("crm_measures.ID_Measure"))
             }  
         },
         {
             model: Inventory,
             attributes: ['ID_Inventory','Stock'],

             on:{
                ID_Products: sequelize.where(sequelize.col("crm_products.ID_Products"), "=", sequelize.col("ec_inventory.ID_Products")),
                Stock:sequelize.where(sequelize.col("crm_products.MinStock"), ">", sequelize.col("ec_inventory.Stock"))
             } ,
             where: {ID_Bodega:8}
         }
        ], 
         
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

function getProduct(req,res){
    console.log(req.params.id);
    Product.findByPk(req.params.id,
        {attributes:[
            'ID_Products','Name','ID_Brand','SellPrice',
            'ShortName', 'ID_Company','ID_CatProduct',
            'ID_Product', 'ID_Measure', 'Logo', 'MinStock',
            'MaxStock', 'Active', 'BuyPrice', 'codproducts'
        ]})
        .then(products => {
          res.status(200).json(products);
        }).catch(error => {
        // imprimimos a consola
          console.log(error);

          res.status(500).json({
              message: "Error!",
              error: error
          });
        })
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
    getProduct

}