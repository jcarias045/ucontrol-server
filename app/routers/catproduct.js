let express = require('express');
let router = express.Router();

const catproducts = require('../controllers/catproducts');

router.get('/get-catproducts', catproducts.getCatProducts);
router.post('/catproducts-create', catproducts.creatCatProduct);
router.delete('/catproducts-delete/:id',catproducts.deleteCatProduct);
router.put('/catproducts-update/:id', catproducts.updateCatProduct);

//para obtener nada más el id y nombre 
router.get('/get-catproduct',catproducts.getCatProductsId);

module.exports = router;