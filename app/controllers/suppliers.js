
const db = require('../config/db.config.js');
const bcrypt=require("bcrypt-nodejs");
const jwt=require('../services/jwt');
const { Op } = require("sequelize");

const Supplier = db.Supplier;
const PaymentTime=db.PaymentTime;


function createSupplier(req, res){
    let supplier = {};

    try{
        // Construimos el modelo del objeto supplier para enviarlo como body del request
        supplier.ID_supplier = req.body.ID_supplier;
        supplier.Name=req.body.Name;
        supplier.Web= req.body.Web;
        supplier.Email=req.body.Email;
        supplier.Phone=req.body.Phone;
        supplier.Adress=req.body.Adress;
        supplier.Active=true;
        supplier.codsupplier=req.body.UserName;
        supplier.ID_PaymentTime=req.body.ID_PaymentTime;
        supplier.ID_Company=req.body.ID_Company;
        
        Supplier.findOne({where:{[Op.or]: [
            { Email: supplier.Email},
            { Name: supplier.Name}
          ]}}).then(function(exist){
              if(!exist){
                Supplier.create(supplier)
                .then(result => {    
                  res.status(200).json(result);
              
                });  
              }
              else{
                res.status(505).send({message:"El proveedor ya existe"})

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


function getSuppliers(req, res){
 
    let companyId = req.params.id;
    try{
        Supplier.findAll({where: {ID_Company: companyId}})
        .then(suppliers => {
            res.status(200).send({suppliers});
          
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

async function updateSupplier(req, res){
   
    let supplierId = req.params.id;
  
    
    const { Name,Web,Email,Phone,Adress,Active,UserName,ID_PaymentTime} = req.body;  //
   
    try{
        let supplier = await Supplier.findByPk(supplierId);
        console.log(supplier);
        if(!supplier){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el cliente con ID = " + supplierId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = {             
                Name:Name,
                Web: Web,
                Email: Email,
                Phone:Phone,
                Adress:Adress,
                Active: Active,
                UserName: UserName,
                ID_PaymentTime: ID_PaymentTime

            }
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await supplier.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_Supplier: supplierId}
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

async function deleteSupplier(req, res){
    console.log(req.params.id);
    try{
        let supplierId = req.params.id;
        let supplier = await Supplier.findByPk(supplierId);
       
        if(!supplier){
            res.status(404).json({
                message: "La compañia con este ID no existe = " + supplierId,
                error: "404",
            });
        } else {
            await supplier.destroy();
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

async function desactivateSupplier(req, res){
   
    let supplierId = req.params.id; 
  
    const {Active} = req.body;  //
    try{
        let supplier = await Supplier.findByPk(supplierId);
        
        if(!supplier){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el cliente con ID = " + supplierId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = {      
                Active:Active          
            }
               //agregar proceso de encriptacion
            let result = await supplier.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_Supplier: supplierId},
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

function getSuppliersInfo(req, res){
    let companyId = req.params.id;
    try{
        Supplier.findAll({where: {ID_Company: companyId},
            attributes:['ID_Supplier','Name']})
        .then(suppliers => {
            res.status(200).send({suppliers});
          
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

function getSuppliersDetails(req, res){
 
    let supplierId = req.params.id;
    try{
        Supplier.findAll({
            include: [
                {
                    model: PaymentTime,
                    attributes: ['Name','Description']
                }
            ],
            where: {
                ID_Supplier:supplierId
            }
        
        })
        .then(suppliers => {
            res.status(200).send({suppliers});
          
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
    createSupplier,
    getSuppliers,
    updateSupplier,
    deleteSupplier,
    desactivateSupplier,
    getSuppliersInfo,
    getSuppliersDetails

};