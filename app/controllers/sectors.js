const sector = require('../models/sector.model');

//sectores o rubros  
function createSector(req, res) {
    const Sector = new sector();

    const { Name, Categoria, CodMin, SubCategoria } = req.body

    Sector.Name = Name;
    Sector.CodMin = CodMin;
    Sector.Categoria = Categoria;
    Sector.SubCategoria = SubCategoria;

    console.log(Sector);
    if (!sector) {
        console.log("no se recibe sector")
    }
    Sector.save((err, SectorStored) => {
        if (err) {
            res.status(500).send({ message: err });
        } else {
            if (!SectorStored) {
                res.status(500).send({ message: "Error" });
            } else {
                res.status(200).send({ Sector: SectorStored })
            }
        }
    });
}


function getSectors(req, res) {
    let id = req.params.id

    sector.find().sort({ CodMin: -1 })
        .then(sector => {
            if (!sector) {
                res.status(404).send({ message: "No hay " });
            } else {
                res.status(200).send({ sector })
            }
        })
}

//tomando todos los sectores que existen en la base
function getAllSectors(req, res) {
    //mandando a llamar todos los sectores desde la base de datos
    sector.find()
        .then(sector => {
            if (!sector) {
                res.status(404).send({ message: "No se obuto sectores" });
            } else {
                res.status(200).send({ sector });
            }
        })
}

//funcion para editar un sector
function updateSector(req, res) {
    //tomando los datos que vienen del cliente
    let sectordata = req.body;
    console.log(sectordata);
    //actualizando sector
    sector.findByIdAndUpdate({ _id: sectordata._id }, sectordata, (err, sectorUpdate) => {
        if (err) {
            res.status(500).send({ message: "error" })
        } else {
            if (!sectorUpdate) {
                res.status(404).send({ message: "error" })
            } else {
                res.status(200).send({ sector: "sector actualizado" })
            }

        }
    })
}

//funcion que elimina sectores de la base
function deleteSector(req, res) {
    const { id } = req.params;
    console.log(id)

    //eliminando el sector de la base de datos
    sector.findByIdAndRemove(id, (err, sectorDeleted) => {
        if (err) {
            res.status(500).send({ message: "error del servidor" })
        } else {
            if (!sectorDeleted) {
                res.status(404).send({ message: "sector no encontrado" })
            } else {
                res.status(200).send({ message: "El sector se elimino correctamente" })
            }
        }
    });

}

module.exports = {
    getSectors,
    createSector,
    getAllSectors,
    updateSector,
    deleteSector
}