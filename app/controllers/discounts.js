const Discount =  require("../models/discount.model");


function createDiscount(req, res) {

    const discount = new Discount();

    const { Name, DiscountNumber, Company } = req.body;

    discount.Name = Name;
    discount.DiscountNumber = DiscountNumber;
    discount.Company = Company;
    discount.save((err, discountStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            console.log(discountStored);
            if(!discountStored){
                res.status(500).send({message: "Error"});
            }else{
                res.status(200).send({User: discountStored});
            }
        }
      });
}

function getDiscounts(req,res){
    const {id} = req.params;
    
    Discount.find({Company: id}).populate({path: 'Company', model: 'Company',match: {Company:companyId }})
    .then(discount=>{
        if(!discount){
            res.status(404).send({message:"No hay"});
        }else{
            res.status(200).send({discount})
        }
    })
}

async function deleteDiscount(req,res) {
    const {id} = req.params;

    Discount.findByIdAndDelete(id,(err,discountDeleted)=>{
        if(err){
            res.status(500).send({message:"Error del servidor"});
        }else{
            if(!discountDeleted){
                res.status(404).send({ message: "Compañia no encontrado." });
        } else {
          res
            .status(200)
            .send({ message: "El Descuento ha sido eliminado correctamente." });
        }}
    })
}

async function updateDiscount(req,res) {
    let discountData = req.body;
    const params = req.params;

    Discount.findByIdAndUpdate({_id: params.id}, discountData, (err, discountUpdate)=>{
        if(err){
            res.status(500).send({message: "Error del Servidor."});
        } else {
            if(!discountUpdate){
                res.status(404).send({message: "No hay"});
            }else{
                res.status(200).send({message: "Compañia Actualizada"})
            }
        }
    })
}

function getDiscountId(req,res){
    const {id} = req.params;
    
    Discount.find({Company: id}).populate({path: 'Company', model: 'Company'})
    .then(discount=>{
        if(!discount){
            res.status(404).send({message:"No hay"});
        }else{
            res.status(200).send({discount})
        }
    })
}

module.exports={
    createDiscount,
    getDiscounts,
    deleteDiscount,
    updateDiscount,
    getDiscountId
}














// const db = require('../config/db.config.js');
// const bcrypt=require("bcrypt-nodejs");
// const jwt=require('../services/jwt');
// const { Op } = require("sequelize");
// //Se utiliza DiscountObj porque el parametro Discount y el nombre del objeto no pueden ser iguales.
// const DiscountObj = db.Discount;
// const Company = db.Company;

// function getDiscounts(req, res) {
//     console.log("Descuento");
//     console.log("Probando endpoint");
//     let companyId = req.params.id; 
//     try{
//         DiscountObj.findAll({    
//              include: [
//             {
//                  model: Company,
//                  attributes: ['ID_Company','Name','ShortName']
//              }
//             ],
//             where: {ID_Company: companyId}
//           })
//         .then(discount => {
//             res.status(200).send({discount});            
//         })
//     }catch(error) {
//         // imprimimos a consola
//         console.log(error);

//         res.status(500).json({
//             message: "Error!",
//             error: error
//         });
//     }
// }

// function createDiscount(req, res){
//     let discount = {};
//     try{
//         // Construimos el modelo del objeto company para enviarlo como body del reques
//         discount.Name = req.body.Name;
//         discount.Discount=req.body.Discount;
//         discount.ID_Company = req.body.ID_Company;
 
//         // Save to MySQL database
//         DiscountObj.create(discount)
//       .then(result => {    
//         res.status(200).json(result);
    
//       });  
//     }catch(error){
//         res.status(500).json({
//             message: "Fail!",
//             error: error.message
//         });
//     }
// }


// async function updateDiscount(req, res){
   
//     let discountID = req.params.id; 
//     console.log(discountID);
//     const { Name, Discount, ID_Company} = req.body;  //
//     console.log(Name);
//     console.log(Discount);
//     try{
//         let discount = await DiscountObj.findByPk(discountID);
//         console.log(discount);
//         if(!discount){
//            // retornamos el resultado al descuento
//             res.status(404).json({
//                 message: "No se encuentra el descuento con ID = " + discountID,
//                 error: "404"
//             });
//         } else {    
//             // actualizamos nuevo cambio en la base de datos, definición de
//             let updatedObject = {             
//                 Name: Name,
//                 Discount: Discount,
//                 ID_Company: ID_Company     
//             }
//             console.log(updatedObject);    //agregar proceso de encriptacion
//             let result = await discount.update(updatedObject,
//                               { 
//                                 returning: true,                
//                                 where: {ID_Discount: discountID}
//                               }
//                             );

//             // retornamos el resultado al descuento
//             if(!result) {
//                 res.status(500).json({
//                     message: "Error -> No se puede actualizar el descuento con ID = " + req.params.id,
//                     error: "No se puede actualizar",
//                 });
//             }
//             res.status(200).json(result);
//         }
//     } catch(error){
//         res.status(500).json({
//             message: "Error -> No se puede actualizar el descuento con ID = " + req.params.id,
//             error: error.message
//         });
//     }
// }

// async function deleteDiscount(req, res){
//     console.log(req.params.id);
//     try{
//         let discountID = req.params.id;
//         let discount = await DiscountObj.findByPk(discountID);
       
//         if(!discount){
//             res.status(404).json({
//                 message: "El Descuento fue con este ID no existe = " + discountID,
//                 error: "404",
//             });
//         } else {
//             await discount.destroy();
//             res.status(200).send({
//                 message:"El Descuento fue eliminad con exito"
//             });
//         }
//     } catch(errr) {
//         res.status(500).json({
//             mesage: "Error -> No se puede eliminar el cliente con el ID = " + req.params.id,
//             error: error.message
//         });
//     }
// }

// function getDiscountId (req, res){
    
//     let companyId = req.params.id;

//     try{
//         DiscountObj.findAll({
//             where:{ID_Company: companyId},
//             attributes: ['ID_Discount', 'Name']
//         })
//         .then(discounts =>{
//             res.status(200).json({discounts});
            
//         })
//     }catch(error){
//         console.log(error);
//         res.status(500).json({
//             message: "Error en el query!",
//             error: error
//         })
//     }
// }


// module.exports={
//     getDiscounts,
//     createDiscount,
//     updateDiscount,
//     deleteDiscount,
//     getDiscountId
// }
