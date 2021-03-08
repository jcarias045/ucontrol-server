const db = require('../config/db.config.js');
const bcrypt=require("bcrypt-nodejs");
const jwt=require('../services/jwt');
const { Op } = require("sequelize");
//Se utiliza DiscountObj porque el parametro Discount y el nombre del objeto no pueden ser iguales.
const Brand = db.Brand;
const Company = db.Company;

function getBrands(req,res){
    let companyId = req.params.id; 
    try{
        Brand.findAll({    
             include: [
            {
                 model: Company,
                 attributes: ['ID_Company','Name','ShortName']
             }
            ],
            where: {ID_Company: companyId}
          })
        .then(brand => {
            res.status(200).json({brand});            
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

function createBrands(req,res){
    console.log("hola");
    let brand = {};
    try{
        // Construimos el modelo del objeto company para enviarlo como body del reques
        brand.Name = req.body.Name;
        brand.Description = req.body.Description;
        brand.ID_Company=req.body.ID_Company;
        console.log(brand);
        // Save to MySQL database
        Brand.create(brand)
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

async function updateBrand(req,res){
    let brandId = req.params.id; 
    console.log(brandId);
    const { Name, Description} = req.body;  //
    console.log(Name);
    console.log(Description);
    try{
        let brand = await Brand.findByPk(brandId);
        console.log(brand);
        if(!brand){
           // retornamos el resultado al descuento
            res.status(404).json({
                message: "No se encuentra el banco con ID = " + brandId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = {             
                Name: Name,
                Description: Description    
            }
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await brand.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_Brand: brandId}
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

async function deleteBrand(req, res){
    console.log(req.params.id);
    try{
        let brandId = req.params.id;
        let brand = await Brand.findByPk(brandId);
       
        if(!brand){
            res.status(404).json({
                message: "La Marca con este ID no existe = " + bankId,
                error: "404",
            });
        } else {
            await brand.destroy();
            res.status(200).send({
                message:"La Marca fue eliminad con exito"
            });
        }
    } catch(errr) {
        res.status(500).json({
            mesage: "Error -> No se puede eliminar el banco con el ID = " + req.params.id,
            error: error.message
        });
    }
}

function getBrandId (req, res){
    
    let companyId = req.params.id;

    try{
        Brand.findAll({
            where:{ID_Company: companyId},
            attributes: ['ID_Brand', 'Name']
        })
        .then(brand =>{
            res.status(200).json({brand});
            
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
    getBrands,
    getBrandId,
    createBrands,
    deleteBrand,
    updateBrand
}