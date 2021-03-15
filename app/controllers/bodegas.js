const db = require('../config/db.config.js');
const bcrypt=require("bcrypt-nodejs");
const jwt=require('../services/jwt');
const { Op } = require("sequelize");
//Se utiliza DiscountObj porque el parametro Discount y el nombre del objeto no pueden ser iguales.
const Bodega = db.Bodega;
const Company = db.Company;

function getBodega(req, res) {

    let companyId = req.params.id;

    try{
        Bodega.findAll({    
             include: [
            {
                 model: Company,
                 attributes: ['ID_Company','Name','ShortName']
             }
            ],
            where: {ID_Company: companyId}
          })
        .then(bodega => {
            res.status(200).json({bodega});            
        })
    }catch(error) {
        // imprimimos a consola
        console.log(error);
        res.status(500).json({
            message: "Error!",
            error: error
        });
    }
}

function createBodega(req, res){
    
    let bodega = {};

    try{
        // Construimos el modelo del objeto company para enviarlo como body del reques
        bodega.Name = req.body.Name;
        bodega.State = req.body.State;
        bodega.ID_Company=req.body.ID_Company
        console.log(bodega);
        // Save to MySQL database
        Bodega.create(bodega)
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


async function updateBodega(req, res){
   
    let bodegaId = req.params.id; 

    const { Name } = req.body;  //

    try{
        let bodega = await Bodega.findByPk(bodegaId);
        console.log(bodega);
        if(!bodega){
           // retornamos el resultado al descuento
            res.status(404).json({
                message: "No se encuentra el banco con ID = " + bodegaId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = {             
                Name: Name,    
            }
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await bodega.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_Bodega: bodegaId}
                              }
                            );

            // retornamos el resultado al descuento
            if(!result) {
                res.status(500).json({
                    message: "Error -> No se puede actualizar el descuento con ID = " + req.params.id,
                    error: "No se puede actualizar",
                });
            }
            res.status(200).json(result);
        }
    } catch(error){
        res.status(500).json({
            message: "Error -> No se puede actualizar el descuento con ID = " + req.params.id,
            error: error.message
        });
    }
}

async function deleteBodega(req, res){
    console.log(req.params.id);
    try{
        let bodegaId = req.params.id;
        let bodega = await Bodega.findByPk(bodegaId);
       
        if(!bodega){
            res.status(404).json({
                message: "El banco con este ID no existe = " + bodegaId,
                error: "404",
            });
        } else {
            await bodega.destroy();
            res.status(200).send({
                message:"La Bodega fue eliminad con exito"
            });
        }
    } catch(errr) {
        res.status(500).json({
            mesage: "Error -> No se puede eliminar el banco con el ID = " + req.params.id,
            error: error.message
        });
    }
}

function getBodegaId (req, res){
    
    let companyId = req.params.id;

    try{
        Bodega.findAll({
            where:{ID_Company: companyId},
            attributes: ['ID_Bodega', 'Name']
        })
        .then(bodega =>{
            res.status(200).json({bodega});
            
        })
    }catch(error){
        console.log(error);
        res.status(500).json({
            message: "Error en el query!",
            error: error
        })
    }
}

async function desactivate (req,res){
    
    let bodegasId = req.params.id; 
  
    const { State } = req.body;  //
    try{
        let bodega = await Bodega.findByPk(bodegasId);
        console.log(bodega);
        if(!bodega){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el cliente con ID = " + bodegasId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = {      
                State: State          
            }
            console.log(updatedObject);
               //agregar proceso de encriptacion
            let result = await Bodega.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_Bodega: bodegasId},
                                attributes:['State' ]
                              }
                            );

            // retornamos el resultado al cliente
            if(!result) {
                res.status(500).json({
                    message: "Error -> No se puede actualizar el usuario con ID = " + req.params.id,
                    error: "No se puede actualizar",
                });
            }
            console.log(result);
            res.status(200).json(result);
        }
    } catch(error){
        res.status(500).json({
            message: "Error -> No se puede actualizar el usuario con ID = " + req.params.id,
            error: error.message
        });
    }
}

module.exports={
    getBodega,
    createBodega,
    updateBodega,
    deleteBodega,
    getBodegaId,
    desactivate
}
