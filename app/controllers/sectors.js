const sector= require('../models/sector.model');

//sectores o rubros  
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
    let id = req.params.id

    sector.find().sort({CodMin:-1})
    .then(sector => {
        if(!sector){
            res.status(404).send({message:"No hay "});
        }else{
            res.status(200).send({sector})
        }         
    })  
}

module.exports={
    getSectors,
    createSector
}