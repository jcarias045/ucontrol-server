const db = require('../config/db.config.js');
const fs =require("fs");
const path=require("path");
const CatProduct = db.CatProduct;
const Company = db.Company;

function getCatProducts(req,res){
    console.log("Categorias");
    let companyId = req.params.id; 
    try{
                 CatProduct.findAll(
                     {
                    include:[
                        {
                            model: Company,
                            attributes: ['ID_Company','Name','ShortName']
                        }
                    ],
                    where:{ID_Company: companyId}
                 }
                 )
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

function creatCatProduct(req, res){
            let catproduct = {};
        
            try{
                // Construimos el modelo del objeto catproduct para enviarlo como body del request
                catproduct.Name = req.body.Name;
                catproduct.Description=req.body.Description;
                catproduct.ID_Company = req.body.ID_Company;
            
                // Save to MySQL database
               CatProduct.create(catproduct)
              .then(result => {    
                res.status(200).json(result);
            
              });  
            }catch(error){
                res.status(500).json({
                    message: "Fail!",
                    error: error.message
                });
            }
        }

async function deleteCatProduct(req, res){
            console.log(req.params.id);
            try{
                let catproductID = req.params.id;
                let catproduct = await CatProduct.findByPk(catproductID);
               
                if(!catproduct){
                    res.status(404).json({
                        message: "La Categoria con este ID no existe = " + catproductID,
                        error: "404",
                    });
                } else {
                    await catproduct.destroy();
                    res.status(200).send({
                        message:"Categoria eliminada con exito"
                    });
                }
            } catch(error) {
                res.status(500).json({
                    message: "Error -> No se puede eliminar la categoria con el ID = " + req.params.id,
                    error: error.message
                });
            }
}

async function updateCatProduct(req, res){
            let catproductID = req.params.id; 
            console.log(catproductID); 
            const { Name,Description} = req.body;  //
            try{
                let catproduct = await CatProduct.findByPk(catproductID);
                console.log(catproduct);
                if(!catproduct){
                // retornamos el resultado al cliente
                    res.status(404).json({
                        message: "No se encuentra el cliente con ID = " + catproductID,
                        error: "404"
                    });
                } else {    
                    // actualizamos nuevo cambio en la base de datos, definición de
                    let updatedObject = {             
                        Name:Name,
                        Description: Description              
                    }
                    console.log(updatedObject);    //agregar proceso de encriptacion
                    let result = await catproduct.update(updatedObject,
                                    { 
                                        returning: true,                
                                        where: {ID_CatProduct: catproductID}
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

function getCatProductsId(req, res){
    // Buscamos informacion para llenar el modelo de 
    let companyId = req.params.id;
    try{
        CatProduct.findAll({
            where:{ID_Company: companyId},
            attributes:['ID_CatProduct', 'Name']})
        .then(CatProducts => {
            res.status(200).send({CatProducts});
          
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
    getCatProducts,
    creatCatProduct,
    deleteCatProduct,
    updateCatProduct,
    getCatProductsId
};






// function getCatProductsId(req, res){
//     // Buscamos informacion para llenar el modelo de 
//     try{
//         CatProduct.findAll({attributes:['ID_CatProduct']})
//         .then(CatProducts => {
//             res.status(200).send({CatProducts});
          
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

// module.exports={
//     getCatProducts,
//     creatCatProduct,
//     updateCatProduct,
//     deleteCatProduct,
//     getCatProductsId,
// };