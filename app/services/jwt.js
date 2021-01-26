const jwt =require("jwt-simple");
const moment=require("moment");

const SECRET_KEY="GsfsdKdsfsdKfwqQdfLfsdfPfdfxffsPaPxKs";

exports.createAccessToken=function(user){
    //parametros para obtener la informacion del usuario
   const payload={
       Email:user.Email,
       Name: user.Name,
       LastName: user.LastName,
       ID_User:user.ID_User,
 
       createToken: moment().unix(),
       exp: moment().add(1,"hours").unix()


   };
   return jwt.encode(payload, SECRET_KEY);
};

exports.createRefreshToken=function(user){
    const payload={
        id:user._id,
        exp: moment().add(30,"days").unix()
    };
    return jwt.encode(payload,SECRET_KEY);
};


//DESCODIFICAR TOKEN

exports.decodedToken=function(token){
    return jwt.decode(token, SECRET_KEY,true);
};