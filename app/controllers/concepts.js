const concept= require('../models/concepts.model');

function createConcept(req, res){
    const Concept = new concept();

    const {BankMovement, Name, Company,CashMovement} = req.body

    Concept.Name= Name
    Concept.Company= Company;
    Concept.BankMovement=BankMovement;
    Concept.CashMovement= CashMovement;
    

    console.log(Concept);
    Concept.save((err, ConceptStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!ConceptStored){
                res.status(500).send({message: "Error"});
            }else{
                res.status(200).send({Concept: ConceptStored})
            }
        }
    });
}


function getConcept(req, res){
    // Buscamos informacion para llenar el modelo de 
    let doc=req.params.doc;
    let id=req.params.id;
    try{
         concept.find({BankMovement:id})
        .then(Concept => {
            res.status(200).send({Concept});
          
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
    getConcept,
    createConcept
}