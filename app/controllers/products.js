const { custom } = require('joi');
const db = require('../config/db.config.js');
const bcrypt=require("bcrypt-nodejs");
const jwt=require('../services/jwt');
const Product = db.Product;

function createProduct(req, res){
    let product = {};

    try{
        // Construimos el modelo del objeto Producto para enviarlo como body del request
        product.Name = req.body.Name;
        product.Brand=req.body.Brand;
        product.Price=req.body.Price;
        product.Stock=req.boyd.Stock;
        product.ShortName=req.body.ShortName;
        product.ID_Company=req.body.ID_Company;
        product.ID_CatProduct=req.body.ID_CatProduct;
        

    }catch(error){
        res.status(500).json({
            message: "Fail!",
            error: error.message
        });
    }
}

function getProductInfo(req, res){
    console.log("hola");
    Product.findByPk(req.params.id)
        .then(product => {
          res.status(200).json(product);
        }).catch(error => {
        // imprimimos a consola
          console.log(error);

          res.status(500).json({
              message: "Error!",
              error: error
          });
        })
}

//Seleccionar TODOS
function products(req, res){
    // Buscamos informacion para llenar el modelo de Productos
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

async function updateProduct(req, res){
   
    let productId = req.params.id;
  
    
    const { Name,Brand,Price,Stock,ShortName,ID_Company,ID_CatProduct} = req.body;
   
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
                Price: Price,
                Stock: Stock,
                ShortName: ShortName,
                ID_Company: ID_Company,
                ID_CatProduct: ID_CatProduct

            }
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await Product.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_Products: productId},
                                attributes: [ 'Name','Brand']
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
    try{
        let productId = req.params.id;
        let product = await Product.findByPk(productId);

        if(!product){
            res.status(404).json({
                message: "El producto con este ID no existe = " + productId,
                error: "404",
            });
        } else {
            await product.destroy();
            res.status(200).send({
                message:"Producto eliminado con exito"
            });
        }
    } catch(error) {
        res.status(500).json({
            message: "Error -> No se puede eliminar el producto con el ID = " + req.params.id,
            error: error.message
        });
    }
}
module.exports={
    createProduct,
    getProductInfo,
    products,
    updateProduct,
    deleteProduct
};