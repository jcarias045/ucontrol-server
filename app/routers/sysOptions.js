let express = require('express');
let router = express.Router();


const sysop = require('../controllers/systemOptions');

router.get('/get-options/:id', sysop.getSystemOptions);
router.get('/get-optionsroles', sysop.getSystemOptionsrol);
router.get('/get-useroptions/:id', sysop.getSysUserOptions);
router.get('/get-grupos', sysop.getGrupos);
router.post('/create-grupo', sysop.createSystemGroup);
router.post('/create-option', sysop.createSystemOption);
router.put('/update-grupo/:id', sysop.updateGrupo);
router.put('/update-option/:id', sysop.updateOption);
router.put('/changestate-option/:id', sysop.changeStateOption);


module.exports = router;