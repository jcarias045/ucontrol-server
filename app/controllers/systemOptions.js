const db = require('../config/db.config.js');
const { Op } = require("sequelize");

const sequelize = require('sequelize');
const SysOptions = db.SysOptions;
const ProfileOptions = db.ProfileOptions;
const Grupos = db.Grupos;

function getSystemOptions(req, res){
    // Buscamos informacion para llenar el modelo de 
    try{
        SysOptions.findAll()
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
           
            include: [
              
            {
                group: 'ID_Grupo',   
                model:  SysOptions,
                on:{
                   
                    ID_Grupo: sequelize.where(sequelize.col("sys_optionmenus.ID_Grupo"), "=", sequelize.col("sys_grupos.ID_Grupo")),
                    
                },
                include:[
                      {
                         
                model:  ProfileOptions,
                on:{
                   
                    ID_OptionMenu: sequelize.where(sequelize.col("sys_optionmenus->sys_profileoption.ID_OptionMenu"), "=", sequelize.col("sys_optionmenus.ID_OptionMenu")),
                    ID_Rol: rolId
                }
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
    getSystemOptions,
    getSysUserOptions
};
