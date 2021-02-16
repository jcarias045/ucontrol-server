const { custom } = require('joi');
const db = require('../config/db.config.js');
const bcrypt=require("bcrypt-nodejs");
const jwt=require('../services/jwt');
const { Op } = require("sequelize");
const Customer = db.Customer;
const Company = db.Company;
const User = db.User; 

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

function createCustomer(req, res){
    let customer = {};
     console.log(req.body);
    const pass=req.body.Password;
    try{
        // Construimos el modelo del objeto Customer para enviarlo como body del request
        customer.Name = req.body.Name;
        customer.LastName=req.body.LastName;
        customer.User= req.body.User;
        customer.Email=req.body.Email;
        customer.Password=req.body.Password;
        customer.Country=req.body.Country;
        customer.City=req.body.City;
        customer.ZipCode=req.body.ZipCode;
        customer.Phone=req.body.Phone;
        customer.MobilPhone=req.body.MobilPhone;
        customer.IdNumber=req.body.IdNumber;
        customer.Images=req.body.Images;
        customer.ID_Company=req.body.ID_Company;
        customer.Access=req.body.Access;
        customer.AccountsReceivable=req.body.AccountsReceivable;
        customer.ID_PaymentTime =req.body.ID_PaymentTime;
        customer.ID_User=req.body.ID_User;
        Customer.findOne({where:{[Op.or]: [
            { Email: customer.Email},
            { User: customer.User }
          ]}}).then(function(exist){
              if(!exist){
                  console.log(customer.Password);
                if(pass!==""){  //esto nada más para encriptar si no es necesario solo guardar como parte que esta comentada abajo
                    bcrypt.hash(pass,null,null,function(err,hash){   
                        if(err){
                            res.status(505).send({message:"Error al encriptar la contraseña"})
                        }
                        else{
                            customer.Password=hash;
                            console.log(customer.Password);
                            Customer.create(customer)
                            .then(result => {    
                              res.status(200).json(result);
                             
                            });
                        }
                    });
                } //FIN DEL PROCESO DE ENCRIPTACION 
              }
              else{
                res.status(505).send({message:"El cliente ya existe"})
              }
          });

        
    }catch(error){
        res.status(500).json({
            message: "Fail!",
            error: error.message
        });
    }
}

function getCustomerInfo(req, res){
    console.log("gola");
    Customer.findByPk(req.params.id)
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
}
//Seleccionar TODOS
function customers(req, res){
    let companyId = req.params.id; 
    try{
        Customer.findAll({where: {ID_Company: companyId}})
        .then(customers => {
            res.status(200).send({customers});
          
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

 async function updateCustomer(req, res){
   
    let customerId = req.params.id;
  
    
    const { Name,LastName,User,Email, Password,Country,City,ZipCode,
    Phone,MobilPhone,IdNumber,Images,AccountsReceivable} = req.body;  //
   
    try{
        let customer = await Customer.findByPk(customerId);
        console.log(customer);
        if(!customer){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el cliente con ID = " + customerId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = {             
                Name:Name,
                LastName: LastName,
                User:User,
                Email:Email,
                Password:Password,
                Country:Country,
                City:City,
                ZipCode:ZipCode,
                Phone:Phone,
                MobilPhone:MobilPhone,
                IdNumber:IdNumber,
                Images:Images,
                AccountsReceivable:AccountsReceivable
            }
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await Customer.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_Customer: customerId},
                                attributes: [ 'Name','LastName']
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


async function deleteCustomer(req, res){
    try{
        let customerId = req.params.id;
        let customer = await Customer.findByPk(customerId);

        if(!customer){
            res.status(404).json({
                message: "El cliente con este ID no existe = " + customerId,
                error: "404",
            });
        } else {
            await customer.destroy();
            res.status(200).send({
                message:"Cliente eliminado con exito"
            });
        }
    } catch(error) {
        res.status(500).json({
            message: "Error -> No se puede eliminar el cliente con el ID = " + req.params.id,
            error: error.message
        });
    }
}

/* //Eliminar


//Actualizar
exports.updateCustomer = async (req, res) => {
    try{
        let customer = await Customer.findByPk(req.body.id);
    
        if(!customer){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el cliente con ID = " + customerId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos
            let updatedObject = {
                nombre: req.body.nombre,
              
            }
            let result = await Customer.update(updatedObject,
                              { 
                                returning: true, 
                                where: {id: req.body.id},
                                attributes: ['id', 'nombre']
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
} */

async function signInCustomer(req, res) {
    const params=req.body;
    const Email=params.Email;
    const Password=params.Password;
    let CustomerDetails = req.query;
    console.log("EndPointFunciona");
    let customer= await Customer.findOne({attributes: ['Email','Password'],where:{Email:Email}});
    console.log(customer.Password);
     Customer.findOne({attributes: ['ID_Customer','Name','LastName','User','Email','Password','Country','City','ZipCode','Phone','MobilPhone','idNumber','Images','ID_Company','Access','AccountsReceivable','ID_PaymentTime','ID_User','ID_Discount'],where:{Email:Email}})
        .then(function (customer) {
            console.log(Password);
            const infoCustomer= customer.get();
            console.log(infoCustomer.Password);
            console.log(infoCustomer.Access);
            // if( bcrypt.compareSync(Password, infoCustomer.Password) || Password == infoCustomer.Password){
                //Se deja documentada linea superior por error con hash.
                if( Password == infoCustomer.Password){
                    if (infoCustomer.Access == true){
                        res.status(200).send({
                            accessToken:jwt.createAccessTokenCustomer(infoCustomer),
                            resfreshToken: jwt.createRefreshTokenCustomer(infoCustomer)  
                            })
                        } else {
                            res.status(500).send({message:"Error el usuario no tiene acceso", customer} )
                    }
                }else{
                        res.status(500).send({message:"Error de contraseña contraseña incorrecta", customer});
                    }
                })
        .catch(error => {
        // imprimimos a consola
          console.log(error);

          res.status(500).json({
              message: "Error!",
              error: error
          });
        });     
}

module.exports={
    createCustomer,
    getCustomerInfo,
    customers,
    updateCustomer,
    deleteCustomer,
    signInCustomer
};