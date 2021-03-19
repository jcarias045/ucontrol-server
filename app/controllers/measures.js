const measure = require('../models/measure.model')
const fs =require("fs");
const path=require("path");


function getMeasures(req, res) {
    measure.find().populate({path: 'Company', model: 'Company'})
    .then(measure => {
        if(!measure){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({measure})
        }
    });
}   

function createMeasure(req, res){
      
    const Measure = new measure();

    const { Name, Description, Company, State } = req.body
        Measure.Name = Name;
        Measure.Description = Description;
        Measure.Company = Company;
        Measure.State =  State;
        
        console.log(Measure);
        Measure.save((err, MeasureStored)=>{
            if(err){
                res.status(500).send({message: err});
            }else{
                if(!MeasureStored){
                    res.status(500).send({message: "Error"});
                }else{
                    res.status(200).send({Measure: MeasureStored})
                }
            }
        });
    
}


async function updateMeasure(req, res){
    let measureData = req.body;
    const params = req.params;

    measure.findByIdAndUpdate({_id: params.id}, measureData, (err, measureUpdate)=>{
        if(err){
            res.status(500).send({message: "Error del Servidor."});
        } else {
            if(!measureUpdate){
                res.status(404).send({message: "No hay"});
            }else{
                res.status(200).send({message: "Measure Actualizado"})
            }
        }
    })
   
}

async function deleteMeasure(req, res){
    const { id } = req.params;
  
    measure.findByIdAndRemove(id, (err, measureDeleted) => {
      if (err) {
        res.status(500).send({ message: "Error del servidor." });
      } else {
        if (!measureDeleted) {
          res.status(404).send({ message: "Medida no encontrado." });
        } else {
          res
            .status(200)
            .send({ message: "La Medida ha sido eliminado correctamente." });
        }
      }
    });
}

function getMeasuresInfo(req,res){
    let companyId = req.params.id;
    try{
        Measures.findAll({where: {ID_Company: companyId},
            attributes:['ID_Measure','Name']})
        .then(measure => {
            res.status(200).send({measure});
          
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
    getMeasures,
    createMeasure,
    updateMeasure,
    deleteMeasure,
    getMeasuresInfo
}