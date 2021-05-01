const bcrypt = require("bcrypt-nodejs");
const jwt = require("../services/jwt");
const Customer = require("../models/customer.model");
const company= require("../models/company.model");

function createCustomer(req, res) {

    const customerNew = new Customer();

    const { Name,LastName,codCustomer,Email, Password,Country,City,ZipCode,
            Phone,MobilPhone,idNumber,Images,AccountsReceivable,Access,
            PaymentTime, Discount, User, Company, Active, Sector, Sector1, Sector2,
            Nit,Ncr,TypeofTaxpayer,PaymentCondition} = req.body;
        
            customerNew.Name = Name;
            customerNew.LastName = LastName;
            customerNew.codCustomer = codCustomer;
            customerNew.Email = Email;
            customerNew.Password = Password;
            customerNew.Country = Country;
            customerNew.City = City;
            customerNew.ZipCode = ZipCode;
            customerNew.Phone = Phone;
            customerNew.MobilPhone = MobilPhone;
            customerNew.idNumber = idNumber;
            customerNew.Images = Images;
            customerNew.AccountsReceivable = AccountsReceivable;
            customerNew.Access = Access;
            customerNew.PaymentTime = PaymentTime;
            customerNew.Discount = Discount;
            customerNew.User = User;
            customerNew.Active= Active;
            customerNew.Company = Company;
            customerNew.Ncr=Ncr;
            customerNew.Sector=Sector;
            customerNew.Sector1=Sector1;
            customerNew.Sector2=Sector2;
            customerNew.Nit=Nit;
            customerNew.TypeofTaxpayer = TypeofTaxpayer;
            customerNew.PaymentCondition= PaymentCondition;
            console.log(customerNew.codCustomer);
            const comparar = customerNew.codCustomer;
            console.log(comparar);
            console.log(customerNew.Company);
            const compararCompany = customerNew.Company;
            console.log(compararCompany);
            if (!Password) {
                res.status(500).send({ message: "La contraseña es obligatoria." });
                } else {
                bcrypt.hash(Password, null, null, (err, hash) => {
                if (err) {
                    res.status(500).send({ message: "Error al encriptar la contraseña." });
                 } else {
                    customerNew.Password = hash;
                }
            });
        }
        Customer.findOne({Company: compararCompany, codCustomer: comparar})
            .then(customer=>{
                console.log(customer);
                console.log(customerNew.codCustomer);
                console.log(!customer);
                console.log("entra");
                console.log(customerNew.Company);
                if(!customer){
                    console.log("si entra al if");
                                 customerNew.save((err, customerStored)=>{
                                    if(err){
                                        res.status(500).send({message: err});
                                    }else{
                                        if(!customerStored){
                                            res.status(500).send({message: "Error"});
                                        }else{
                                            res.status(200).send({Customer: customerStored});
                                        }
                                     }
                                 });
                }else{
                    console.log("entra2");
                    res.status(500).send({ message: "Error el cliente ya existe." });
                }
            })
    }

    
    
function getCustomers(req, res){
    console.log(req.params.id);
    console.log(req.params.userid);
    const {id} = req.params.id;

    const {userid} = req.params.userid;

        Customer.find({Company: req.params.id , User: req.params.userid})
            .populate({path: "User", model: "User"})
            .populate({path: "Company", model: "Company"})
            .populate({path: "Discount", model: "Discount"})
        .then(customer => {
            console.log(customer);
            console.log(!customer);
            if(!customer){
                res.status(404).send({message:"No hay "});
            }else{
                res.status(200).send({customer})
            }
        });
}

async function desactivateCustomer(req, res){
    let customerId = req.params.id; 
  
    const {Active} = req.body;  
    try{
        
        await Customer.findByIdAndUpdate(customerId, {Active}, (customerSotred) => {
            if (!customerSotred) {
                res.status(404).send({ message: "No se ha encontrado el proveedor." });
            }
            else if (Active === false) {
                res.status(200).send({ message: "Proveedor desactivado correctamente." });
            }
        })
        
    } catch(error){
        res.status(500).json({
            message: "Error -> No se puede actualizar el usuario con ID = " + req.params.id,
            error: error.message
        });
    }
}

async function updateCustomer(req,res){
    let customerData = req.body;
    const params = req.params;

    Customer.findByIdAndUpdate({_id: params.id}, customerData, (err, customerUpdate)=>{
        if(err){
            res.status(500).send({message: "Error del Servidor."});
        } else {
            if(!customerUpdate){
                res.status(404).send({message: "No hay"});
            }else{
                res.status(200).send({message: "Trabajo Actualizado"})
            }
        }
    })
}

function getCustomersDetails(req, res){
    const {id} = req.params;
    console.log(id);
        Customer.find({_id: id})
            .populate({path: "Discount", model: "Discount"})
        .then(customer => {
            if(!customer){
                res.status(404).send({message:"No hay "});
            }else{
                res.status(200).send({customer})
            }
        });
}

async function getCustomersforSaleOrder(req, res){

    const {id,userid} = req.params;
    let now= new Date();
    let fechaAct=now.toISOString().substring(0, 10);
    console.log(id);
    let companyParams=await company.findById(id) //esta variable la mando a llamar luego que se ingreso factura
    .then(params => {
        if(!params){
            res.status(404).send({message:"No hay "});
        }else{
            return(params) 
        }
    });
    if(companyParams.OrderWithWallet){
        Customer.find({Company: id , User: userid})
            .populate({path: "User", model: "User"})
            .populate({path: "Company", model: "Company"})
            .populate({path: "Discount", model: "Discount"})
        .then(customer => {
            if(!customer){
                res.status(404).send({message:"No hay wallet"});
            }else{
                res.status(200).send({customer})
            }
        });
    }
    else{
        Customer.aggregate([
            {$match:{ $expr:
                { $and:
                   [
                     { Company: id},
                     { User:userid},
                    
                   ]
                }
             }},
            
                {
                    
                    $lookup: {
                        from: "customerinvoices",
                        let: { customerId: "$_id" },
                        pipeline: [
                            { $match:
                                { $expr:
                                    { $and:
                                       [
                                         { $eq: [ "$Customer",  "$$customerId" ] },
                                         { $gte: [fechaAct, "$CreationDate" ] },
                                        //  { $eq: [ "$Pagada",  true ] },
                                       ]
                                    }
                                 }
                            },
                           
                           
                         ],
                        as:"invoice",
                        
                    },
                    
                },
                //   {
                //      $unwind:  "$invoice"
                //   },
                  
            ])
            .exec((err, customer) => {
                    if(!customer){
                        res.status(404).send({message:"No hay "});
                    }else{
                        let invo=null;
                        customer.map(item =>{
                            invo=item.invoice;
                            // return invo.map(i=>{return i.Pagada})===false;
                            invo.map(item => { console.log(item.Pagada) });
                        })
                        let index = invo.findIndex(item => { return item.Pagada === false});
                        
                        console.log(l);
                        if(index > -1){
                            invo.splice(index, 1);
                            }
                        // console.log(index);
                            // if(index > -1){
                            //     customer.splice(index, 1);
                            //     }
                                res.status(200).send({customer});
                    }
                });
    }

  
}

module.exports = {
    createCustomer,
    getCustomers,
    desactivateCustomer,
    updateCustomer,
    getCustomersDetails,
    getCustomersforSaleOrder
}



// const { custom } = require('joi');
// const db = require('../config/db.config.js');
// const bcrypt=require("bcrypt-nodejs");
// const jwt=require('../services/jwt');
// const { Op } = require("sequelize");
// const Customer = db.Customer;
// const Company = db.Company;
// const UserObj = db.User; 
// const Discount = db.Discount;


// function createCustomer(req, res){
//     let customer = {};
//     console.log(req.body);
//     console.log(customer);
//     try{
//         customer.Name = req.body.Name;
//         customer.LastName=req.body.LastName;
//         customer.User= req.body.User;
//         customer.Email=req.body.Email;
//         customer.Password=req.body.Password;
//         customer.Country=req.body.Country;
//         customer.City=req.body.City;
//         customer.ZipCode=req.body.ZipCode;
//         customer.Phone=req.body.Phone;
//         customer.MobilPhone=req.body.MobilPhone;
//         customer.idNumber=req.body.idNumber;
//         customer.Images=req.body.Images;
//         customer.ID_Company=req.body.ID_Company;
//         customer.Access=req.body.Access;
//         customer.AccountsReceivable=req.body.AccountsReceivable;
//         customer.PaymentTime =req.body.PaymentTime;
//         customer.ID_User=req.body.ID_User;
//         customer.ID_Discount = req.body.ID_Discount;
//         customer.Active = req.body.Active;
        
//         Customer.findOne({attributes:['ID_Customer','Email','User'],
//             where:{[Op.and]: [
//             { Email: customer.Email},
//             // { User: customer.User },
//             // {ID_Company: customer.ID_Company}
//           ]}}).then(function(exist){
//               if(!exist){
//                   console.log(customer.Password);
//                 if(pass!==""){  //esto nada más para encriptar si no es necesario solo guardar como parte que esta comentada abajo
//                     bcrypt.hash(pass,null,null,function(err,hash){   
//                         if(err){
//                             res.status(505).send({message:"Error al encriptar la contraseña"})
//                         }
//                         else{
//                             customer.Password=hash;
//                             console.log(customer.Password);
//                             Customer.create(customer)
//                             .then(result => {    
//                               res.status(200).json(result);                            
//                             });
//                         }
//                     });
//                 } //FIN DEL PROCESO DE ENCRIPTACION 
//               }
//               else{
//                 res.status(505).send({message:"El cliente ya existe"})
//               }
//           });        
//     }catch(error){
//         res.status(500).json({
//             message: "Fail!",
//             error: error.message
//         });
//     }
// }

// function getCustomerInfo(req, res){
//     console.log("gola");
//     Customer.findByPk(req.params.id,{
//         attributes:['ID_Customer','Name','LastName','User','Email','Country',
//         'City','ZipCode','Phone','MobilPhone','idNumber','Images','ID_Company','Access','AccountsReceivable',
//         'PaymentTime','ID_Discount', 'Active']})
//         .then(customer => {
//           res.status(200).json(customer);
//         }).catch(error => {
//         // imprimimos a consola
//           console.log(error);
//           res.status(500).json({
//               message: "Error!",
//               error: error
//           });
//         })
// }

// //Seleccionar TODOS
// async function customers(req, res){
//     let companyId = req.params.id; 
//     let userId=req.params.user;
//     let requiredIncome= await Company.findAll({attributes:['CompanyRecords'], where:{CompanyRecords:0,ID_Company:companyId}}).
//     then(function(result){return result});   //obtenes si existe un registro
//     console.log(requiredIncome);
//     let customer={};
//     try{
//         if(requiredIncome.length>0){
//             console.log("usuario");
//             Customer.findAll({
//                where: {ID_Company: companyId, ID_User:userId},
//                attributes:['ID_Customer','Name','LastName','User','Email','Country',
//            'City','ZipCode','Phone','MobilPhone','idNumber','Images','ID_Company','Access','AccountsReceivable',
//              'PaymentTime','ID_Discount', 'Active']})
//            .then(customers => {
//                res.status(200).send({customers});
             
//             })
//         }
//         else{
//             console.log("por compania");
//             Customer.findAll({
//               where: {ID_Company: companyId},
//               attributes:['ID_Customer','Name','LastName','User','Email','Country',
//               'City','ZipCode','Phone','MobilPhone','idNumber','Images','Active','ID_Company','Access','AccountsReceivable',
//               'PaymentTime','ID_Discount','Active']})
//           .then(customers => {
//               res.status(200).send({customers});   
//           })
//         }
//     }catch(error) {
//         // imprimimos a consola
//         console.log(error);
//         res.status(500).json({
//             message: "Error en query!",
//             error: error
//         });
//     }
// }

//  async function updateCustomer(req, res){
   
//     let customerId = req.params.id;

//     const { Name,LastName,User,Email, Password,Country,City,ZipCode,
//     Phone,MobilPhone,idNumber,Images,AccountsReceivable,Access,
//     PaymentTime,ID_company,ID_Discount,ID_User} = req.body;  //

//     try{
//         let customer = await Customer.findByPk(customerId,{
//             attributes:['ID_Customer','Name','LastName',
//             'User', 'Email', 'Password', 'Country', 'City', 'ZipCode',
//             'Phone','MobilPhone','idNumber','Images','AccountsReceivable','Access',
//             'PaymentTime','ID_company','ID_Discount','ID_User']});
//             console.log("objeto");
//             console.log(customer);
//         if(!customer){
//            // retornamos el resultado al cliente
//             res.status(404).json({
//                 message: "No se encuentra el cliente con ID = " + customerId,
//                 error: "404"
//             });
//         } else {    
//             //actualizamos nuevo cambio en la base de datos, definición de
//             let updatedObject =  {           
//                 Name:Name,
//                 LastName: LastName,
//                 User:User,
//                 Email:Email,
//                 Password:Password,
//                 Country:Country,
//                 City:City,
//                 ZipCode:ZipCode,
//                 Phone:Phone,
//                 MobilPhone:MobilPhone,
//                 idNumber:idNumber,
//                 ID_company:ID_company,
//                 Images:Images,
//                 AccountsReceivable:AccountsReceivable,
//                 Access: Access,
//                 PaymentTime: PaymentTime,
//                 ID_Discount: ID_Discount,
//                 ID_User: ID_User,               
//             }
//             console.log("Objeto llevado al update");
//             console.log(updatedObject);    //agregar proceso de encriptacion
//             let result = await Customer.update(updatedObject,
//                               { 
//                                 returning: true,                
//                                 where: {ID_Customer: customerId},
//                               }
//                             );

//             // retornamos el resultado al cliente
//             if(!result) {
//                 res.status(500).json({
//                     message: "Error -> No se puede actualizar el cliente con ID = " + req.params.id,
//                     error: "No se puede actualizar",
//                 });
//             }
//             res.status(200).json(result);
//         }
//     } catch(error){
//         res.status(500).json({
//             message: "Error -> No se puede actualizar el cliente con ID = " + req.params.id,
//             error: error.message
//         });
//     }
// }

// async function deleteCustomer(req, res){
//     console.log(req.params.id);
//     try{

//         let customerId = req.params.id;
//         let customer = await Customer.findByPk(customerId,{attributes: ['ID_Customer','Email','User']});

//         if(!customer){
//             res.status(404).json({
//                 message: "El cliente con este ID no existe = " + customerId,
//                 error: "404",
//             });
//         } else {
//             await customer.destroy();
//             res.status(200).send({
//                 message:"Cliente eliminado con exito"
//             });
//         }
//     } catch(error) {
//         res.status(500).json({
//             message: "Error -> No se puede eliminar el cliente con el ID = " + req.params.id,
//             error: error.message
//         });
//     }
// }

// async function signInCustomer(req, res) {
//     const params=req.body;
//     const Email=params.Email;
//     const Password=params.Password;
//     let CustomerDetails = req.query;
//     console.log("EndPointFunciona");
//     let customer= await Customer.findOne({attributes: ['Email','Password'],where:{Email:Email}});
//     console.log(customer.Password);
//      Customer.findOne({attributes: ['ID_Customer','Name','LastName','User','Email','Password','Country','City','ZipCode','Phone','MobilPhone','idNumber','Images','ID_Company','Access','AccountsReceivable','PaymentTime','ID_User','ID_Discount'],where:{Email:Email}})
//         .then(function (customer) {
//             console.log(Password);
//             const infoCustomer= customer.get();
//             console.log(infoCustomer.Password);
//             console.log(infoCustomer.Access);
//             if( bcrypt.compareSync(Password, infoCustomer.Password) || Password == infoCustomer.Password){
//                 //Se deja documentada linea superior por error con hash.
//                 // if( Password == infoCustomer.Password){
//                     if (infoCustomer.Access == true){
//                         res.status(200).send({
//                             accessToken:jwt.createAccessTokenCustomer(infoCustomer),
//                             resfreshToken: jwt.createRefreshTokenCustomer(infoCustomer)  
//                             })
//                         } else {
//                             res.status(500).send({message:"Error el usuario no tiene acceso", customer} )
//                     }
//                 }else{
//                         res.status(500).send({message:"Error de contraseña contraseña incorrecta", customer});
//                     }
//                 })
//         .catch(error => {
//         // imprimimos a consola
//           console.log(error);

//           res.status(500).json({
//               message: "Error!",
//               error: error
//           });
//         });     
// }

// async function desactiveCustomer(req, res){

//     let customerId = req.params.id;
//     const {Active} = req.body;  //
    
//     try{
//         let customer = await Customer.findByPk(customerId,{
//             attributes:['Name']
//         });
        
//         if(!customer){
//            // retornamos el resultado al cliente
//             res.status(404).json({
//                 message: "No se encuentra el cliente con ID = " + customerId,
//                 error: "404"
//             });
//         } else {    
//             // actualizamos nuevo cambio en la base de datos, definición de
//             let updatedObject = {      
//                 Active:Active          
//             }
//                //agregar proceso de encriptacion
//             let result = await Customer.update(updatedObject,
//                               { 
//                                 returning: true,                
//                                 where: {ID_Customer: customerId},
//                                 attributes:['Active' ]
//                               }
//                             );

//             // retornamos el resultado al cliente
//             if(!result) {
//                 res.status(500).json({
//                     message: "Error -> No se puede actualizar el usuario con ID = " + req.params.id,
//                     error: "No se puede actualizar",
//                 });
//             }

//             res.status(200).json(result);
//         }
//     } catch(error){
//         res.status(500).json({
//             message: "Error -> No se puede actualizar el usuario con ID = " + req.params.id,
//             error: error.message
//         });
//     }
// }

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
//     Customer.findByPk(id).then((customerData)=>{        
//           if(!customerData){
//             res.status(404)
//             .send({message:"no se encontro usuario"});
//           }
//           else{
//             let customer =customerData;
//             console.log(customerData);
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
//                 let result =  Customer.update(updatedObject,
//                     { 
//                       returning: true,                
//                       where: {ID_Customer: id},
//                       attributes: [ 'Images']
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

// function customersUsers(req,res){
//     let userId = req.params.id
//     console.log(req.body.id);
//     console.log(userId);
//     try{        
//         Customer.findAll({
//             where: {ID_User: userId},
//             attributes:['ID_Customer','Name','LastName','User','Email','Country',
//         'City','ZipCode','Phone','MobilPhone','idNumber','Images','ID_Company','Access','AccountsReceivable',
//     'PaymentTime','ID_Discount', 'Active','ID_User']})
//         .then(customer => {
//             res.status(200).send({customer});          
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
//     createCustomer,
//     getCustomerInfo,
//     customers,
//     updateCustomer,
//     deleteCustomer,
//     signInCustomer,
//     desactiveCustomer,
//     getImages,
//     uploadImages,
//     customersUsers
// };