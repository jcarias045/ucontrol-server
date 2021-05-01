const correlative= require('../models/documentcorrelatives.model');
const correlativeLog= require('../models/correlativeslog.model');


async function createdocCorrelative(req, res){
    const docCorrelative = new correlative();

    const {NResolucion, StartNumber, EndNumber,CurrentNumber,DocumentType,Company} = req.body
    
    let lengEndNumber=(EndNumber).toString().length;
  
    let iniNumber=StartNumber;
    while (iniNumber.toString().length < lengEndNumber) {
        iniNumber = "0" + iniNumber;
    }
      console.log(iniNumber);
    docCorrelative.SerialNumberRange=iniNumber+"-"+EndNumber ;
    docCorrelative.NResolucion= NResolucion;
    docCorrelative.StartNumber= StartNumber;
    docCorrelative.EndNumber= EndNumber;
    docCorrelative.CurrentNumber= StartNumber;
    docCorrelative.State=true;
    docCorrelative.DocumentType=DocumentType;
    docCorrelative.Company=Company;

    
  
    let existDoc= await correlative.findOne({DocumentType:DocumentType, Company:Company, State:true})
    .then(docCorrelative => {
       if(docCorrelative){
          return docCorrelative
       }
      
    });
   
    if (!existDoc) {
       
        docCorrelative.save((err, docCorrelativeStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!docCorrelativeStored){
                res.status(500).send({message: "Error"});
            }else{
                res.status(200).send({docCorrelative: docCorrelativeStored})
            }
        }
    });
   
    
} 
    
    else{
        res.status(500).send({message: "Ya existe correlativo registrado para este documento"});
    }
   
}


function getdocCorrelative(req, res){
    // Buscamos informacion para llenar el modelo de 
    let doc=req.params.doc;
    let companyId=req.params.company;
    try{
        correlative.find({Company:companyId}).populate({path: 'DocumentType', model:'DocumentType'})
        .then(docCorrelative => {
            res.status(200).send({docCorrelative});
          
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

function joinDocumentCorrelative(req,res){
    const log=new correlativeLog();
    let now= new Date();
    const params = req.params;
    console.log(req.body);
    let currmentNumber=req.body.CurrentNumber;
    let salto=parseInt(currmentNumber)+1;
    
    let creacion=now.toISOString().substring(0, 10);
    correlative.findByIdAndUpdate({_id:params.id},{CurrentNumber:salto},(err,correlativeUpdate)=>{
        if(err){
            console.log(err);
        }else{
            if(!correlativeUpdate){
                res.status(404).send({message: "No hay"});
            }else{
                log.User=params.user;
                log.DocumentType=req.body.DocumentType;
                log.DocumentCorrelative=req.body._id;
                log.DateUpdate=creacion;
                log.Action="Salto de correlativo";
                log.save((err, docCorrelativeStored)=>{
                    
                })
                res.status(200).send({correlativo: correlativeUpdate})
            }
        }
    });
}

function desactivateDocumentCorrelative(req,res){
    
    const params = req.params;
    const log=new correlativeLog();
    let now= new Date();
    let creacion=now.toISOString().substring(0, 10);
    correlative.findByIdAndUpdate({_id:params.id},{State:false},(err,correlativeUpdate)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!correlativeUpdate){
                res.status(404).send({message: "No se actualizo registro"});
            }else{
                log.User=params.user;
                log.DocumentType=req.body.DocumentType;
                log.DocumentCorrelative=req.body._id;
                log.DateUpdate=creacion;
                log.Action="Desactivación de correlativo";
                log.save((err, docCorrelativeStored)=>{
                    
                })
                res.status(200).send({correlativo: correlativeUpdate})
            }
        }
    });
}



module.exports={
    getdocCorrelative,
    createdocCorrelative,
    joinDocumentCorrelative,
    desactivateDocumentCorrelative
}