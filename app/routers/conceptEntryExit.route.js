//importando controlador para registrar las rutas
let express = require('express');
let router = express.Router();

const concepts = require('../controllers/conceptEntryExit.controller');

//ruta para crear un nuevo concepto
router.post('/create-concept-entryexit', concepts.createConcept)
//ruta para tomar conceptos por empresa
router.get('/get-conceptentryexitbycompany/:id', concepts.getConceptbyCompany)
//ruta para editar el concepto
router.put('/update-conceptentryexit', concepts.updateConcept)
//ruta para eliminar un concepto
router.delete('/delete-conceptentryexit/:id', concepts.deleteConcept)
//ruta para tomar un concepto por su id
router.get('/get-concetpentryexitbyid/:id', concepts.getConceptById)

//exportando conceptos
module.exports = router;