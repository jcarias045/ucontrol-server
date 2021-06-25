let express = require('express');
let router = express.Router();


const sectors = require('../controllers/sectors');


router.get('/get-sectors/:id', sectors.getSectors);
router.post('/create-sectors', sectors.createSector);
//ruta para obtener todos los sectores registrados en la base de datos
router.get('/get-all-sector', sectors.getAllSectors);
//ruta para hacer actualizacion a un sector
router.put('/update-sector/:id', sectors.updateSector);
//ruta para eliminar un sector
router.delete('/delete-sector/:id', sectors.deleteSector);


module.exports = router;