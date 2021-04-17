const User = require('../models/user.model');
const jwt= require('../services/jwt');
const moment= require('moment');

// const User=require('../models/user.model');


function willExpiredToken(token){
    const {exp}=jwt.decodedToken(token);
    const currentDate=moment().unix();
    
    if(currentDate > exp){
        return true;
    }
    return false;
}

function resfreshAccessToken(req,res){
    const { refreshToken } = req.body;
  const isTokenExpired = willExpiredToken(refreshToken);

  if (isTokenExpired) {
    res.status(404).send({ message: "El refreshToken ha expirado" });
  } else {
    const { id } = jwt.decodedToken(refreshToken);

    User.findOne({ _id: id }, (err, userStored) => {
      if (err) {
        res.status(500).send({ message: "Error del servidor." });
      } else {
        if (!userStored) {
          res.status(404).send({ message: "Usuario no encontrado." });
        } else {
          res.status(200).send({
            accessToken: jwt.createAccessToken(userStored),
            refreshToken: refreshToken
          });
        }
      }
    });
  }
}

function resfreshCustomerAccessToken(req,res){

    const {refreshToken} =req.body;
    console.log(refreshToken);
    const isTokenExpired= willExpiredToken(refreshToken);
     if(isTokenExpired){
         res.status(404).send({message:"El Refresh token ha expirado"});
     }
     else{
        const {ID_Customer}=jwt.decodedToken(refreshToken);        
        Customer.findOne({attributes: ['ID_Customer','Name','LastName','User','Email','Country','City','ZipCode','Phone','MobilPhone','idNumber','Images','ID_Company','Access','AccountsReceivable','ID_PaymentTime','ID_User','ID_Discount'],where:{ID_Customer:ID_Customer}})
        .then(function (customerStored){
            console.log(customerStored); 
                if(!customerStored){
                    res.status(404).send({message:"Usuario no encontrado"});
                }
                else{
                    res.status(200).send({
                        accessToken: jwt.createAccessTokenCustomer(customerStored),
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
    resfreshAccessToken,
    resfreshCustomerAccessToken
}