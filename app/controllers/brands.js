const brand = require('../models/brand.model')
const bcrypt=require("bcrypt-nodejs");
const jwt=require('../services/jwt');


function getBrands(req,res){
    brand.find({Company: req.params.id}).populate({path: 'Company', model: 'Company'})
    .then(brand => {
        if(!brand){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({brand})
        }
    });
}

function createBrands(req,res){
    const Brand = new brand()
    const { Name, Description, Company } = req.body

    Brand.Name= Name
    Brand.Description= Description;
    Brand.Company=Company;

    console.log(Brand);
    Brand.save((err, BrandStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!BrandStored){
                res.status(500).send({message: "Error"});
            }else{
                res.status(200).send({Brand: BrandStored})
            }
        }
    });
}

async function updateBrand(req,res){
    let brandData = req.body;
    const params = req.params;

    brand.findByIdAndUpdate({_id: params.id}, brandData, (err, brandUpdate)=>{
        if(err){
            res.status(500).send({message: "Error del Servidor."});
        } else {
            if(!brandUpdate){
                res.status(404).send({message: "No hay"});
            }else{
                res.status(200).send({message: "Marca Actualizada"})
            }
        }
    })
}

async function deleteBrand(req, res){
    const { id } = req.params;
  
    brand.findByIdAndRemove(id, (err, brandDeleted) => {
      if (err) {
        res.status(500).send({ message: "Error del servidor." });
      } else {
        if (!brandDeleted) {
          res.status(404).send({ message: "Marca no encontrada." });
        } else {
          res
            .status(200)
            .send({ message: "La Marca ha sido eliminada correctamente." });
        }
      }
    });
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

function getBrand (req, res){
    let brandId = req.params.id;

    try{
        Brand.findByPk(brandId,{
            attributes:['ID_Brand','Name','Description'],
            where: {ID_Brand: brandId}
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

module.exports={
    getBrands,
    getBrandId,
    createBrands,
    deleteBrand,
    updateBrand,
    getBrand
}