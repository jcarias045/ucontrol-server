const db = require('../config/db.config.js');
const bcrypt=require("bcrypt-nodejs");
const jwt=require('../services/jwt');
const { Op } = require("sequelize");
//Se utiliza DiscountObj porque el parametro Discount y el nombre del objeto no pueden ser iguales.
const Job = db.Job;
const Company = db.Company;

function getJobs(req, res) {
    try{
        Job.findAll({    
             include: [
            {
                 model: Company,
                 attributes: ['ID_Company','Name','ShortName']
             }
            ]
          })
        .then(job => {
            res.status(200).send({job});            
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

function createJob(req, res){
    let job = {};
    job.Estado = true;
    try{
        // Construimos el modelo del objeto company para enviarlo como body del reques
        job.Name = req.body.Name;
        job.Description=req.body.Description;
        job.ID_Company = req.body.ID_Company;
 
        // Save to MySQL database
        Job.create(job)
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


async function updateJob(req, res){
   
    let jobId = req.params.id; 
    console.log(jobId);
    const { Name, Description} = req.body;  //
    console.log(Name);
    console.log(Description);
    try{
        let job = await Job.findByPk(jobId);
        console.log(job);
        if(!job){
           // retornamos el resultado al descuento
            res.status(404).json({
                message: "No se encuentra el descuento con ID = " + jobId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = {             
                Name: Name,
                Description: Description,     
            }
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await job.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_job: jobId}
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

async function deleteJob(req, res){
    console.log(req.params.id);
    try{
        let jobId = req.params.id;
        let job = await Job.findByPk(jobId);
       
        if(!job){
            res.status(404).json({
                message: "El Descuento fue con este ID no existe = " + jobId,
                error: "404",
            });
        } else {
            await job.destroy();
            res.status(200).send({
                message:"La plaza fue eliminad con exito"
            });
        }
    } catch(errr) {
        res.status(500).json({
            mesage: "Error -> No se puede eliminar el cliente con el ID = " + req.params.id,
            error: error.message
        });
    }
}

async function desactivateJob(req, res){
   
    let jobId = req.params.id; 
  
    const {Estado} = req.body;  //
    try{
        let job = await Job.findByPk(jobId);
        
        if(!job){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el cliente con ID = " + jobId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = {      
                Estado:Estado          
            }
               //agregar proceso de encriptacion
            let result = await job.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_Job: jobId},
                                attributes:['Estado' ]
                              }
                            );

            // retornamos el resultado al cliente
            if(!result) {
                res.status(500).json({
                    message: "Error -> No se puede actualizar el usuario con ID = " + req.params.id,
                    error: "No se puede actualizar",
                });
            }

            res.status(200).json(result);
        }
    } catch(error){
        res.status(500).json({
            message: "Error -> No se puede actualizar el usuario con ID = " + req.params.id,
            error: error.message
        });
    }
}

function getJobId (req, res){
    
    let companyId = req.params.id;

    try{
        Job.findAll({
            where:{ID_Company: companyId},
            attributes: ['ID_Job', 'Name']
        })
        .then(jobs =>{
            res.status(200).json({jobs});
            
        })
    }catch(error){
        console.log(error);
        res.status(500).json({
            message: "Error en el query!",
            error: error
        })
    }
}


function getJobsInfo(req, res) {
    let companyId = req.params.id;
    try{
        Job.findAll({    
            where: {ID_Company: companyId}
          })
        .then(job => {
            res.status(200).send({job});            
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

module.exports = {
    getJobs,
    createJob,
    updateJob,
    deleteJob,
    desactivateJob,
    getJobId
}