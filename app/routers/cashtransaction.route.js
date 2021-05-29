let express = require('express');
let router = express.Router();


const cashTransaction = require('../controllers/cashtransactions');


router.get('/get-cashtransaction/:id', cashTransaction.getCashTransaction);
router.post('/create-cashtransaction', cashTransaction.createCashTransaction);
router.put('/update-cashtransaction/:id', cashTransaction.updateCashTransaction);


module.exports = router;