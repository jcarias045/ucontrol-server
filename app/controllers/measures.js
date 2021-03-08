const db = require('../config/db.config.js');
const fs =require("fs");
const path=require("path");
const Measures = db.Measure;

function getMeasures(req, res) {
    let companyId = req.params.id;
    try{
        Measures.findAll({
            where: {ID_Company:companyId}
        })
        .then(measures => {
            res.status(200).send({measures});
          
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

function createMeasure(req, res){
    let measure = {};

    try{
        // Construimos el modelo del objeto company para enviarlo como body del request
        measure.Name = req.body.Name;
        measure.Description =req.body.Description;
        measure.ID_Company = req.body.ID_Company;
        measure.state = req.body.state;
        console.log(measure);
        Measures.findOne({where:{
             Name: measure.Name}}).then(function(exist){
                 console.log();
              if(!exist){
                Measures.create(measure)
                .then(result => {    
                  res.status(200).json(result);
              
                });  
              }
              else{
                res.status(505).send({message:"La medida ya fue registrada"})

              }
            });

        // Save to MySQL database
       
    }catch(error){
        res.status(500).json({
            message: "Fail!",
            error: error.message
        });
    }
}


async function updateMeasure(req, res){
   
    let measureId = req.params.id;
  
    
    const { Name,Description} = req.body;  //
   
    try{
        let measure = await Measures.findByPk(measureId);
        console.log(measure);
        if(!measure){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el cliente con ID = " + measureId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = {             
                Name:Name,
               Description:Description
            }
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await Measures.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_Measure: measureId},
                                attributes: [ 'Name','Description']
                              }
                            );

            // retornamos el resultado al cliente
            if(!result) {
                res.status(500).json({
                    message: "Error -> No se puede actualizar el cliente con ID = " + req.params.id,
                    error: "No se puede actualizar",
                });
            }

            res.status(200).json(result);
        }
    } catch(error){
        res.status(500).json({
            message: "Error -> No se puede actualizar el cliente con ID = " + req.params.id,
            error: error.message
        });
    }
}

async function deleteMeasure(req, res){
    console.log(req.params.id);
    try{
        let measureId = req.params.id;
        let measure = await Measures.findByPk(measureId);
       
        if(!measure){
            res.status(404).json({
                message: "La compañia con este ID no existe = " + measureId,
                error: "404",
            });
        } else {
            await measure.destroy();
            res.status(200).send({
                message:"Usuario eliminada con exito"
            });
        }
    } catch(error) {
        res.status(500).json({
            message: "Error -> No se puede eliminar el cliente con el ID = " + req.params.id,
            error: error.message
        });
    }
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