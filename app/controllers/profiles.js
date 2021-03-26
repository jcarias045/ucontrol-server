const profile = require('../models/profile.model')
const ProfileOption = require('../models/profileOptions.model')
const systemOp = require('../models/systemOp.model')

function getProfiles(req, res){
    // Buscamos informacion para llenar el modelo de 
    try{
        profile.find()
        .then(profile => {
            if(!profile){
                res.status(404).send({message:"No hay "});
            }else{
                res.status(200).send({profile})
            }
        });
    }catch(error) {
        // imprimimos a consola
        console.log(error);

        res.status(500).json({
            message: "Error en query!",
            error: error
        });
    }
}

 function createProfile(req, res){
    console.log();
    let opciones=req.body.opciones 
    
    try{
        //let promises = [];
        //let sysOp={};
        // Construimos el modelo del objeto
        const Profile = new profile();
        const SystemOp = new systemOp();


        const {Name, Description} = req.body
        // Save to MySQL database
       Profile.save(Profile)
      .then(async result => {    
        res.status(200).json(result);
          for  (const cartItem of opciones) {
                sysOp.ID_Profile=perfilId;
                sysOp._id=cartItem;
                console.log(sysOp);
                await ProfileOption.save(sysOp).then(async result=>{}).catch(err=>{
                    return err.message;
                });
            }
      });  
       
      console.log(perfilId);
    //   for  (const cartItem of options) {
    //     sysOp.ID_Profile=perfilId;
    //     sysOp.ID_OptionMenu=cartItem;
    //     console.log(sysOp);
    //   }
    //   if(perfilId){
    //     try{
    //     for(var i = 0; i < opciones.length; i++){
    //                     sysOp.ID_Profile=perfilId;
    //                     sysOp.ID_OptionMenu=element[i];
    //                     console.log(Object.keys(sysOp).length);
    //                     let s=  ProfileOptions.create(sysOp)
    //                      promises.push(s);
    //                     console.log(sysOp);
    //                 }
    //     }catch{

    //     }
         
        console.log(promises);
         Promise.all(promises).then(function(users) {console.log(users);})
       
    }
      
    catch(error){
        res.status(500).json({
            message: "Fail!",
            error: error.message
        });
    }
}

async function updateProfile(req, res){
   
    let profileId = req.params.id; 
    
    let opciones=req.body.opciones;
    console.log(opciones); 
    const { Name,Description} = req.body;  
    try{
        let sysOp={};
        let profile = await Profile.findByPk(profileId);
        let options=await ProfileOptions.findAll({where:{ID_Profile:profileId}});
        if(!profile){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el cliente con ID = " + profileId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = {             
                Name:Name,
                Description:Description
               
            }
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await profile.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_Profile: profileId}
                              }
                            ).then( ProfileOptions.destroy({where:{ID_Profile:profileId}}));
            
            for  (const cartItem of opciones) {
                sysOp.ID_Profile=profileId;
                sysOp.ID_OptionMenu=cartItem;
                console.log(sysOp);
                await ProfileOptions.create(sysOp).then(async result=>{}).catch(err=>{
                    return err.message;
                });
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

async function deleteProfile(req, res){
    try{
        let profileId = req.params.id;
        let profile = await Profile.findByPk(profileId);
       
        if(!profile){
            res.status(404).json({
                message: "El perfil con este ID no existe = " + profileId,
                error: "404",
            });
        } else {
            await profile.destroy();
            res.status(200).send({
                message:"Perfil eliminado con exito"
            });
        }
    } catch(error) {
        res.status(500).json({
            message: "Error -> No se puede eliminar el cliente con el ID = " + req.params.id,
            error: error.message
        });
    }
}

function getProfilesId(req, res){
    // Buscamos informacion para llenar el modelo de 
    try{
        profile.findAll({attributes:['ID_Profile','Name']})
        .then(profiles => {
            res.status(200).send({profiles});
          
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

// function getOptions(req,res){
//     let perfilId=req.params.id;
//     try{
//         ProfileOptions.findAll({where:{ID_Rol:perfilId}})
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

module.exports={
  getProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
  getProfilesId,
};
