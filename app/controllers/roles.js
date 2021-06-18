// const db = require('../config/db.config.js');
// const { Op } = require("sequelize");

// const sequelize = require('sequelize');
// const Roles = db.Roles;
// const Company = db.Company;
// const ProfileOptions=db.ProfileOptions;
// const SysOptions = db.SysOptions;
const Roles = require('../models/rol.model');
const SysOptions= require('../models/systemOp.model');
const profileOptions = require('../models/profileOptions.model')

function getRolesByCompany(req, res){
    // Buscamos informacion para llenar el modelo de 
    Roles.find({Company: req.params.id}).populate({path: 'Company', model: 'Company'})
    .then(roles => {
        if(!roles){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({roles})
        }
    });
   
}

function getRolesSystem(req, res){

    Roles.find().populate({path: 'Company', model: 'Company'})
    .then(roles => {
        if(!roles){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({roles})
        }
    });
}

async function createRol(req, res){
    
    const rol = new Roles();
    const sysOp = new profileOptions();
    let opciones=req.body.opciones;  //opciones que si fueron seleccionadas
    let noCheck=req.body.nocheck;  //las opciones que no fueron seleccionadas
    console.log(opciones);
    
    try{
        let promises = [];
        let sysOp={};
        // Construimos el modelo del objeto
        rol.Name = req.body.Name;
        rol.Description=req.body.Description;
        rol.Company=req.body.Company;
        rol.State=true;
        let rolId="";
        
        rol.save(rol)
        .then(async result => {    
        res.status(200).json(result);
          rolId=result._id;
          //proceso para crear los accesos a las opciones del sistema
          if(opciones.length>0){  //ingreso de las opciones que fueron seleccionadas (estado true)
              for(let item of opciones){   
                sysOp.Rol=rolId;
                sysOp.OpMenu=item.id;
                sysOp.Checked=item.checked;
                console.log(sysOp);
                 await profileOptions.insertMany(sysOp).then(async result=>{
                     console.log(result);
                 }).catch(err=>{
                     console.log(err);
                    return err.message;
                });
            }
          

          }

          if(noCheck.length>0){  //ingreso de las opciones que NO fueron seleccionadas (estado false)
            for(let item of noCheck){   
                sysOp.Rol=rolId;
                sysOp.OpMenu=item.id;
                sysOp.Checked=item.checked;
                console.log(sysOp);
                 await profileOptions.insertMany(sysOp).then(async result=>{
                     console.log(result);
                 }).catch(err=>{
                     console.log(err);
                    return err.message;
                });
        }
    }
          
          
          
      });  
    }
      
    catch(error){
        res.status(500).json({
            message: "Fail!",
            error: error.message
        });
    }
}

function getOptionsSystemRol(req, res){
    // Buscamos informacion para llenar el modelo de 
   
    let rolId=req.params.id;
    try{
        profileOptions.find({Rol: rolId})
        .populate({path: 'Rol', model: 'Rol'})
        .populate({path: 'OpMenu', populate: {path:'Grupos'}})
        .then(roles => {
            // if(roles.Checked===true){
                res.status(200).send({roles});
            // }
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

async function updateRol(req, res){
   
   
    let rolId = req.params.id;     
    let habilitados=req.body.check; //seleccionados
    let deshabilitados=req.body.noCheck; //no seleccionados

    const {Description,Name}=req.body;

    let sysOp ={};
    let rol = await Roles.findById(rolId);
    let options = await profileOptions.find({Rol: rolId});
    
    profileOptions.remove({Rol:rolId}).then(async function(result) {  //eliminamos todas las opciones enlazadas a ese rol para volver a insertar
       
        if(result){
             Roles.findByIdAndUpdate({_id:rolId},{Description:Description, Name:Name}).catch(function (err){return err})

            if(habilitados.length>0){  //ingreso de opciones seleccionadas
                for(let item of habilitados){   
                  sysOp.Rol=rolId;
                  sysOp.OpMenu=item.id;
                  sysOp.Checked=item.checked;
                   await profileOptions.insertMany(sysOp).then(async result=>{
                      
                   }).catch(err=>{
                       
                      return err.message;
                  });
              }
            
  
            }
  
            if(deshabilitados.length>0){ //ingreso de opciones no seleccionadas
              for(let item of deshabilitados){   
                  sysOp.Rol=rolId;
                  sysOp.OpMenu=item.id;
                  sysOp.Checked=item.checked;
                  console.log(sysOp);
                   await profileOptions.insertMany(sysOp).then(async result=>{
                       console.log(result);
                   }).catch(err=>{
                       console.log(err);
                      return err.message;
                  });
          }
      }
        }
        res.status(200).json(result);
    })

  
}

async function changeStateRol(req,res){
    
    let rolId = req.params.id; 
  
    const {State} = req.body;  //
    try{
        
        await Roles.findByIdAndUpdate(rolId, {State}, (supplierStored) => {
            if (!supplierStored) {
                res.status(404).send({ message: "No se ha encontrado el rol." });
            }
            else if (Active === false) {
                res.status(200).send({ message: "Rol desactivado correctamente." });
            }
        })
        
    } catch(error){
        res.status(500).json({
            message: "Error -> No se puede actualizar el rol con ID = " + req.params.id,
            error: error.message
        });
    }
}

async function opciones(req, res){
      // Buscamos informacion para llenar el modelo de 
   
      let rolId=req.params.id;
      try{
          profileOptions.find({Rol: rolId})
          .populate({path: 'Rol', model: 'Rol'})
          .populate({path: 'OpMenu', populate: {path:'Grupos'}})
          .then(roles => {
            var filtered = roles.filter(function (item) {
                return item.Checked ===true;
              });
              let opciones=[];
              filtered.map(item=>{
                opciones.push(item.OpMenu);
              })
            
              SysOptions.find()
              .populate({path: "Grupos", model: "Grupos"})
              .then(sysOptions => {
                 opciones.push({sistema: sysOptions});
                 opciones.map(item =>{
                     console.log(item);
                 })
                 var filtered = roles.filter(function (item) {
                    return item.Checked ===true;
                  });
                  res.status(200).send({opciones});
              })
              
                
              
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
    getRolesByCompany,
    getRolesSystem,
    createRol,
    getOptionsSystemRol,
    updateRol,
    changeStateRol,
    opciones
}
