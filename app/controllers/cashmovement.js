const cashMovement= require('../models/cashmovement.model');

function createCashMovement(req, res){
    const CashMovement = new cashMovement();

    const {Name, Description, Company} = req.body

    CashMovement.Name= Name
    CashMovement.Description= Description;
    CashMovement.Company= Company;
    

    console.log(CashMovement);
    CashMovement.save((err, CashMovementStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!CashMovementStored){
                res.status(500).send({message: "Error"});
            }else{
                res.status(200).send({CashMovement: CashMovementStored})
            }
        }
    });
}


function getCashMovement(req, res){
    // Buscamos informacion para llenar el modelo de 
    let doc=req.params.doc;
    let companyId=req.params.id;
    try{
        cashMovement.find({Company:companyId})
        .then(CashMovement => {
            res.status(200).send({CashMovement});
          
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
    getCashMovement,
    createCashMovement
}