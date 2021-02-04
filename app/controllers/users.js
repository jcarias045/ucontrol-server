const db = require('../config/db.config.js');
const bcrypt=require("bcrypt-nodejs");
const jwt=require('../services/jwt');

const User = db.User;
const Company = db.Company;
const Profile=db.Profile;


//Seleccionar TODOS
function getUsers (req, res)  {
    // Buscamos informacion para llenar el modelo de Users
    try{
        User.findAll({    
             include: [
            {
                 model: Company,
                 attributes: ['ID_Company','Name','ShortName']
             },
             {
                 model:Profile,
                 attributes: ['ID_Profile','Name']
             }
            ]
          })
        .then(users => {
            res.status(200).send({users});
            
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


async function signIn(req, res) {
    const params=req.body;
    const Email=params.Email;
    const Password=params.Password;
    let userDetails = req.query;
    
    let user= await User.findOne({attributes: ['Email','Password'],where:{Email:Email}});
    console.log(user.Password);
     User.findOne({attributes: ['Email','Password','Name','LastName','ID_User'],where:{Email:Email}})
        .then(function (user) {
            console.log(Password);
            const infoUser= user.get();
            if( bcrypt.compareSync(Password, infoUser.Password)){
                res.status(200).send({
                    accessToken:jwt.createAccessToken(infoUser),
                    resfreshToken: jwt.createRefreshToken(infoUser),
                    message:"Exito"
                });
            }
            else{
                res.status(500).send({message:"error del servidor", user});
            }})
        .catch(error => {
        // imprimimos a consola
          console.log(error);

          res.status(500).json({
              message: "Error!",
              error: error
          });
        });
        
      
}


function createUser(req, res){
    let user = {};
    let now= new Date();
    let LastLogin=now.getTime();
    console.log('La fecha actual es',now);
    console.log('UNIX time:',now.getTime());
    try{
        // Construimos el modelo del objeto user para enviarlo como body del request
        user.ID_Company = req.body.ID_Company;
        user.Name = req.body.Name;
        user.LastName = req.body.LastName;
        user.Email = req.body.Email;
        user.Password=req.body.Password;
        user.Gender=req.body.Gender;
        user.BirthDate=req.body.BirthDate;
        user.Country=req.body.Country;
        user.Address=req.body.Address;
        user.ID_Profile=req.body.ID_Profile;
        user.LastLogin=LastLogin;
        user.Active=true;
       
    
        // Save to MySQL database
       User.create(user)
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


async function updateUser(req, res){
   
    let userId = req.params.id; 
    console.log(userId);
    const {ID_Company, Name,LastName,Email,Password,Gender,BirthDate,Country,
        Address, ID_Profile} = req.body;  //
    try{
        let user = await User.findByPk(userId);
        
        if(!user){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el cliente con ID = " + userId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = { 
                ID_Company:ID_Company,            
                Name:Name,
                LastName:LastName,
                Email:Email,
                Password:Password,
                Gender:Gender,
                BirthDate:BirthDate,
                Country:Country,
                Address:Address,
                ID_Profile:ID_Profile       
            }
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await user.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_User: userId}
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


async function deleteUser(req, res){
    console.log(req.params.id);
    try{
        let userId = req.params.id;
        let user = await User.findByPk(userId);
       
        if(!user){
            res.status(404).json({
                message: "La compañia con este ID no existe = " + userId,
                error: "404",
            });
        } else {
            await user.destroy();
            res.status(200).send({
                message:"Usuario eliminada con exito"
            });
        }
    } catch(error) {
        res.status(500).json({
            message: "Error -> No se puede eliminar el cliente con el ID = " + req.params.id,
            error: error.message
        });
    }
}



async function desactivateUser(req, res){
   
    let userId = req.params.id; 
  
    const {Active} = req.body;  //
    try{
        let user = await User.findByPk(userId);
        
        if(!user){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el cliente con ID = " + userId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = { 
               
                Active:false          
            }
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await user.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_User: userId},
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

module.exports={
    getUsers,
    signIn, 
    createUser,
    deleteUser,
    updateUser,
    desactivateUser
};