const db = require('../config/db.config.js');
const bcrypt=require("bcrypt-nodejs");
const jwt=require('../services/jwt');
const { Op } = require("sequelize");
//Se utiliza DiscountObj porque el parametro Discount y el nombre del objeto no pueden ser iguales.
const DiscountObj = db.Discount;
const Company = db.Company;

function getDiscounts(req, res) {
    console.log("Descuento");
    console.log("Probando endpoint");
    try{
        DiscountObj.findAll({    
             include: [
            {
                 model: Company,
                 attributes: ['ID_Company','Name','ShortName']
             }
            ]
          })
        .then(discount => {
            res.status(200).send({discount});            
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

function createDiscount(req, res){
    let discount = {};
    try{
        // Construimos el modelo del objeto company para enviarlo como body del reques
        discount.Name = req.body.Name;
        discount.Discount=req.body.Discount;
        discount.ID_Company = req.body.ID_Company;
 
        // Save to MySQL database
        DiscountObj.create(discount)
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


async function updateDiscount(req, res){
   
    let discountID = req.params.id; 
    console.log(discountID);
    const { Name, Discount, ID_Company} = req.body;  //
    console.log(Name);
    console.log(Discount);
    try{
        let discount = await DiscountObj.findByPk(discountID);
        console.log(discount);
        if(!discount){
           // retornamos el resultado al descuento
            res.status(404).json({
                message: "No se encuentra el descuento con ID = " + discountID,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = {             
                Name: Name,
                Discount: Discount,
                ID_Company: ID_Company     
            }
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await discount.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_Discount: discountID}
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

async function deleteDiscount(req, res){
    console.log(req.params.id);
    try{
        let discountID = req.params.id;
        let discount = await DiscountObj.findByPk(discountID);
       
        if(!discount){
            res.status(404).json({
                message: "El Descuento fue con este ID no existe = " + discountID,
                error: "404",
            });
        } else {
            await discount.destroy();
            res.status(200).send({
                message:"El Descuento fue eliminad con exito"
            });
        }
    } catch(errr) {
        res.status(500).json({
            mesage: "Error -> No se puede eliminar el cliente con el ID = " + req.params.id,
            error: error.message
        });
    }
}

function getDiscountId (req, res){
    
    let companyId = req.params.id;

    try{
        DiscountObj.findAll({
            where:{ID_Company: companyId},
            attributes: ['ID_Discount', 'Name']
        })
        .then(discounts =>{
            res.status(200).json({discounts});
<<<<<<< HEAD
=======
            
>>>>>>> 0e2a8e3610e2bb6fbec41638b39ad1df3db4cbdd
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
    getDiscounts,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    getDiscountId
}
