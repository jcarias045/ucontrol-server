let express = require('express');
let router = express.Router();


const purchaseDetails = require('../controllers/purchaseDetails');


router.get('/get-order-detals/:id', purchaseDetails.getPurchaseDetails);
router.delete('/delete-purchasedetail/:id',purchaseDetails.deletePurchaseDetail);

module.exports = router;