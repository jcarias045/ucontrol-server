const db = require('../config/db.config.js');
const jwt= require('../services/jwt');
const moment= require('moment');
const User = db.User;


function willExpiredToken(token){
    const {exp}=jwt.decodedToken(token);
    const currentDate=moment().unix();
    
    if(currentDate > exp){
        return true;
    }
    return false;
}

function resfreshAccessToken(req,res){

    const {refreshToken} =req.body;
    console.log(refreshToken);
    const isTokenExpired= willExpiredToken(refreshToken);
     if(isTokenExpired){
         res.status(404).send({message:"El Refresh token ha expirado"});
     }
     else{
        const {ID_User}=jwt.decodedToken(refreshToken);
        
        User.findOne({attributes: ['Email','Password','Name','LastName','ID_User'],where:{ID_User:ID_User}})
        .then(function (userStored){
            console.log(userStored); 
                if(!userStored){
                    res.status(404).send({message:"Usuario no encontrado"});
                }
                else{
                    res.status(200).send({
                        accessToken: jwt.createAccessToken(userStored),
                        refreshToken: refreshToken
                    });
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
}


module.exports={
    resfreshAccessToken
}