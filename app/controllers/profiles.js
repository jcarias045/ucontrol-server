const Profile = require('../models/profile.model');
function getProfiles(req, res){
    Profile.find()
    .then(Profile => {
        if(!Profile){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({Profile})
        }
    });
}

 function createProfile(req, res){
    
    const profile = new Profile();

    const { Name, Description } = req.body;

    profile.Name = Name;
    profile.Description = Description;
    profile.save((err, profileStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            console.log(profileStored);
            if(!profileStored){
                res.status(500).send({message: "Error"});
            }else{
                res.status(200).send({Profile: profileStored});
            }
        }
      });
    // let profile = {};
    
    // console.log();
    // let opciones=req.body.opciones;
    
    // try{
    //     let promises = [];
    //     let sysOp={};
    //     // Construimos el modelo del objeto
    //     profile.Name = req.body.Name;
    //     profile.Description=req.body.Description;
    //     let perfilId="";
    //     // Save to MySQL database
    //    Profile.create(profile)
    //   .then(async result => {    
    //     res.status(200).json(result);
    //       perfilId=result.ID_Profile;
    //       for  (const cartItem of opciones) {
    //             sysOp.ID_Profile=perfilId;
    //             sysOp.ID_OptionMenu=cartItem;
    //             console.log(sysOp);
    //             await ProfileOptions.create(sysOp).then(async result=>{}).catch(err=>{
    //                 return err.message;
    //             });
    //           }
    //   });  
       
    //   console.log(perfilId);
    // //   for  (const cartItem of options) {
    // //     sysOp.ID_Profile=perfilId;
    // //     sysOp.ID_OptionMenu=cartItem;
    // //     console.log(sysOp);
    // //   }
    // //   if(perfilId){
    // //     try{
    // //     for(var i = 0; i < opciones.length; i++){
    // //                     sysOp.ID_Profile=perfilId;
    // //                     sysOp.ID_OptionMenu=element[i];
    // //                     console.log(Object.keys(sysOp).length);
    // //                     let s=  ProfileOptions.create(sysOp)
    // //                      promises.push(s);
    // //                     console.log(sysOp);
    // //                 }
    // //     }catch{

    // //     }
         
    //     console.log(promises);
    //      Promise.all(promises).then(function(users) {console.log(users);})
       
    // }
      
    // catch(error){
    //     res.status(500).json({
    //         message: "Fail!",
    //         error: error.message
    //     });
    // }
}

async function updateProfile(req, res){
   
    let ProfileData = req.body;
    const params = req.params;

    Profile.findByIdAndUpdate({_id: params.id}, ProfileData, (err, ProfileUpdate)=>{
        if(err){
            res.status(500).sen({message: "Error del Servidor."});
        } else {
            if(!ProfileUpdate){
                res.status(404).sen({message: "No hay"});
            }else{
                res.status(200).send({message: "Perfil Actualizado"})
            }
        }
    })
}

async function deleteProfile(req, res){
    const { id } = req.params;
  
    Profile.findByIdAndRemove(id, (err, BankDeleted) => {
      if (err) {
        res.status(500).send({ message: "Error del servidor." });
      } else {
        if (!BankDeleted) {
          res.status(404).send({ message: "Banca no encontrado." });
        } else {
          res
            .status(200)
            .send({ message: "El Perfil ha sido eliminada correctamente." });
        }
      }
    });
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
  //getOptions
};
