const { custom } = require("joi");
const jwt =require("jwt-simple");
const moment=require("moment");

const SECRET_KEY="GsfsdKdsfsdKfwqQdfLfsdfPfdfxffsPaPxKs";

exports.createAccessToken=function(user){
    //parametros para obtener la informacion del usuario
   const payload={
       id: user._id,
       Email:user.Email,
       Name: user.Name,
       LastName: user.LastName,
       Gender: user.Gender,
       BirthDate: user.BirthDate,
       Country: user.Country,
       Address: user.Address,
       LastLogin: user.LastLogin,
       Active: user.Active,
       Image: user.Image,
       Company: user.Company,
       UserName: user.UserName,
       Rol: user.Rol,
       Profile: user.Profile,
       createToken: moment().unix(),
       exp: moment().add(4,"hours").unix()
   };
   return jwt.encode(payload, SECRET_KEY);
};

exports.createRefreshToken=function(user){
    const payload={
       id: user._id,
       Email:user.Email,
       Name: user.Name,
       exp: moment().add(30,"days").unix()
    };
    return jwt.encode(payload,SECRET_KEY);
};


//DESCODIFICAR TOKEN

exports.decodedToken=function(token){
    return jwt.decode(token, SECRET_KEY,true);
};