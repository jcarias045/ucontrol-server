const db = require('../config/db.config.js');
const { Op } = require("sequelize");

const sequelize = require('sequelize');
const SysOptions = db.SysOptions;
const ProfileOptions = db.ProfileOptions;
const Grupos = db.Grupos;

function getSystemOptions(req, res){
    // Buscamos informacion para llenar el modelo de 
    try{
        SysOptions.findAll({
            include:[
                {
                   
          model:  Grupos,
          attributes:['Name'],
          on:{
             
              ID_Grupo: sequelize.where(sequelize.col("sys_optionmenu.ID_Grupo"), "=", sequelize.col("sys_grupo.ID_Grupo")),
             
          }
           },
           
          ]
        })
        .then(options => {
            res.status(200).send({options});
          
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

function createProfileOptions(req, res){
    let profileOptions = {};

    try{
        // Construimos el modelo del objeto
        profile.Name = req.body.Name;
        profile.Description=req.body.Description;
    
        // Save to MySQL database
       Profile.create(profile)
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

function getSysUserOptions(req, res){
    let rolId = req.params.id;
    try{
        Grupos.findAll({
            model:  ProfileOptions,
            include: [
              
            {
                group: 'ID_Grupo',   
                model:  SysOptions,
                required: true,
                on:{
                   
                    ID_Grupo: sequelize.where(sequelize.col("sys_optionmenus.ID_Grupo"), "=", sequelize.col("sys_grupos.ID_Grupo")),
                    
                },
                include:[
                      {
                         
                model:  ProfileOptions,
                on:{
                   
                    ID_OptionMenu: sequelize.where(sequelize.col("sys_optionmenus->sys_profileoption.ID_OptionMenu"), "=", sequelize.col("sys_optionmenus.ID_OptionMenu")),
                    ID_Rol: rolId
                },
                required: true
                 },
                 
                ]
            }
        ]
        })
        // SysOptions.findAll({
        //     include: [
        //         {
        //             model:ProfileOptions,
        //             on:{
                   
        //             ID_OptionMenu: sequelize.where(sequelize.col("sys_profileoption.ID_OptionMenu"), "=", sequelize.col("sys_optionmenu.ID_OptionMenu")),
        //             ID_Rol: rolId
        //         }
        //         }
        //     ],
        //     group:'ID_Grupo',
        // })
        .then(options => {
            res.status(200).send(options);
          
        }).catch(err => {
            console.log(err);
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

function getGrupos(req, res){
    try{
        Grupos.findAll()
        .then(grupos => {
            res.status(200).send({grupos});
          
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
async function createSystemGroup(req, res){
    let grupos = {};
    console.log(req.body);  
    try{ 
        // Construimos el modelo del objeto
        grupos.Name = req.body.Name;
        grupos.icon=req.body.icon;
        
        let gruposId="";
        
        Grupos.create(grupos)
        .then(async result => {    
        res.status(200).json(result);
    });  
    }
      
    catch(error){
        res.status(500).json({
            message: "Fail!",
            error: error.message
        });
    }
}
async function createSystemOption(req, res){
    let option = {};
    console.log(req.body);
    
    try{
        
        // Construimos el modelo del objeto
        option.Name = req.body.Name;
        option.URL=req.body.URL;
        option.ID_Grupo=req.body.ID_Grupo;
        option.State=true;
        
        
       
        
        SysOptions.create(option)
        .then(async result => {    
        res.status(200).json(result);
    });  
    }
      
    catch(error){
        res.status(500).json({
            message: "Fail!",
            error: error.message
        });
    }
}

async function updateGrupo(req, res){
   
    let grupoId = req.params.id; 
    
    const { Name,icon} = req.body;  
    try{
        let sysOp={};
        let grupos = await Grupos.findByPk(grupoId);
        
        if(!grupos){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el cliente con ID = " + grupoId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = {             
                Name:Name,
               
                icon: icon
               
            }
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await Grupos.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_Grupo: grupoId}
                              }
                            )
    
            
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


async function updateOption(req, res){
   
    let optionId = req.params.id; 
    
    const { Name,URL,ID_Grupo} = req.body;  
    try{
        let sysOp={};
        let option = await SysOptions.findByPk(optionId);
        
        if(!option){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el cliente con ID = " + optionId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = {             
                Name:Name,
                URL:URL,
                ID_Grupo: ID_Grupo
               
            }
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await SysOptions.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_OptionMenu: optionId}
                              }
                            ).catch(err => { console.log(err);})
    
            
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

async function changeStateOption(req, res){
   
    let optionId = req.params.id; 
    
    const {State} = req.body;  //
    try{
        let sysOp={};
        let option = await SysOptions.findByPk(optionId);
        
        if(!option){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el cliente con ID = " + optionId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = {             
                
               State:State
            }
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await SysOptions.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_OptionMenu: optionId}
                              }
                            ).catch(err => { console.log(err);})
    
            
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
    getSystemOptions,
    getSysUserOptions,
    getGrupos,
    createSystemGroup,
    createSystemOption,
    updateGrupo,
    updateOption,
    changeStateOption
};
