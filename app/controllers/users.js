const db = require('../config/db.config.js');
const bcrypt=require("bcrypt-nodejs");
const jwt=require('../services/jwt');

const User = db.User;


//Seleccionar TODOS
function users (req, res)  {
    // Buscamos informacion para llenar el modelo de Users
    try{
        User.findAll({attributes: ['ID_User', 'Email']})
        .then(users => {
            res.status(200).json(users);
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





module.exports={
    users,
    signIn
};