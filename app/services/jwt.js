const { custom } = require("joi");
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
       ID_Company:user.ID_Company,
       ID_Profile:user.ID_Profile,
       ID_Rol:user.ID_Rol,
       createToken: moment().unix(),
       exp: moment().add(1,"hours").unix()
   };
   return jwt.encode(payload, SECRET_KEY);
};

exports.createAccessTokenCustomer= function(customer){
    console.log("ProbandoToken");
    const payload={
        ID_Customer: customer.ID_Customer,
        Name: customer.Name,
        LastName: customer.LastName,
        User: customer.User,
        Email: customer.Email,
        Country: customer.Country,
        City: customer.City,
        ZipCode: customer.ZipCode,
        Phone: customer.Phone,
        MobilPhone: customer.MobilPhone,
        idNumber: customer.idNumber,
        Images: customer.Images,
        ID_Company: customer.ID_Company,
        Access: customer.Access,
        AccountReceivable: customer.AccountReceivable,
        ID_PaymentTime: customer.ID_PaymentTime,
        ID_User: customer.ID_User,
        ID_Discount: customer.ID_Discount,
        createToken: moment().unix(),
        exp: moment().add(30,"minutes").unix()
    };

    return jwt.encode(payload, SECRET_KEY);
}

exports.createRefreshTokenCustomer = function (customer) {

    const payload={
        ID_Customer: customer.ID_Customer,
        Name: customer.Name,
        LastName: customer.LastName,
        User: customer.User,
        Email: customer.Email,
        Country: customer.Country,
        City: customer.City,
        ZipCode: customer.ZipCode,
        Phone: customer.Phone,
        MobilPhone: customer.MobilPhone,
        idNumber: customer.idNumber,
        Images: customer.Images,
        ID_Company: customer.ID_Company,
        Access: customer.Access,
        AccountReceivable: customer.AccountReceivable,
        ID_PaymentTime: customer.ID_PaymentTime,
        ID_User: customer.ID_User,
        ID_Discount: customer.ID_Discount,
        exp: moment().add(60,"days").unix()
    };

    return jwt.encode(payload,SECRET_KEY);

}

exports.createRefreshToken=function(user){
    const payload={
       Email:user.Email,
       Name: user.Name,
       LastName: user.LastName,
       ID_User:user.ID_User,
       ID_Company:user.ID_Company,
       ID_Profile:user.ID_Profile,
       ID_Rol:user.ID_Rol,
       exp: moment().add(30,"days").unix()
    };
    return jwt.encode(payload,SECRET_KEY);
};


//DESCODIFICAR TOKEN

exports.decodedToken=function(token){
    return jwt.decode(token, SECRET_KEY,true);
};