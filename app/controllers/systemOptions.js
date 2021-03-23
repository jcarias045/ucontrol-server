const SysOptions = require('../models/systemOp.model');
const ProfileOptions = require('../models/profileOptions.model');
const Grupos = require('../models/grupos.model');

// const db = require('../config/db.config.js');
// const { Op } = require("sequelize");

// const sequelize = require('sequelize');
// const SysOptions = db.SysOptions;
// const ProfileOptions = db.ProfileOptions;
// const Grupos = db.Grupos;

function getSystemOptions(req, res){

    try{
        SysOptions.find().populate({path: "Grupos", model: "Grupos"})
        .then(sysOptions => {
            res.status(200).send({sysOptions});
          
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
        Grupos.find().populate()
        .then(Grupos => {
            res.status(200).send({Grupos});
          
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
    // let grupos = {};
    console.log(req.body);  
    const grupos = new Grupos();
        // Construimos el modelo del objeto
        grupos.Name = req.body.Name;
        grupos.icon=req.body.icon;
        
        grupos.save((err, GruposStored)=>{
            if(err){
                res.status(500).send({message: err});
            }else{
                if(!GruposStored){
                    res.status(500).send({message: "Error"});
                }else{
                    res.status(200).send({Grupos: GruposStored})
                }
            }
        });
}

async function createSystemOption(req, res){
    // let option = {};
    console.log(req.body);
    const sysOptions = new SysOptions();
    try{
        // Construimos el modelo del objeto
        sysOptions.Name = req.body.Name;
        sysOptions.URL=req.body.URL;
        sysOptions.Grupos = req.body.Grupos;
        sysOptions._id=req.body._id;
        sysOptions.State=true;
              
        SysOptions.create(sysOptions)
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


// const db = require('../config/db.config.js');
// const { Op } = require("sequelize");

// const sequelize = require('sequelize');
// const SysOptions = db.SysOptions;
// const ProfileOptions = db.ProfileOptions;
// const Grupos = db.Grupos;

// function getSystemOptions(req, res){
//     // Buscamos informacion para llenar el modelo de 
//     try{
//         SysOptions.findAll()
//         .then(options => {
//             res.status(200).send({options});
          
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

// function createProfileOptions(req, res){
//     let profileOptions = {};

//     try{
//         // Construimos el modelo del objeto
//         profile.Name = req.body.Name;
//         profile.Description=req.body.Description;
    
//         // Save to MySQL database
//        Profile.create(profile)
//       .then(result => {    
//         res.status(200).json(result);
    
//       });  
//     }catch(error){
//         res.status(500).json({
//             message: "Fail!",
//             error: error.message
//         });
//     }
// }

// function getSysUserOptions(req, res){
//     let rolId = req.params.id;
//     try{
//         Grupos.findAll({
           
//             include: [
              
//             {
//                 group: 'ID_Grupo',   
//                 model:  SysOptions,
//                 on:{
                   
//                     ID_Grupo: sequelize.where(sequelize.col("sys_optionmenus.ID_Grupo"), "=", sequelize.col("sys_grupos.ID_Grupo")),
                    
//                 },
//                 include:[
//                       {
                         
//                 model:  ProfileOptions,
//                 on:{
                   
//                     ID_OptionMenu: sequelize.where(sequelize.col("sys_optionmenus->sys_profileoption.ID_OptionMenu"), "=", sequelize.col("sys_optionmenus.ID_OptionMenu")),
//                     ID_Rol: rolId
//                 }
//                  },
                 
//                 ]
//             }
//         ]
//         })
//         // SysOptions.findAll({
//         //     include: [
//         //         {
//         //             model:ProfileOptions,
//         //             on:{
                   
//         //             ID_OptionMenu: sequelize.where(sequelize.col("sys_profileoption.ID_OptionMenu"), "=", sequelize.col("sys_optionmenu.ID_OptionMenu")),
//         //             ID_Rol: rolId
//         //         }
//         //         }
//         //     ],
//         //     group:'ID_Grupo',
//         // })
//         .then(options => {
//             res.status(200).send(options);
          
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
//     getSystemOptions,
//     getSysUserOptions
// };
