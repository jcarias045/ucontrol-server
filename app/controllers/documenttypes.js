const documentType= require('../models/documenttype.model');

function createDocType(req, res){
    const docType = new documentType();

    const {Name, Description, Company,Ref} = req.body

    docType.Name= Name
    docType.Description= Description;
    docType.Company=Company;
    docType.Ref=Ref;

    console.log(docType);
    docType.save((err, docTypeStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!docTypeStored){
                res.status(500).send({message: "Error"});
            }else{
                res.status(200).send({docType: docTypeStored})
            }
        }
    });
}


function getDocType(req, res){
    // Buscamos informacion para llenar el modelo de 
    let doc=req.params.doc;
    let companyId=req.params.company;
    try{
        documentType.find({Company:companyId})
        .then(docType => {
            res.status(200).send({docType});
          
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
    getDocType,
    createDocType
}