const db = require('../config/db.config.js');

const SysOptions = db.SysOptions;



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

module.exports={
    getSystemOptions,
    
};
