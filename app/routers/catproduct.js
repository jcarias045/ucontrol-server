let express = require('express');
let router = express.Router();
const catproducts = require('../controllers/CatProducts');

router.get('/get-catproducts/:id', catproducts.getCatProducts);
router.post('/catproducts-create', catproducts.creatCatProduct);
router.delete('/catproducts-delete/:id',catproducts.deleteCatProduct);
router.put('/catproducts-update/:id', catproducts.updateCatProduct);
router.get('/get-catproduct/:id',catproducts.getCatProductsId);

module.exports = router;