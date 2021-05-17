const conversion= require('../models/conversion.model');

function createConversion(req, res){
    const Conversion = new conversion();

    const {User, Receta} = req.body
    let now= new Date();
    let creacion=now.toISOString().substring(0, 10);

    Conversion.User= User
    Conversion.Receta= Receta;
    Conversion.CreationDate= creacion;
   

    console.log(Conversion);
    Conversion.save((err, ConversionStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!ConversionStored){
                res.status(500).send({message: "Error"});
            }else{
                res.status(200).send({Conversion: ConversionStored})
            }
        }
    });
}


function getConversion(req, res){
    // Buscamos informacion para llenar el modelo de 
    let doc=req.params.doc;
    let companyId=req.params.company;
    try{
        Conversion.find({User:id}).populate({path: 'User' , model: 'User', match:{Company:companyId}})
        .then(Conversion => {
            res.status(200).send({Conversion});
          
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
    getConversion,
    createConversion
}