//importando express 
let express = require('express');
let router = express.Router();

//constante para rutas de sectores
const CoordiantesInvoice = require('../controllers/coordinatesInvoice');

//url para crear nuevas coordenadas
router.post('/create-coordinate', CoordiantesInvoice.createCoordinatesInvoice);
//url para obtener las coordenadas desde la base
router.get('/get-all-coordinate', CoordiantesInvoice.getAllCoordinatesInvoice);
//url para actualizar coordenadas
router.put('/update-coordinate/:id', CoordiantesInvoice.updateCoordinateInvoice);
//url para eliminar coordendas
router.delete('/delete-coordinate/:id', CoordiantesInvoice.deleteCoordinateInvoice);

//exportando las url
module.exports = router;