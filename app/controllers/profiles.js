const db = require('../config/db.config.js');;
const Profile = db.Profile;


function getProfiles(req, res){
    // Buscamos informacion para llenar el modelo de 
    try{
        Profile.findAll()
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

function createProfile(req, res){
    let profile = {};

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


async function updateProfile(req, res){
   
    let profileId = req.params.id; 
    console.log(profileId); 
    const { Name,Description} = req.body;  
    try{
        let profile = await Profile.findByPk(profileId);
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
        Profile.findAll({attributes:['ID_Profile','Name']})
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

module.exports={
  getProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
  getProfilesId


};
