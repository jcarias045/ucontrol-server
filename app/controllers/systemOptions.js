  
const SysOptions = require('../models/systemOp.model');
const ProfileOptions = require('../models/profileOptions.model');
const Grupos = require('../models/grupos.model');
const roles=require('../models/rol.model');
const profileOptions = require('../models/profileOptions.model')

// const db = require('../config/db.config.js');
// const { Op } = require("sequelize");

// const sequelize = require('sequelize');
// const SysOptions = db.SysOptions;
// const ProfileOptions = db.ProfileOptions;
// const Grupos = db.Grupos;

function getSystemOptions(req, res){

    try{
        SysOptions.find({Grupos: req.params.id})
        .populate({path: "Grupos", model: "Grupos"})
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
   
        var ObjectID = require('mongodb').ObjectID
        Grupos.aggregate([
            {
                "$lookup": {
                    "from": "opmenus",
                    "let": {"idgrupo": "$_id"},
                    "pipeline": [
                        {"$match": {"$expr": {"$eq":["$Grupos", "$$idgrupo"] }}},
                      
                        { "$lookup": {
                            "from": "profileoptions",
                            "let": {"opmenuid": "$_id"},
                            "pipeline": [
                                { $match: {  Rol:ObjectID(rolId)} },
                                {"$match": {"$expr": {"$eq":["$OpMenu", "$$opmenuid"] }}},             
                                   {"$lookup": {
                                        "from": "rols" ,
                                        "let": {"profileoptions": "$_id"}, 
                                        "pipeline": [
                                            { $match: { _id: rolId } },
                                            {
                                                "$lookup": {
                                                    "from": "companies" ,
                                                    localField: "_id",
                                                     foreignField: "Company",
                                                     as:'company'
                                                }

                                            }
                                        ],
                                        "as": "profile"
                                    }
                                    }
                                        
                            ],
                            "as": "opmenu"
                          }}
                    ],
                    "as": "grupos"
                }
            }
        ])
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
        let Nombre = grupos.Name;
        console.log(Nombre);
        grupos.icon=req.body.icon;
        Grupos.findOne({Name: Nombre})
        .then(group=>{
            console.log(group);
            console.log(grupos);
        if(!group){    
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
        }else{
            
            res.status(500).send({ message: "Error el Grupo ya existe."});
        }

    })
}

async function createSystemOption(req, res){  //se crean las opciones que componen los grupos
    // let option = {};
    console.log(req.body);
    const sysOptions = new SysOptions();
    let sysOp=[];
    try{
        // Construimos el modelo del objeto
        sysOptions.Name = req.body.Name;
        sysOptions.URL=req.body.URL;
        sysOptions.Grupos = req.body.Grupos;
        sysOptions._id=req.body._id;
        sysOptions.State=true;              
        SysOptions.create(sysOptions)
        .then(async result => {   
             let opId=result._id;
             console.log("ingresando datos opciones ");
             console.log(result);
             roles.find().then(role =>{  //lo que se hace acá es que se obtiene el id  de todos los roles 
                role.map(async item=>{  //y se hace un insert a la tabla profileoption para agregar esa nueva opcion como falsa
                    sysOp.push({        //evita que surjan problemas al querer editar el rol
                        Checked:false,
                        Rol:item._id,
                        OpMenu:opId
                    })                    
                });
                console.log("opciones que se van a ingresar");
                console.log(sysOp);
                 profileOptions.insertMany(sysOp).then(async result=>{
                    console.log(result);
                }).catch(err=>{
                    console.log(err);
                   return err.message;
               });
            })
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
    console.log(req.body);
    let GrupoData = req.body;
    const params = req.params;

    Grupos.findByIdAndUpdate({_id: params.id}, GrupoData, (err, GrupoUpdate)=>{
        if(err){
            res.status(500).send({message: "Error del Servidor."});
        } else {
            if(!GrupoUpdate){
                res.status(404).send({message: "No hay"});
            }else{
                res.status(200).send({message: "Banca Actualizado"})
            }
        }
    })
}

async function updateOption(req, res){
    console.log(req.body);
    let OptionData = req.body;
    const params = req.params;

    SysOptions.findByIdAndUpdate({_id: params.id}, OptionData, (err, OptionUpdate)=>{
        if(err){
            res.status(500).send({message: "Error del Servidor."});
        } else {
            if(!OptionUpdate){
                res.status(404).send({message: "No hay"});
            }else{
                res.status(200).send({message: "Banca Actualizado"})
            }
        }
    })
    
}

async function changeStateOption(req, res){
   
    let menuOptionId = req.params.id; 
  
    const {State} = req.body;  //
    try{
        
        await SysOptions.findByIdAndUpdate(menuOptionId, {State}, (menuOptionStored) => {
            if (!menuOptionStored) {
                res.status(404).send({ message: "No se ha encontrado la plaza." });
            }
            else if (State === false) {
                res.status(200).send({ message: "Opcion desactivada correctamente." });
            }
        })
        
    } catch(error){
        res.status(500).json({
            message: "Error -> No se puede actualizar  " + req.params.id,
            error: error.message
        });
    }
}

function getSystemOptionsrol(req, res){

    try{
        SysOptions.find()
        .populate({path: "Grupos", model: "Grupos"})
        .then(sysOptions => {
            res.status(200).json({sysOptions});
          
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
    getSystemOptionsrol,
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


       
 