const Document = require('../models/document')
const fs =require("fs");
const path=require("path");

function uploadDocument(req,res) {
        const document = new Document();
        const { path } = req.files;
        const { title, description, Customer} = req.body
        //const {User, Customer } = req.body

        document.Url = path
        document.title = title,
        document.description = description
        document.Customer = Customer
        //document.User = User
        //document.Customer = Customer

        console.log(document)
        document.save((err, documentStored)=>{
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

    Document.find({Customer: req.params.customer}).populate({path: 'Customer', model: 'Customer'})
    .then(Document => {
        if(!Document){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({Document})
        }
    });
    // try {
    //     const files = Document.find({});
    //     const sortedByCreationDate = files.sort(
    //       (a, b) => b.createdAt - a.createdAt
    //     );
    //     res.send(sortedByCreationDate);
    //   } catch (error) {
    //     res.status(400).send('Error while getting list of files. Try again later.');
    //   }
}

module.exports ={
   uploadDocument,
   getDocument
}