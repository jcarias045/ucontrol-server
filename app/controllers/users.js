const bcrypt = require("bcrypt-nodejs");
const jwt = require("../services/jwt");
const User = require("../models/user.model");

function createUser(req,res){
    
    const user = new User();

    const { Name,LastName,Email,Password,Gender,BirthDate,Country,
       Address, LastLogin, Active, Image, UserName, Company} = req.body;

    user.Name= Name;
    user.LastName= LastName;
    user.Email=Email;
    user.Password=Password;
    user.Gender=Gender;
    user.BirthDate=BirthDate;
    user.Country=Country;
    user.Address=Address;
    user.LastLogin=LastLogin;
    user.Active=Active;
    user.Image=Image;
    user.UserName=UserName;
    user.Company = Company;
    console.log(user);
    if (!Password) {
        res.status(500).send({ message: "La contraseña es obligatoria. " });
      } else {
        bcrypt.hash(Password, null, null, (err, hash) => {
          if (err) {
            res.status(500).send({ message: "Error al encriptar la contraseña." });
          } else {
            user.Password = hash;    
            user.save((err, userStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!userStored){
                res.status(500).send({message: "Error"});
            }else{
                res.status(200).send({User: userStored});
            }
        }
      });
    }
  });
}
}

function getUsers(req, res){
    User.find().populate({path: 'Company', model: 'Company'})
    .then(user => {
        if(!user){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({user})
        }
    });
}

async function deleteUser(req,res){
    const { id } = req.params;
  
    User.findByIdAndRemove(id, (err, userDeleted) => {
      if (err) {
        res.status(500).send({ message: "Error del servidor." });
      } else {
        if (!userDeleted) {
          res.status(404).send({ message: "Compañia no encontrado." });
        } else {
          res
            .status(200)
            .send({ message: "La compañia ha sido eliminado correctamente." });
        }
      }
    });
}

async function updateUser(req,res) {
    let userData = req.body;
    const params = req.params;

    User.findByIdAndUpdate({_id: params.id}, userData, (err, userUpdate)=>{
        if(err){
            res.status(500).send({message: "Error del Servidor."});
        } else {
            if(!userUpdate){
                res.status(404).send({message: "No hay"});
            }else{
                res.status(200).send({message: "Compañia Actualizada"})
            }
        }
    })
}

function signIn(req, res) {
    const params = req.body;
    const Email = params.Email.toLowerCase();
    const Password = params.Password;
  
    User.findOne({ Email }, (err, userStored) => {
      if (err) {
        res.status(500).send({ message: "Error del servidor." });
      } else {
        if (!userStored) {
          res.status(404).send({ message: "Usuario no encontrado." });
        } else {
          bcrypt.compare(Password, userStored.Password, (err, check) => {
            if (err) {
              res.status(500).send({ message: "Error del servidor." });
            } else if (!check) {
              res.status(404).send({ message: "La contraseña es incorrecta." });
            } else {
              if (!userStored.Active) {
                res
                  .status(200)
                  .send({ code: 200, message: "El usuario no se ha activado." });
              } else {
                res.status(200).send({
                  accessToken: jwt.createAccessToken(userStored),
                  refreshToken: jwt.createRefreshToken(userStored)
                });
              }
            }
          });
        }
      }
    });
  }

module.exports ={
    createUser,
    getUsers,
    deleteUser,
    updateUser,
    signIn
}

















// const db = require('../config/db.config.js');
// const bcrypt=require("bcrypt-nodejs");
// const jwt=require('../services/jwt');
// const { Op } = require("sequelize");

// const User = db.User;
// const Company = db.Company;
// const Profile=db.Profile;


// //Seleccionar TODOS
// function getUsers (req, res)  {
//     // Buscamos informacion para llenar el modelo de Users
//     try{
//         User.findAll({    
//              include: [
//             {
//                  model: Company,
//                  attributes: ['ID_Company','Name','ShortName']
//              },
//              {
//                  model:Profile,
//                  attributes: ['ID_Profile','Name']
//              }
//             ]
//           })
//         .then(users => {
//             res.status(200).send({users});
            
//         })
//     }catch(error) {
//         // imprimimos a consola
//         console.log(error);

//         res.status(500).json({
//             message: "Error!",
//             error: error
//         });
//     }
// }


// async function signIn(req, res) {
//     const params=req.body;
//     const Email=params.Email;
//     const Password=params.Password;
//     let userDetails = req.query;
    
//     let user= await User.findOne({attributes: ['Email','Password'],where:{Email:Email}});
//     console.log(user.Password);
//      User.findOne({attributes: ['Email','Password','Name','LastName','ID_User','ID_Company','ID_Profile','ID_Rol'],where:{Email:Email}})
//         .then(function (user) {
//             console.log(Password);
//             const infoUser= user.get();
//             console.log(infoUser.Password);
//             if( bcrypt.compareSync(Password, infoUser.Password)){
//                 res.status(200).send({
//                     accessToken:jwt.createAccessToken(infoUser),
//                     resfreshToken: jwt.createRefreshToken(infoUser)
                    
//                 });
//             }
//             else{
//                 res.status(500).send({message:"Error del servidor", user});
//             }})
//         .catch(error => {
//         // imprimimos a consola
//           console.log(error);

//           res.status(500).json({
//               message: "Error!",
//               error: error
//           });
//         });     
// }


// function createUser(req, res){
//     let user = {};
//     let now= new Date();
//     let LastLogin=now.getTime();
//     let password=req.body.Password;
   
//     try{
//         // Construimos el modelo del objeto user para enviarlo como body del request
//         user.ID_Company = req.body.ID_Company;
//         user.Name = req.body.Name;
//         user.LastName = req.body.LastName;
//         user.Email = req.body.Email.toLowerCase();
//         user.Password=password;
//         user.Gender=req.body.Gender;
//         user.BirthDate=req.body.BirthDate;
//         user.Country=req.body.Country;
//         user.Address=req.body.Address;
//         user.ID_Profile=req.body.ID_Profile;
//         user.UserName=req.body.UserName;
//         user.LastLogin=LastLogin;
//         user.Active=true;
//         user.ID_Rol=req.body.ID_Rol;
        
//         User.findOne({where:{[Op.or]: [
//             { Email: user.Email},
//             { UserName: user.UserName }
//           ]}}).then(function(us){
//               if(!us){       
//                     bcrypt.hash(password,null,null,function(err,hash){
//                         if(err){
//                             res.status(505).send({message:"Error al encriptar la contraseña"})

//                         }
//                         else{
//                             user.Password=hash;
//                             User.create(user)
//                             .then(result => {    
//                             res.status(200).json(result);                        
//                             });  
//                         }
//                     });
//               }
//               else{
//                 res.status(505).send({message:"El usuario ya existe "})
//               }
               
//           });

        
//         // Save to MySQL database
//     //    User.create(user)
//     //   .then(result => {    
//     //     res.status(200).json(result);
    
//     //   });  
//     }catch(error){
//         res.status(500).json({
//             message: "Fail!",
//             error: error.message
//         });
//     }
// }


// async function updateUser(req, res){
   
//     let userId = req.params.id; 
//     console.log(userId);
//     const {ID_Company, Name,LastName,Email,Password,Gender,BirthDate,Country,
//         Address, ID_Profile,ID_Rol} = req.body;  //
//     try{
//         let user = await User.findByPk(userId);
        
//         if(!user){
//            // retornamos el resultado al cliente
//             res.status(404).json({
//                 message: "No se encuentra el cliente con ID = " + userId,
//                 error: "404"
//             });
//         } else {    
//             // actualizamos nuevo cambio en la base de datos, definición de
//             let updatedObject = { 
//                 ID_Company:ID_Company,            
//                 Name:Name,
//                 LastName:LastName,
//                 Email:Email,
//                 Password:Password,
//                 Gender:Gender,
//                 BirthDate:BirthDate,
//                 Country:Country,
//                 Address:Address,
//                 ID_Profile:ID_Profile,
//                 ID_Rol:ID_Rol,   
//             }
//             console.log(updatedObject);    //agregar proceso de encriptacion
//             let result = await user.update(updatedObject,
//                               { 
//                                 returning: true,                
//                                 where: {ID_User: userId}
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


// async function deleteUser(req, res){
//     console.log(req.params.id);
//     try{
//         let userId = req.params.id;
//         let user = await User.findByPk(userId);
       
//         if(!user){
//             res.status(404).json({
//                 message: "La compañia con este ID no existe = " + userId,
//                 error: "404",
//             });
//         } else {
//             await user.destroy();
//             res.status(200).send({
//                 message:"Usuario eliminada con exito"
//             });
//         }
//     } catch(error) {
//         res.status(500).json({
//             message: "Error -> No se puede eliminar el cliente con el ID = " + req.params.id,
//             error: error.message
//         });
//     }
// }



// async function desactivateUser(req, res){
   
//     let userId = req.params.id; 
  
//     const {Active} = req.body;  //
//     try{
//         let user = await User.findByPk(userId);
        
//         if(!user){
//            // retornamos el resultado al cliente
//             res.status(404).json({
//                 message: "No se encuentra el cliente con ID = " + userId,
//                 error: "404"
//             });
//         } else {    
//             // actualizamos nuevo cambio en la base de datos, definición de
//             let updatedObject = { 
               
//                 Active:Active          
//             }
//             console.log(updatedObject);    //agregar proceso de encriptacion
//             let result = await User.update(updatedObject,
//                               { 
//                                 returning: true,                
//                                 where: {ID_User: userId},
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

// module.exports={
//     getUsers,
//     signIn, 
//     createUser,
//     deleteUser,
//     updateUser,
//     desactivateUser
// };
        