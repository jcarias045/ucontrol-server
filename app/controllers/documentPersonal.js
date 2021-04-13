const DocumentPersonal = require('../models/documentPersonal')
const fs =require("fs");
const path=require("path");

function uploadDocument(req,res) {
    const documents = new DocumentPersonal();
    //const { Url } = req.files;
    const { title, description, User, Personal} = req.body
   
    console.log(req.files)
    documents.title = title,
    documents.description = description,
    documents.Personal = Personal

    if (req.files) {
        let filePath = req.files.file.path;
        console.log(filePath)
        let fileSplit = filePath.split("\\");
        let fileName = fileSplit[3];


        let extSplit = fileName.split(".");
        let fileExt = extSplit[1];
        documents.Url = fileName;
    }

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

    DocumentPersonal.find()
    .then(Document => {
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