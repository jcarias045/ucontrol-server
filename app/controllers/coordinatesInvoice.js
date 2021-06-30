//requiriendo el modelo coordenadas de facturas
const coordinatesInvoices = require('../models/coordinatesInvoice.model');
//llamando al modelo company
const companyname = require('../models/company.model');

//funcion para crear coordenadas de facturas
async function createCoordinatesInvoice(req, res) {
    //creando objeto de coordenadas
    const CoordinatesInvoice = new coordinatesInvoices();

    //obteniendo valores que recibe la peticion del cuerpo
    const { Company, pageSize, dateCoorX, dateCoorY, nameCoorX, nameCoorY, cityCoorX, cityCoorY, nitCoorX,
        nitCoorY, payConditionCoorX, payConditionCoorY, productsCoorX, productsCoorY, totalCoorX,
        totalCoorY, totalCoorY2, typeInvoice, posY, sectorNameCoorX, sectorNameCoorY, ncrCoorX, ncrCoorY
        , addressCoorX, addressCoorY, quantityCoorX, priceCoorX, subtotalCoor } = req.body;

    //pasamos los valores al objeto creado
    CoordinatesInvoice.Company = Company;
    CoordinatesInvoice.pageSize = pageSize;
    CoordinatesInvoice.dateCoorX = dateCoorX;
    CoordinatesInvoice.dateCoorY = dateCoorY;
    CoordinatesInvoice.nameCoorX = nameCoorX;
    CoordinatesInvoice.nameCoorY = nameCoorY;
    CoordinatesInvoice.cityCoorX = cityCoorX;
    CoordinatesInvoice.cityCoorY = cityCoorY;
    CoordinatesInvoice.nitCoorX = nitCoorX;
    CoordinatesInvoice.nitCoorY = nitCoorY;
    CoordinatesInvoice.payConditionCoorX = payConditionCoorX;
    CoordinatesInvoice.payConditionCoorY = payConditionCoorY;
    CoordinatesInvoice.productsCoorX = productsCoorX;
    CoordinatesInvoice.productsCoorY = productsCoorY;
    CoordinatesInvoice.totalCoorX = totalCoorX;
    CoordinatesInvoice.totalCoorY = totalCoorY;
    CoordinatesInvoice.typeInvoice = typeInvoice;
    CoordinatesInvoice.posY = posY;
    CoordinatesInvoice.totalCoorY2 = totalCoorY2;
    CoordinatesInvoice.sectorNameCoorX = sectorNameCoorX;
    CoordinatesInvoice.sectorNameCoorY = sectorNameCoorY;
    CoordinatesInvoice.ncrCoorX = ncrCoorX;
    CoordinatesInvoice.ncrCoorY = ncrCoorY;
    CoordinatesInvoice.addressCoorX = addressCoorX;
    CoordinatesInvoice.addressCoorY = addressCoorY;
    CoordinatesInvoice.quantityCoorX = quantityCoorX;
    CoordinatesInvoice.priceCoorX = priceCoorX;
    CoordinatesInvoice.subtotalCoor = subtotalCoor;

    //comprobando que se esten recibiendo datos de las coordenadas
    console.log(req.body);
    console.log(CoordinatesInvoice);


    CoordinatesInvoice.save((err, CoordinatesStored) => {
        if (err) {
            res.status(500).send({ message: err })
        } else {
            if (!CoordinatesStored) {
                res.status(500).send({ message: "error al registrar" })
            } else {
                res.status(200).send({ Coortinate: CoordinatesStored })
            }
        }
    });
}

//funcion para obtener coordenadas de las empresas
function getAllCoordinatesInvoice(req, res) {
    //llamando todas las coordenadas registradas
    coordinatesInvoices.find()
        .populate({
            path: 'Company', model: 'Company'
        })
        .then(coordinate => {
            if (!coordinate) {
                res.status(400).send({ message: "no se encontraron coordenadas" });
            } else {
                res.status(200).send({ coordinate });
            }
        })
}

//funcion para editar una coordenada
function updateCoordinateInvoice(req, res) {
    //console.log(req.body);
    let coordinateData = req.body;

    coordinatesInvoices.findByIdAndUpdate({ _id: coordinateData._id }, coordinateData, (err, coordinateUpdate) => {
        if (err) {
            res.status(500).send({ message: "error" })
        } else {
            if (!coordinateUpdate) {
                res.status(404).send({ message: "error" })
            } else {
                res.status(200).send({ coordinate: "coordenadas actualizadas" })
            }
        }
    })

}

//funcion para eliminar una coordenada
function deleteCoordinateInvoice(req, res) {
    //id que se recibe en la peticion
    const { id } = req.params;

    //encontrando y eliminando las coordenadas
    coordinatesInvoices.findByIdAndDelete(id, (err, coordinatedeleted) => {
        if (err) {
            res.status(500).send({ message: "error en el servidor" })
        } else {
            if (!coordinatedeleted) {
                res.status(404).send({ message: "coordenadas no encontradas" })
            } else {
                res.status(200).send({ message: "coordendas eliminadas correctamente" })
            }
        }
    })
}

//exportando funciones
module.exports = {
    createCoordinatesInvoice,
    getAllCoordinatesInvoice,
    updateCoordinateInvoice,
    deleteCoordinateInvoice
}