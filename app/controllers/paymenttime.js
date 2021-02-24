const db = require('../config/db.config.js');
const { Op } = require("sequelize");
const PaymentTime = db.PaymentTime;
const Company = db.Company;

function getPaymentTime(req, res) {
    try{
        PaymentTime.findAll({    
             include: [
            {
                 model: Company,
                 attributes: ['ID_Company','Name','ShortName']
             }
            ]
          })
        .then(paymenttime => {
            res.status(200).send({paymenttime});            
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

function createPaymentTime(req, res) {
    let paymenttime = {};
    try{
        // Construimos el modelo del objeto company para enviarlo como body del reques
        paymenttime.Name = req.body.Name;
        paymenttime.Description=req.body.Description;
        paymenttime.ID_Company = req.body.ID_Company;
 
        // Save to MySQL database
        PaymentTime.create(paymenttime)
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

 async function updatePaymentTime(req, res) {

    let paymenttimeID = req.params.id; 
    const { Name, Description, ID_Company} = req.body;  //
    try{
        let paymenttime = await PaymentTime.findByPk(paymenttimeID);
        if(!paymenttime){
           // retornamos el resultado al descuento
            res.status(404).json({
                message: "No se encuentra el descuento con ID = " + paymenttimeID,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = {             
                Name: Name,
                Description: Description,
                ID_Company: ID_Company     
            }
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await paymenttime.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_PaymentTime: paymenttimeID}
                              }
                            );

            // retornamos el resultado al descuento
            if(!result) {
                res.status(500).json({
                    message: "Error -> No se puede actualizar el descuento con ID = " + req.params.id,
                    error: "No se puede actualizar",
                });
            }
            res.status(200).json(result);
        }
    } catch(error){
        res.status(500).json({
            message: "Error -> No se puede actualizar el descuento con ID = " + req.params.id,
            error: error.message
        });
    }
}

async function deletePaymentTime(req, res) {

    try{
        let paymenttimeID = req.params.id;
        let paymenttime = await PaymentTime.findByPk(paymenttimeID);
       
        if(!paymenttime){
            res.status(404).json({
                message: "El Periodo con este ID no existe = " + paymenttimeID,
                error: "404",
            });
        } else {
            await paymenttime.destroy();
            res.status(200).send({
                message:"El Periodo de tiempo fue eliminado con exito"
            });
        }
    } catch(errr) {
        res.status(500).json({
            mesage: "Error -> No se puede eliminar el Periodo con el ID = " + req.params.id,
            error: error.message
        });
    }
}

function getPaymentTimeId (req, res){
    
    let companyId = req.params.id;
    

    try{
        PaymentTime.findAll({
            where:{ID_Company: companyId},
            attributes: ['ID_PaymentTime', 'Name', 'Description']
        })
        .then(paymentTime =>{
            res.status(200).send({paymentTime});
        })

    }catch(error){
        console.log(error);
        res.status(500).json({
            message: "Error en el query!",
            error: error
        })
    }
}

module.exports={
    getPaymentTime,
    createPaymentTime,
    updatePaymentTime,
    deletePaymentTime,
    getPaymentTimeId
};