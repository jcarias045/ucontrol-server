const { custom } = require('joi');
const db = require('../config/db.config.js');
const bcrypt=require("bcrypt-nodejs");
const jwt=require('../services/jwt');
const CatProduct = db.CatProduct;

/* //Crear

//Seleccionar unico
exports.getCustomer = (req, res) => {
    Customer.findByPk(req.params.id, 
                        {attributes: ['id', 'nombre']})
        .then(customer => {
          res.status(200).json(customer);
        }).catch(error => {
        // imprimimos a consola
          console.log(error);

          res.status(500).json({
              message: "Error!",
              error: error
          });
        })
} */

function createCatProduct(req, res){
    let catproduct = {};

    try{
        // Construimos el modelo del objeto catproduct para enviarlo como body del request
        catproduct.Name = req.body.Name;
        catproduct.Description= req.body.Description;

    }catch(error){
        res.status(500).json({
            message: "Fail!",
            error: error.message
        });
    }
}

function getCatProductInfo(req, res){
    console.log("Hola provando");
    CatProduct.findByPk(req.params.id)
        .then(catproduct => {
          res.status(200).json(catproduct);
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
function catproducts(req, res){
    // Buscamos informacion para llenar el modelo de catproducts
    try{
        Customer.findAll()
        .then(catproducts => {
            res.status(200).send({catproducts});
          
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

 async function updateCatProduct(req, res){
   
    let catproductId = req.params.id;
  
    
    const { Name,Description} = req.body;  //
   
    try{
        let catproduct = await CatProduct.findByPk(catproductId);
        console.log(catproduct);
        if(!catproduct){
           
            res.status(404).json({
                message: "No se encuentra el Categoria de producto con ID = " + catproductId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = {             
                Name:Name,
                Description: Description
            }
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await CatProduct.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_CatProduct: catproductId},
                                attributes: [ 'Name','Description']
                              }
                            );

           
            if(!result) {
                res.status(500).json({
                    message: "Error -> No se puede actualizar el Categoria de producto con ID = " + req.params.id,
                    error: "No se puede actualizar",
                });
            }

            res.status(200).json(result);
        }
    } catch(error){
        res.status(500).json({
            message: "Error -> No se puede actualizar el Categoria de producto con ID = " + req.params.id,
            error: error.message
        });
    }
}


async function deleteCatProduct(req, res){
    try{
        let catproductId = req.params.id;
        let catproduct = await CatProduct.findByPk(catproductId);

        if(!customer){
            res.status(404).json({
                message: "Categoria de producto con este ID no existe = " + catproductId,
                error: "404",
            });
        } else {
            await customer.destroy();
            res.status(200).send({
                message:"Categoria de producto eliminado con exito"
            });
        }
    } catch(error) {
        res.status(500).json({
            message: "Error -> No se puede eliminar el Categoria de producto con el ID = " + req.params.id,
            error: error.message
        });
    }
}


module.exports={
    createCatProduct,
    getCatProductInfo,
    catproducts,
    updateCatProduct,
    deleteCatProduct
};