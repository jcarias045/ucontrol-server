let express = require('express');
let router = express.Router();


const sysop = require('../controllers/systemOptions');


router.get('/get-options/', sysop.getSystemOptions);
router.get('/get-useroptions/:id', sysop.getSysUserOptions);




module.exports = router;