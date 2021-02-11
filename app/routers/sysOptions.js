let express = require('express');
let router = express.Router();


const sysop = require('../controllers/systemOptions');


router.get('/get-options/', sysop.getSystemOptions);




module.exports = router;