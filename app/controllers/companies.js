const db = require('../config/db.config.js');
const fs =require("fs");
const path=require("path");
const Company = db.Company;


function getCompanies(req, res){
    // Buscamos informacion para llenar el modelo de 
    try{
        Company.findAll()
        .then(companies => {
            res.status(200).send({companies});
          
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

function createCompany(req, res){
    let company = {};

    try{
        // Construimos el modelo del objeto company para enviarlo como body del request
        company.Name = req.body.Name;
        company.Logo=req.body.Logo;
        company.Web= req.body.Web;
        company.ShortName=req.body.ShortName;
        company.Active=true;
    
        // Save to MySQL database
       Company.create(company)
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


function uploadLogo(req,res){
    const params= req.params;
    const id=params.id;
    console.log(req.files);
    Company.findByPk(id).then((companyData)=>{        
          if(!companyData){
            res.status(404)
            .send({message:"no se encontro usuario"});
          }
          else{
            let company =companyData;
            console.log(companyData);
            if(req.files){
                let filePath=req.files.avatar.path;
                
                let fileSplit=filePath.split("\\");
                let fileName=fileSplit[3];
                let extSplit=fileName.split(".");
                let fileExt=extSplit[1];
                console.log(fileName);
                if(fileExt !== "png" && fileExt!=="jpg"){
                    res.status(400)
                    .send({message: "la extesion no es valida"});
                }    
            else{          
                console.log();
                let updatedObject = {                   
                    Logo: fileName,
                  }
                let result =  Company.update(updatedObject,
                    { 
                      returning: true,                
                      where: {ID_Company: id},
                      attributes: [ 'Logo']
                    }
                  );
                  if(!result) {
                    res.status(500).json({
                        message: "Error -> No se puede actualizar el cliente con ID = " + req.params.id,
                        error: "No se puede actualizar",
                    });
                }
    
                res.status(200).json(result);
            }
            
        }
        else{
            console.log("no reconoce ");
        }
          }
       });
}

function getLogo(req,res){
    const logoName=req.params.logoName;
    const filePath="./app/uploads/avatar/"+logoName;
    console.log(filePath);
    fs.exists(filePath,exists=>{
        if(!exists){
            res.status(404)
            .send({message:"el avatar que buscas no existe"});
        }
        else{
            res.sendFile(path.resolve(filePath));
        }
       
    });
}


async function updateCompany(req, res){
   
    let companyId = req.params.id; 
    console.log(companyId); 
    const { Name,Logo,ShortName,Web,Active} = req.body;  //
    try{
        let company = await Company.findByPk(companyId);
        console.log(company);
        if(!company){
           // retornamos el resultado al cliente
            res.status(404).json({
                message: "No se encuentra el cliente con ID = " + companyId,
                error: "404"
            });
        } else {    
            // actualizamos nuevo cambio en la base de datos, definición de
            let updatedObject = {             
                Name:Name,
                Logo: Logo,
                ShortName:ShortName,
                Web:Web,
                Active:Active
               
            }
            console.log(updatedObject);    //agregar proceso de encriptacion
            let result = await company.update(updatedObject,
                              { 
                                returning: true,                
                                where: {ID_Company: companyId}
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

async function deleteCompany(req, res){
    console.log(req.params.id);
    try{
        let companyId = req.params.id;
        let company = await Company.findByPk(companyId);
       
        if(!company){
            res.status(404).json({
                message: "La compañia con este ID no existe = " + companyId,
                error: "404",
            });
        } else {
            await company.destroy();
            res.status(200).send({
                message:"Compañia eliminada con exito"
            });
        }
    } catch(error) {
        res.status(500).json({
            message: "Error -> No se puede eliminar el cliente con el ID = " + req.params.id,
            error: error.message
        });
    }
}
module.exports={
    getCompanies,
    createCompany,
    uploadLogo,
    getLogo,
    updateCompany,
    deleteCompany

};