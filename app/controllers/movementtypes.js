const movementType= require('../models/movementtype.model');

function createMovementType(req, res){
    const MovementType = new movementType();

    const {Name, Description} = req.body

    MovementType.Name= Name
    MovementType.Description= Description;
  

    console.log(MovementType);
    MovementType.save((err, MovementTypeStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!MovementTypeStored){
                res.status(500).send({message: "Error"});
            }else{
                res.status(200).send({MovementType: MovementTypeStored})
            }
        }
    });
}


function getMovementType(req, res){
    // Buscamos informacion para llenar el modelo de 
    let doc=req.params.doc;
    let companyId=req.params.company;
    try{
        MovementType.find({document:doc,Company:companyId})
        .then(MovementType => {
            res.status(200).send({MovementType});
          
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
    getMovementType,
    createMovementType
}