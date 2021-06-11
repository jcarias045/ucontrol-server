const bankMovement= require('../models/bankmovement.model');

function createBankMovement(req, res){
    const BankMovement = new bankMovement();

    const {Name, Description, Company} = req.body

    BankMovement.Name= Name
    BankMovement.Description= Description;
    BankMovement.Company= Company;
    

    console.log(BankMovement);
    BankMovement.save((err, BankMovementStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!BankMovementStored){
                res.status(500).send({message: "Error"});
            }else{
                res.status(200).send({BankMovement: BankMovementStored})
            }
        }
    });
}


function getBankMovement(req, res){
    // Buscamos informacion para llenar el modelo de 
    let doc=req.params.doc;
    let id=req.params.id;
    try{
        bankMovement.find()
        .then(BankMovement => {
            res.status(200).send({BankMovement});
          
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
    getBankMovement,
    createBankMovement
}