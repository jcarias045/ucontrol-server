let express = require('express');
let router = express.Router();
const discounts = require('../controllers/discounts');

router.get('/get-discounts', discounts.getDiscounts);
router.post('/create-discount', discounts.createDiscount);
router.put('/discount-update/:id', discounts.updateDiscount);
router.delete('/delete-discount/:id', discounts.deleteDiscount);
// router.get('/get-discountid/:id', discounts.getDiscountId)

module.exports = router;