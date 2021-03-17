const bodega = require('../models/bodega.model')
const bcrypt=require("bcrypt-nodejs");
const jwt=require('../services/jwt');


function getBodega(req, res) {
    bodega.find()
    .then(bodega => {
        if(!bodega){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({bodega})
        }
    });
}

function createBodega(req, res){
    const Bodega = new bodega()

   const {Name, IdCompany, State} = req.body

   Bodega.Name = Name;
   Bodega.IdCompany = IdCompany,
   Bodega.State = State;

   console.log(Bodega);
   Bodega.save((err, BodegaStored)=>{
       if(err){
           res.status(500).send({message: err});
       }else{
           if(!BodegaStored){
               res.status(500).send({message: "Error"});
           }else{
               res.status(200).send({Bodega: BodegaStored})
           }
       }
   });
}


function updateBodega(req, res){
    let bodegaData = req.body;
    const params = req.params;

   bodega.findByIdAndUpdate({_id: params.id}, bodegaData, (err,bodegaUpdate)=>{
        if(err){
            res.status(500).sen({message: "Error del Servidor."});
        } else {
            if(!bodegaUpdate){
                res.status(404).sen({message: "No hay"});
            }else{
                res.status(200).send({message: "Bodega Actualizada"})
            }
        }
    })
}

async function deleteBodega(req, res){
    const { id } = req.params;
  
    bodega.findByIdAndRemove(id, (err, bodegaDeleted) => {
      if (err) {
        res.status(500).send({ message: "Error del servidor." });
      } else {
        if (!bodegaDeleted) {
          res.status(404).send({ message: "Bodega no encontrada." });
        } else {
          res
            .status(200)
            .send({ message: "La Bodega ha sido eliminada correctamente." });
        }
      }
    });
}

function getBodegaId (req, res){
    
    let companyId = req.params.id;

    try{
        Bodega.findAll({
            where:{ID_Company: companyId},
            attributes: ['ID_Bodega', 'Name']
        })
        .then(bodega =>{
            res.status(200).json({bodega});
            
        })
    }catch(error){
        console.log(error);
        res.status(500).json({
            message: "Error en el query!",
            error: error
        })
    }
}

async function desactivate (req,res){
    let bodegaId = req.params.id; 
  
    const {State} = req.body;  //
    try{
        
        await bodega.findByIdAndUpdate(bodegaId, {State}, (bodegaStored) => {
            if (!bodegaStored) {
                res.status(404).send({ message: "No se ha encontrado la Bodega." });
            }
            else if (State === false) {
                res.status(200).send({ message: "Bodega desactivada correctamente." });
            }
        })
        
    } catch(error){
        res.status(500).json({
            message: "Error -> No se puede actualizar el usuario con ID = " + req.params.id,
            error: error.message
        });
    }
}

module.exports={
    getBodega,
    createBodega,
    updateBodega,
    deleteBodega,
    getBodegaId,
    desactivate
}
