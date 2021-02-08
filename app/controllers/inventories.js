const db = require('../config/db.config.js');
const fs =require("fs");
const path=require("path");
const Inventory = db.Inventory;


function getInventories(req, res){
    // Buscamos informacion para llenar el modelo de 
    try{
        Inventory.findAll()
        .then(inventories => {
            res.status(200).send({inventories});
          
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

function createInventory(req, res){
    let inventory = {};

    try{
        // Construimos el modelo del objeto inventory para enviarlo como body del request
        inventory.ID_Products = req.body.ID_Products;
        inventory.Stock=req.body.Stock;
        inventory.Description= req.body.Description;    
        // Save to MySQL database
       Inventory.create(inventory)
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

async function updateInventory(req, res){
   
    let inventoryID = req.params.id; 
    console.log(inventoryID); 
    const { ID_Products,Stock,Description} = req.body;  //
    try{
        let inventory = await Inventory.findByPk(inventoryID);
        console.log(inventory);
        if(!inventory){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el cliente con ID = " + inventoryId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = {             
                ID_Products:ID_Products,
                Stock: Stock,
                Description:Description               
            }
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await inventory.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_Inventory: inventoryId}
                              }
                            );

            // retornamos el resultado al cliente
            if(!result) {
                res.status(500).json({
                    message: "Error -> No se puede actualizar el inventario con ID = " + req.params.id,
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

async function deleteInventory(req, res){
    console.log(req.params.id);
    try{
        let inventoryId = req.params.id;
        let inventory = await Company.findByPk(inventoryId);
       
        if(!company){
            res.status(404).json({
                message: "La compañia con este ID no existe = " + companyId,
                error: "404",
            });
        } else {
            await company.destroy();
            res.status(200).send({
                message:"Compañia eliminada con exito"
            });
        }
    } catch(error) {
        res.status(500).json({
            message: "Error -> No se puede eliminar el cliente con el ID = " + req.params.id,
            error: error.message
        });
    }
}


function getInventoriesID(req, res){
    // Buscamos informacion para llenar el modelo de 
    try{
        Inventory.findAll({attributes:['ID_Inventory', 'ID_Products']})
        .then(inventories => {
            res.status(200).send({inventories});
          
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
    getInventories,
    createInventory,
    updateInventory,
    deleteInventory,
    getInventoriesID
};