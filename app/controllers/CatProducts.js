const catproduct = require('../models/catpoduct.model')
const fs =require("fs");
const path=require("path");

function getCatProducts(req,res){
    const {id} = req.params;
    console.log(req.params.id);
    console.log(id);
    catproduct.find({Company: id}).populate({path: 'Company', model: 'Company'})
    .then(CatProduct => {
        if(!CatProduct){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({CatProduct})
        }
    })
}

function createCatProduct(req, res){
    console.log(req.body);
    const CatProduct = new catproduct()

    const {Name, Description, Company} = req.body

         CatProduct.Name= Name;
         CatProduct.Description= Description;
         CatProduct.Company= Company;

         console.log(CatProduct);
            CatProduct.save((err, CatProductStored)=>{
                if(err){
                    res.status(500).send({message: err});
                }else{
                    if(!CatProductStored){
                        res.status(500).send({message: "Error"});
                    }else{
                        res.status(200).send({CatProduct: CatProductStored})
                    }
                }
            });
}

async function deleteCatProduct(req, res){
    const { id } = req.params;
  
    catproduct.findByIdAndRemove(id, (err, catproductDeleted) => {
      if (err) {
        res.status(500).send({ message: "Error del servidor." });
      } else {
        if (!catproductDeleted) {
          res.status(404).send({ message: "Categoría no encontrada." });
        } else {
          res
            .status(200)
            .send({ message: "La Categoría ha sido eliminada correctamente." });
        }
      }
    });
}

async function updateCatProduct(req, res){
    let catproductData = req.body;
    const params = req.params;

    catproduct.findByIdAndUpdate({_id: params.id}, catproductData, (err, catproductUpdate)=>{
        if(err){
            res.status(500).sen({message: "Error del Servidor."});
        } else {
            if(!catproductUpdate){
                res.status(404).sen({message: "No hay"});
            }else{
                res.status(200).send({message: "Categoría  Actualizado"})
            }
        }
    })
}

function getCatProductsId(req, res){
    // Buscamos informacion para llenar el modelo de 
    let companyId = req.params.id;
    try{
        CatProduct.findAll({
            where:{ID_Company: companyId},
            attributes:['ID_CatProduct', 'Name']})
        .then(CatProducts => {
            res.status(200).send({CatProducts});
          
        })
    }catch(error) {
        // imprimimos a consola
        console.log(error);

        res.status(500).json({
            message: "Error en query!",
            error: error
        });
    }
}

module.exports={
    getCatProducts,
    createCatProduct,
    deleteCatProduct,
    updateCatProduct,
    getCatProductsId
};






// function getCatProductsId(req, res){
//     // Buscamos informacion para llenar el modelo de 
//     try{
//         CatProduct.findAll({attributes:['ID_CatProduct']})
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

// module.exports={
//     getCatProducts,
//     creatCatProduct,
//     updateCatProduct,
//     deleteCatProduct,
//     getCatProductsId,
// };