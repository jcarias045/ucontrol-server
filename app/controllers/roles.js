const db = require('../config/db.config.js');
const { Op } = require("sequelize");

const sequelize = require('sequelize');
const Roles = db.Roles;
const Company = db.Company;
const ProfileOptions=db.ProfileOptions;
const SysOptions = db.SysOptions;
const Grupos = db.Grupos;

function getRolesByCompany(req, res){
    // Buscamos informacion para llenar el modelo de 
   
    let companyId=req.params.id;
    try{
        Roles.findAll({
            where: {
                ID_Company:companyId
            }
        })
        .then(roles => {
            res.status(200).send({roles});
          
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

function getRolesSystem(req, res){
    // Buscamos informacion para llenar el modelo de 
   
    let companyId=req.params.company;
    try{
        Roles.findAll({
            include: [{
                model: Company,
                attributes: ['ID_Company','Name']
            }]
        })
        .then(roles => {
            res.status(200).send({roles});
          
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


async function createRol(req, res){
    let rol = {};
    
    console.log();
    let opciones=req.body.opciones;
    let noCheck=req.body.nocheck;
    console.log(opciones);
    
    try{
        let promises = [];
        let sysOp={};
        // Construimos el modelo del objeto
        rol.Name = req.body.Name;
        rol.Description=req.body.Description;
        rol.ID_Company=req.body.ID_Company;
        rol.State=true;
        let rolId="";
        
        Roles.create(rol)
        .then(async result => {    
        res.status(200).json(result);
          rolId=result.ID_Rol;
          if(opciones.length>0){
              for(let item of opciones){   
                sysOp.ID_Rol=rolId;
                sysOp.ID_OptionMenu=item.id;
                sysOp.Checked=item.checked;
                console.log(sysOp);
                 await ProfileOptions.create(sysOp).then(async result=>{
                     console.log(result);
                 }).catch(err=>{
                     console.log(err);
                    return err.message;
                });
            }
          

          }

          if(noCheck.length>0){
            for(let item of noCheck){   
                sysOp.ID_Rol=rolId;
                sysOp.ID_OptionMenu=item.id;
                sysOp.Checked=item.checked;
                console.log(sysOp);
                 await ProfileOptions.create(sysOp).then(async result=>{
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
        SysOptions.findAll({
            include: [
            {
                model: ProfileOptions,
                required: true,
                on:{
                   
                    ID_OptionMenu: sequelize.where(sequelize.col("sys_profileoption.ID_OptionMenu"), "=", sequelize.col("sys_optionmenu.ID_OptionMenu")),
                    ID_Rol:sequelize.where(sequelize.col("sys_profileoption.ID_Rol"), "=", rolId),
                 }
            },
            {
                model:  Grupos,
                attributes:['Name'],
                required: true,
                on:{
                    
                    ID_Grupo: sequelize.where(sequelize.col("sys_optionmenu.ID_Grupo"), "=", sequelize.col("sys_grupo.ID_Grupo")),
                    
                }
            }
        
        ]
        })
        .then(roles => {
            res.status(200).send({roles});
          
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
    
    let habilitados=req.body.check;
    let deshabilitados=req.body.noCheck;
    
    const { Name,Description,ID_Company} = req.body;  
    try{
        let sysOp={};
        let rol = await Roles.findByPk(rolId);
        let options=await ProfileOptions.findAll({where:{ID_Rol:rolId}});
        if(!rol){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el cliente con ID = " + rolId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = {             
                Name:Name,
                Description:Description,
                ID_Company: ID_Company
               
            }
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await Roles.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_Rol: rolId}
                              }
                            ).then( ProfileOptions.destroy({where:{ID_Rol:rolId}}));
            if(habilitados.length>0){
                for  (const cartItem of habilitados) {
                sysOp.ID_Rol=rolId;
                sysOp.ID_OptionMenu=cartItem.id;
                sysOp.Checked=cartItem.checked;
                console.log(sysOp);
                await ProfileOptions.create(sysOp).then(async result=>{}).catch(err=>{
                    console.log(err);
                    return err.message;
                });
            }
            }
            if(deshabilitados.length>0){
                for  (const cartItem of deshabilitados) {
                sysOp.ID_Rol=rolId;
                sysOp.ID_OptionMenu=cartItem.id;
                sysOp.Checked=cartItem.checked;
                console.log(sysOp);
                await ProfileOptions.create(sysOp).then(async result=>{}).catch(err=>{
                    console.log(err);
                    return err.message;
                });
            }
            }
            

            
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


async function changeStateRol(req,res){
    let rolId = req.params.id; 
    
    const {State} = req.body; 
    
    const { Name,Description,ID_Company} = req.body;  
    try{
        let sysOp={};
        let rol = await Roles.findByPk(rolId);
        
        if(!rol){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el cliente con ID = " + rolId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = {             
               
                State: State
               
            }
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await Roles.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_Rol: rolId}
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
module.exports={
    getRolesByCompany,
    getRolesSystem,
    createRol,
    getOptionsSystemRol,
    updateRol,
    changeStateRol
}