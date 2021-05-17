const Document = require('../models/document')
const fs =require("fs");
const path=require("path");
const { log } = require('console');

function uploadDocument(req,res) {
    const documents = new Document();
    //const { Url } = req.files;
    const { title, description, User, Customer} = req.body
   
    console.log(req.body)
    documents.title = title,
    documents.description = description,
    documents.Customer = Customer,
    documents.User = User

    if (req.files) {
        let filePath = req.files.file.path;
        console.log(filePath)
        let fileSplit = filePath.split("\\");
        let fileName = fileSplit[3];


        let extSplit = fileName.split(".");
        let fileExt = extSplit[1].toString();
        documents.Url = fileName;
        console.log("la extension es:", fileExt);
        // if(fileExt.toString() !== "png" || fileExt.toString()!=="jpg" ||  fileExt.toString()!=="pdf" ||  fileExt.toString()!=="jpeg" ||  fileExt.toString()!=="doc"
        // ||  fileExt.toString()!=="txt" ||  fileExt.toString()!=="csv" ||  fileExt.toString()!=="xlsx"){
        //     console.log("eror",fileExt.toString());
        //     res.status(500).send({message: "Archivo Incorrecto"});
        // }
        // else{
            console.log(documents)
            documents.save((err, documentStored)=>{
                if(err){
                    res.status(500).send({message: err});
                }else{
                    if(!documentStored){
                            res.status(500).send({message: "Error"});
                    }else{
                            
                        res.status(200).send({bank: documentStored})
                    }
                }
            });

        // }
    }

  


    //   const { title, description } = req.body;
    //   const { path, mimetype } = req.file;
    //   const document = new Document({
    //         title,
    //         description,
    //         file_path: path,
    //         file_mimetype: mimetype
    //     });


   

        
       

        
        
}


        // if (req.file) 
        // {
        //     let filePath = req.files.avatar.path;
        //     let fileSplit = filePath.split("/");
        //     let fileName = fileSplit[2];

        //     let extSplit = fileName.split(".");
        //     let fileExt = extSplit[1];
        //     document.Url = fileName;
      
    // }


function getDocument(req, res) {
  const {id}=req.params;
    Document.find({Customer:id}).then(Document => {
        if(!Document){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({Document})
        }
    });
    
}

function getAvatar(req, res) {
    const FileName = req.params.FileName;
    const filePath = "./app/uploads/document/" + FileName;
  
    fs.exists(filePath, exists => {
      if (!exists) {
        res.status(404).send({ message: "El archivo que buscas no existe." });
      } else {
        res.sendFile(path.resolve(filePath));
        console.log(path.resolve(filePath))
      }
    });
}

module.exports ={
   uploadDocument,
   getDocument,
   getAvatar
}