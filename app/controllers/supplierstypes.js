const SupplierType = require('../models/suppliertype.model')
const fs =require("fs");
const path=require("path");

function getSupplierTypes(req,res){
    const {id} = req.params;
    console.log(req.params.id);
    console.log(id);
    SupplierType.find({Company: id}).populate({path: 'Company', model: 'Company'})
    .then(supplierType => {
        if(!supplierType){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({supplierType})
        }
    })
}

function createSupplierType(req, res){
    console.log(req.body);
    const supplierType = new SupplierType()

    const {Name, Description, Company} = req.body

    supplierType.Name= Name;
    supplierType.Description= Description;
    supplierType.Company= Company;

         console.log(supplierType);
         supplierType.save((err, SupplierTypeStored)=>{
                if(err){
                    res.status(500).send({message: err});
                }else{
                    if(!SupplierTypeStored){
                        res.status(500).send({message: "Error"});
                    }else{
                        res.status(200).send({supplierType: SupplierTypeStored})
                    }
                }
            });
}

async function deletSupplierType(req, res){
    const { id } = req.params;
  
    SupplierType.findByIdAndRemove(id, (err, supplierTypeDeleted) => {
      if (err) {
        res.status(500).send({ message: "Error del servidor." });
      } else {
        if (!supplierTypeDeleted) {
          res.status(404).send({ message: "Categoría no encontrada." });
        } else {
          res
            .status(200)
            .send({ message: "La Categoría ha sido eliminada correctamente." });
        }
      }
    });
}

async function updateSupplierType(req, res){
    let supplierTypeData = req.body;
    const params = req.params;

    SupplierType.findByIdAndUpdate({_id: params.id}, supplierTypeData, (err, supplierTypeUpdate)=>{
        if(err){
            res.status(500).sen({message: "Error del Servidor."});
        } else {
            if(!supplierTypeUpdate){
                res.status(404).sen({message: "No hay"});
            }else{
                res.status(200).send({message: "Categoría  Actualizado"})
            }
        }
    })
}

// function getCatProductsId(req, res){
//     // Buscamos informacion para llenar el modelo de 
//     let companyId = req.params.id;
//     try{
//         CatProduct.findAll({
//             where:{ID_Company: companyId},
//             attributes:['ID_CatProduct', 'Name']})
//         .then(CatProducts => {
//             res.status(200).send({CatProducts});
          
//         })
//     }catch(error) {
//         // imprimimos a consola
//         console.log(error);

//         res.status(500).json({
//             message: "Error en query!",
//             error: error
//         });
//     }
// }

module.exports={
    getSupplierTypes,
    createSupplierType,
    deletSupplierType,
    updateSupplierType
};
