let express = require('express');
let router = express.Router();
const brands = require('../controllers/brands');

router.get('/get-brands/:id', brands.getBrands);
router.post('/create-brand', brands.createBrands);
router.put('/update-brand/:id', brands.updateBrand);
router.delete('/delete-brand/:id', brands.deleteBrand);
router.get('/get-brandsid/:id', brands.getBrandId);

module.exports = router;