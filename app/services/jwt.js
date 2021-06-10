const { custom } = require("joi");
const jwt =require("jwt-simple");
const moment=require("moment");

const SECRET_KEY="gR7cH9SvfjdJLe4c186Ghs48hheb3902nh5DsA";

exports.createAccessToken=function(user){
    //parametros para obtener la informacion del usuario
   const payload={
       id: user._id,
       Email:user.Email,
       Name: user.Name,
       LastName: user.LastName,
       LastLogin: user.LastLogin,
       Active: user.Active,
       Image: user.Image,
       Company: user.Company._id,
       UserName: user.UserName,
       Rol: user.Rol,
       Profile: user.Profile.Name,
       CompanyName:user.Company.Name, 
       Logo:user.Company.Logo, 
       createToken: moment().unix(), 
       exp: moment()
       .add(1, "hours")
    //    .add(60, 'seconds')
       .unix()
   };
   return jwt.encode(payload, SECRET_KEY);
};

exports.createRefreshToken=function(user){
    const payload={
       id: user._id,
      
       exp: moment()
       .add(30,"days")
    // .add(120, 'seconds')
       .unix()
    };
    return jwt.encode(payload,SECRET_KEY);
};


//DESCODIFICAR TOKEN

exports.decodedToken=function(token){
    return jwt.decode(token, SECRET_KEY,true);
};