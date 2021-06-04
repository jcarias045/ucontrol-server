const checkbook= require('../models/checkbook.model');
const checkbookLog= require('../models/checkbooklog.model');


async function createCheckbook(req, res){
    const docCheckbook = new checkbook();

    const { StartNumber, EndNumber,CurrentNumber,DocumentType,BankAccount,Name} = req.body
    
    let lengEndNumber=(EndNumber).toString().length;
  
    let iniNumber=StartNumber;
    while (iniNumber.toString().length < lengEndNumber) {
        iniNumber = "0" + iniNumber;
    }
      console.log(iniNumber);
    docCheckbook.SerialNumberRange=iniNumber+"-"+EndNumber ;
    docCheckbook.StartNumber= StartNumber;
    docCheckbook.EndNumber= EndNumber;
    docCheckbook.CurrentNumber= StartNumber;
    docCheckbook.State=true;
    docCheckbook.Name=Name;
    docCheckbook.BankAccount=BankAccount;

        docCheckbook.save((err, docCheckbookStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!docCheckbookStored){
                res.status(500).send({message: "Error"});
            }else{
                res.status(200).send({docCheckbook: docCheckbookStored})
            }
        }
    });
   
    

   
}


function getCheckbook(req, res){
    // Buscamos informacion para llenar el modelo de 
   
    const {company,bank}=req.params
    try{
        checkbook.find()
        .populate({path: 'BankAccount', model:'BankAccount', match:{Bank:bank}})
        .then(docCheckbook => {
            res.status(200).send({docCheckbook});
          
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

function joinDocumentCheckbook(req,res){
    const log=new checkbookLog();
    let now= new Date();
    const params = req.params;
    console.log(req.body);
    let currmentNumber=req.body.CurrentNumber;
    let salto=parseInt(currmentNumber)+1;
    
    let creacion=now.toISOString().substring(0, 10);
    checkbook.findByIdAndUpdate({_id:params.id},{CurrentNumber:salto},(err,CheckbookUpdate)=>{
        if(err){
            console.log(err);
        }else{
            if(!CheckbookUpdate){
                res.status(404).send({message: "No hay"});
            }else{
                log.User=params.user;
                log.Checkbook=req.body._id;
                log.DateUpdate=creacion;
                log.Action="Salto de correlativo";
                log.save((err, docCheckbookStored)=>{
                    
                })
                res.status(200).send({correlativo: CheckbookUpdate})
            }
        }
    });
}

function desactivateDocumentCheckbook(req,res){
    
    const params = req.params;
    const log=new CheckbookLog();
    let now= new Date();
    let creacion=now.toISOString().substring(0, 10);
    Checkbook.findByIdAndUpdate({_id:params.id},{State:false},(err,CheckbookUpdate)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!CheckbookUpdate){
                res.status(404).send({message: "No se actualizo registro"});
            }else{
                log.User=params.user;
                log.DocumentType=req.body.DocumentType;
                log.DocumentCheckbook=req.body._id;
                log.DateUpdate=creacion;
                log.Action="Desactivación de correlativo";
                log.save((err, docCheckbookStored)=>{
                    
                })
                res.status(200).send({correlativo: CheckbookUpdate})
            }
        }
    });
}

function getCheckbookInfo(req, res){
    // Buscamos informacion para llenar el modelo de 
    let doc=req.params.doc;
    let id=req.params.id;
    try{
        checkbook.find({_id:id}).populate({path: 'BankAccount', model:'BankAccount'})
        .then(docCheckbook => {
            res.status(200).send({docCheckbook});
          
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
    getCheckbook,
    createCheckbook,
    joinDocumentCheckbook,
    desactivateDocumentCheckbook,
    getCheckbookInfo
}