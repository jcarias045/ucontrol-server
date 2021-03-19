const job = require('../models/job.model')
const bcrypt=require("bcrypt-nodejs");
const jwt=require('../services/jwt');


//Se utiliza DiscountObj porque el parametro Discount y el nombre del objeto no pueden ser iguales.


function getJobs(req, res) {
    job.find( {Company: req.params.id} )
    .then(job => {
        if(!job){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({job})
        }
    });
}

function createJob(req, res){
    const Job = new job();

    const {Name, Description, Estado, Company} = req.body

    Job.Name= Name
    Job.Description= Description;
    Job.Estado= Estado;
    Job.Company=Company;

    console.log(Job);
    Job.save((err, JobStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!JobStored){
                res.status(500).send({message: "Error"});
            }else{
                res.status(200).send({Job: JobStored})
            }
        }
    });
}


function updateJob(req, res){
   
    let jobData = req.body;
    const params = req.params;

    job.findByIdAndUpdate({_id: params.id}, jobData, (err, jobUpdate)=>{
        if(err){
            res.status(500).sen({message: "Error del Servidor."});
        } else {
            if(!jobUpdate){
                res.status(404).sen({message: "No hay"});
            }else{
                res.status(200).send({message: "Trabajo Actualizado"})
            }
        }
    })
}

function deleteJob(req, res){
    const { id } = req.params;
  
    job.findByIdAndRemove(id, (err, jobDeleted) => {
      if (err) {
        res.status(500).send({ message: "Error del servidor." });
      } else {
        if (!jobDeleted) {
          res.status(404).send({ message: "Plaza no encontrada." });
        } else {
          res
            .status(200)
            .send({ message: "La plaza ha sido eliminada correctamente." });
        }
      }
    });
}

async function desactivateJob(req, res) {
   
    let jobId = req.params.id; 
  
    const {Estado} = req.body;  //
    try{
        
        await job.findByIdAndUpdate(jobId, {Estado}, (JobStored) => {
            if (!JobStored) {
                res.status(404).send({ message: "No se ha encontrado la plaza." });
            }
            else if (Estado === false) {
                res.status(200).send({ message: "Plaza desactivada correctamente." });
            }
        })
        
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