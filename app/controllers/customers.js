const { custom } = require('joi');
const db = require('../config/db.config.js');
const bcrypt=require("bcrypt-nodejs");
const jwt=require('../services/jwt');
const { Op } = require("sequelize");
const Customer = db.Customer;
const Company = db.Company;
const UserObj = db.User; 
const Discount = db.Discount;


function createCustomer(req, res){
    let customer = {};
    let pass = req.body.Password
    let active = req.body.Active
    console.log(req.body);
    console.log(customer);
    try{
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
        customer.idNumber=req.body.idNumber;
        customer.Images=req.body.Images;
        customer.ID_Company=req.body.ID_Company;
        customer.Access=req.body.Access;
        customer.AccountsReceivable=req.body.AccountsReceivable;
        customer.PaymentTime =req.body.PaymentTime;
        customer.ID_User=req.body.ID_User;
        customer.ID_Discount = req.body.ID_Discount;
        customer.Active = active;
        
        Customer.findOne({attributes:['ID_Customer','Email','User'],
            where:{[Op.or]: [
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
    Customer.findByPk(req.params.id,{
        attributes:['ID_Customer','Name','LastName','User','Email','Country',
        'City','ZipCode','Phone','MobilPhone','idNumber','Images','ID_Company','Access','AccountsReceivable',
    'PaymentTime','ID_Discount', 'Active']})
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
async function customers(req, res){
    let companyId = req.params.id; 
    let userId=req.params.user;
    let requiredIncome=await Company.findAll({attributes:['CompanyRecords'], where:{RequiredIncome:1,ID_Company:companyId}}).
    then(function(result){return result});   //obtenes si existe un registro
    console.log(requiredIncome);
    let customer={};
    try{
        if(requiredIncome.length>0){
            console.log("por compania");
          Customer.findAll({
            where: {ID_Company: companyId},
            attributes:['ID_Customer','Name','LastName','User','Email','Country',
        'City','ZipCode','Phone','MobilPhone','idNumber','Images','ID_Company','Access','AccountsReceivable',
          'PaymentTime','ID_Discount']})
        .then(customers => {
            res.status(200).send({customers});
          
        })
        }
        else{
            console.log("usuario");
             Customer.findAll({
                where: {ID_Company: companyId, ID_User:userId},
                attributes:['ID_Customer','Name','LastName','User','Email','Country',
            'City','ZipCode','Phone','MobilPhone','idNumber','Images','ID_Company','Access','AccountsReceivable',
              'PaymentTime','ID_Discount']})
            .then(customers => {
                res.status(200).send({customers});
              
            })
        }

        
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
    Phone,MobilPhone,idNumber,Images,AccountsReceivable,Access,
    PaymentTime,ID_company,ID_Discount,ID_User} = req.body;  //

    try{
        let customer = await Customer.findByPk(customerId,{
            attributes:['ID_Customer','Name','LastName',
            'User', 'Email', 'Password', 'Country', 'City', 'ZipCode',
            'Phone','MobilPhone','idNumber','Images','AccountsReceivable','Access',
            'PaymentTime','ID_company','ID_Discount','ID_User']});
            console.log("objeto");
            console.log(customer);
        if(!customer){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el cliente con ID = " + customerId,
                error: "404"
            });
        } else {    
            //actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject =  {           
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
                idNumber:idNumber,
                ID_company:ID_company,
                Images:Images,
                AccountsReceivable:AccountsReceivable,
                Access: Access,
                PaymentTime: PaymentTime,
                ID_Discount: ID_Discount,
                ID_User: ID_User,               
            }
            console.log("Objeto llevado al update");
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await Customer.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_Customer: customerId},
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
    console.log(req.params.id);
    try{

        let customerId = req.params.id;
        let customer = await Customer.findByPk(customerId,{attributes: ['ID_Customer','Email','User']});

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


async function signInCustomer(req, res) {
    const params=req.body;
    const Email=params.Email;
    const Password=params.Password;
    let CustomerDetails = req.query;
    console.log("EndPointFunciona");
    let customer= await Customer.findOne({attributes: ['Email','Password'],where:{Email:Email}});
    console.log(customer.Password);
     Customer.findOne({attributes: ['ID_Customer','Name','LastName','User','Email','Password','Country','City','ZipCode','Phone','MobilPhone','idNumber','Images','ID_Company','Access','AccountsReceivable','PaymentTime','ID_User','ID_Discount'],where:{Email:Email}})
        .then(function (customer) {
            console.log(Password);
            const infoCustomer= customer.get();
            console.log(infoCustomer.Password);
            console.log(infoCustomer.Access);
            if( bcrypt.compareSync(Password, infoCustomer.Password) || Password == infoCustomer.Password){
                //Se deja documentada linea superior por error con hash.
                // if( Password == infoCustomer.Password){
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

async function desactiveCustomer(req, res){

    let customerId = req.params.id;
    const {Active} = req.body;  //
    
    try{
        let customer = await Customer.findByPk(customerId,{
            attributes:['Name']
        });
        
        if(!customer){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el cliente con ID = " + customerId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = {      
                Active:Active          
            }
               //agregar proceso de encriptacion
            let result = await Customer.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_Customer: customerId},
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

function getImages(req,res){
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

function uploadImages(req, res) {
    const params= req.params;
    const id=params.id;
    console.log(req.files);
    Customer.findByPk(id).then((customerData)=>{        
          if(!customerData){
            res.status(404)
            .send({message:"no se encontro usuario"});
          }
          else{
            let customer =customerData;
            console.log(customerData);
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
                let result =  Customer.update(updatedObject,
                    { 
                      returning: true,                
                      where: {ID_Customer: id},
                      attributes: [ 'Images']
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


module.exports={
    createCustomer,
    getCustomerInfo,
    customers,
    updateCustomer,
    deleteCustomer,
    signInCustomer,
    desactiveCustomer,
    getImages,
    uploadImages
};