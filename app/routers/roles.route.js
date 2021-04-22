let express = require('express');
let router = express.Router();


const roles = require('../controllers/roles');


router.get('/get-rolescompany/:id', roles.getRolesByCompany);
router.get('/get-roles', roles.getRolesSystem);
router.post('/create-rol', roles.createRol);
router.get('/get-opcionesmenu/:id', roles.getOptionsSystemRol);
router.put('/update-rol/:id', roles.updateRol);
router.put('/changestate-rol/:id', roles.changeStateRol);
router.get('/opciones/:id', roles.opciones);


module.exports = router;