let express = require('express');
let router = express.Router();
const multipart =require('connect-multiparty');



const output = require('../controllers/productOutput');


router.get('/get-output/:id', output.getProductOutput);
router.post('/add-output', output.createProductOutput);
router.get('/get-outputdetails/:id', output.viewProductOutputDetails);
router.put('/anular-output/:id/:company', output.anularOutput);
router.post('/add-outputsininvoice', output.createProductOutputsinInvoice);

// router.get('/get-outputdetails/:id', output.getProductoutput);
// router.put('/update-changestateentry/:id', output.anularProductEntry);
// router.post('/add-outputwithoutinvoice/:id', output.createProductEntryWithoutInvoice);
// router.get('/add-productsentry/:id', entries.getListProductIngresadoSinFactura);




module.exports = router;