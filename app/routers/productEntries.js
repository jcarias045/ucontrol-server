let express = require('express');
let router = express.Router();
const multipart =require('connect-multiparty');



const entries = require('../controllers/productsEntries');


router.get('/get-entries/:id/:company/:profile', entries.getEntries);
router.post('/add-entries/:id', entries.createProductEntry);
router.get('/get-entriesdetails/:id', entries.getProductEntries);
router.put('/update-changestateentry/:id', entries.anularProductEntry);
router.post('/add-entrieswithoutinvoice/:id', entries.createProductEntryWithoutInvoice);
// router.get('/add-productsentry/:id', entries.getListProductIngresadoSinFactura);




module.exports = router;