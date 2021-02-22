const db = require('../config/db.config.js');
const fs =require("fs");
const path=require("path");
const sequelize = require('sequelize');
const { Op } = require("sequelize");

const Product = db.Product;
const Inventory = db.Inventory;
const Measure = db.Measure;

function getPoducts(req, res){
    // Buscamos informacion para llenar el modelo de 
    try{
        Product.findAll()
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

function createProduct(req, res){
    let product = {};

    try{
        // Construimos el modelo del objeto product para enviarlo como body del request
        product.Name = req.body.Name;
        product.Brand=req.body.Brand;
        product.SellPrice= req.body.SellPrice;
        product.ShortName=req.body.ShortName;
        product.ID_CatProduct=req.body.ID_CatProduct;
        product.ID_Supplier=req.body.ID_Supplier;
        product.Measure=req.body.Measure;
        product.ExpirationTime=req.body.ExpirationTime;
        product.ID_Company=req.body.ID_Company;
        product.Logo= req.body.Logo;
        product.MinStock= req.body.MinStock;
        product.MaxStock= req.body.MaxStock;
        product.Active=true;

        
        Product.findOne({where:{[Op.or]: [
            { Name: product.Name},
            { ShortName: product.ShortName}
          ]}}).then(function(exist){
              if(!exist){
                product.create(product)
                .then(result => {    
                  res.status(200).json(result);
              
                });  
              }
              else{
                res.status(505).send({message:"El producto ya existe"})

              }
            });

        // Save to MySQL database
       
    }catch(error){
        res.status(500).json({
            message: "Fail!",
            error: error.message
        });
    }
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
   
    let productId = req.params.id; 
    console.log(productId); 
    const { Name, Brand, SellPrice, ShortName, ID_Company, ID_CatProduct, ID_Supplier, Measure, ExpirationTime,Logo, MinStock, MaxStock, Active} = req.body;  //
    try{
        let product = await Product.findByPk(productId);
        console.log(product);
        if(!product){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el cliente con ID = " + productId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = {             
                Name:Name,
                Brand: Brand,
                SellPrice: SellPrice,
                ShortName: ShortName,
                ID_Company: ID_Company,
                ID_CatProduct: ID_CatProduct,
                ID_Supplier: ID_Supplier,
                Measure: Measure,
                ExpirationTime: ExpirationTime,
                Logo: Logo,
                MinStock: MinStock,
                MaxStock: MaxStock,
                Active:Active               
            }
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await product.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_Products: productId}
                              }
                            );

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

async function deleteProduct(req, res){
    console.log(req.params.id);
    try{
        let productId = req.params.id;
        let product = await Product.findByPk(productId);
       
        if(!product){
            res.status(404).json({
                message: "El Producto con este ID no existe = " + productId,
                error: "404",
            });
        } else {
            await product.destroy();
            res.status(200).send({
                message:"Producto eliminada con exito"
            });
        }
    } catch(error) {
        res.status(500).json({
            message: "Error -> No se puede eliminar el producto con el ID = " + req.params.id,
            error: error.message
        });
    }
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
        let product = await Product.findByPk(productId);
        
        if(!product){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el cliente con ID = " + productId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = { 
               
                Active:Active          
            }
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await product.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_Products: productId},
                                attributes:['Active' ]
                              }
                            );

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

function getRecommendedProducts(req,res){
   // Buscamos informacion para llenar el modelo de 
   let companyId = req.params.id;
   let supplierId=req.params.supplier;
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
                        ID_Supplier:supplierId
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
module.exports={
    getPoducts,
    getRecommendedProducts
}