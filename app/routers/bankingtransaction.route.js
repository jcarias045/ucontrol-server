let express = require('express');
let router = express.Router();


const BankingTransaction = require('../controllers/bankingtransactions');


router.get('/get-bankingtransaction/:company/:id', BankingTransaction.getBankingTransaction);
router.post('/create-bankingtransaction', BankingTransaction.createBankingTransaction);
router.put('/update-bankingtransaction/:id', BankingTransaction.updateBankingTransaction);


module.exports = router;