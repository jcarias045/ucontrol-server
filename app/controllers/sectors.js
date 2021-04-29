const sector= require('../models/sector.model');

function createSector(req, res){
    const Sector = new sector();
    
    const {Name, Categoria, CodMin, SubCategoria} = req.body

    Sector.Name= Name;
    Sector.CodMin=CodMin;
    Sector.Categoria= Categoria;
    Sector.SubCategoria= SubCategoria;

    console.log(Sector);
    Sector.save((err, SectorStored)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!SectorStored){
                res.status(500).send({message: "Error"});
            }else{
                res.status(200).send({Sector: SectorStored})
            }
        }
    });
}


function getSectors(req, res){
    // Buscamos informacion para llenar el modelo de 
    try{
        sector.find()
        .then(sector => {
            res.status(200).send({sector});
          
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
    getSectors,
    createSector
}