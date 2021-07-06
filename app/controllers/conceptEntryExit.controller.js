//importamos el modelo para realizar las acciones
const conceptentriexit = require('../models/conceptEntryExit.model');

//funcion para crear un nuevo concepto en la base de datos
function createConcept(req, res) {
    //creando nuevo objeto para el registro
    const ConcetpEntryExit = new conceptentriexit();

    //recibiendo datos del cuerpo
    const { entryorexit, conceptDescription, Company } = req.body;

    //seteando los valores recibidos a registrar
    ConcetpEntryExit.entryorexit = entryorexit;
    ConcetpEntryExit.conceptDescription = conceptDescription;
    ConcetpEntryExit.Company = Company;

    //log para validar que se estan recibiendo datos
    console.log(ConcetpEntryExit)

    //guardando el dato en la base
    ConcetpEntryExit.save((err, conceptentryeit) => {
        if (err) {
            res.status(500).send({ message: err })
        } else {
            if (!conceptentryeit) {
                res.status(500).send({ message: "error" })
            } else {
                res.status(200).send({ concept: conceptentryeit })
            }
        }
    })

}

//actualizando un concepto de salida o entrada
function updateConcept(req, res) {
    //tomando los datos que vienen del cliente
    let concepData = req.body;
    console.log(concepData)

    //buscando y editando registro
    conceptentriexit.findByIdAndUpdate({ _id: concepData._id }, concepData, (err, conceptupdate) => {
        if (err) {
            res.status(500).send({ message: "error de servidor" })
        } else {
            if (!conceptupdate) {
                res.status(400).send({ message: "No se encontro concepto" })
            } else {
                res.status(200).send({ concept: "Concepto actualizado" })
            }
        }
    })
}

//tomandos los conceptos por empresa
function getConceptbyCompany(req, res) {
    //id de la empresa
    const { id } = req.params;

    console.log(id);

    //tomando los conceptos por empresa
    conceptentriexit.find({ Company: id })
        .then(concetp => {
            if (!concetp) {
                res.status(404).send({ message: "no posee sectores" })
            } else {
                res.status(200).send({ concetp })
            }
        })
}

//funcion que elimina conceptos
function deleteConcept(req, res) {
    const id = req.params.id;
    console.log(id)

    // buscando y eliminando concepto
    conceptentriexit.findByIdAndDelete(id, (err, conceptdelete) => {
        if (err) {
            res.status(500).send({ message: "error del servidor" })
        } else {
            if (!conceptdelete) {
                res.status(404).send({ message: "concepto no encontrado" })
            } else {
                res.status(200).send({ meesage: "Concepto eliminado correctamente" })
            }
        }
    })
}

//tomando un concepto por id de codigo
function getConceptById(req, res) {
    //tomando el id de los parametros
    const id = req.params.id;

    //buscando el concepto
    conceptentriexit.findById(id)
        .then(result => {
            if (!result) {
                res.status(404).send({ message: "no se encontro concepto" })
            } else {
                if (result == null) {
                    result= "";
                    res.status(200).send({ result});
                } else {
                    res.status(200).send({ result })
                }

            }
        })
}

//exportando funciones del controlador
module.exports = {
    createConcept,
    getConceptbyCompany,
    updateConcept,
    deleteConcept,
    getConceptById
}