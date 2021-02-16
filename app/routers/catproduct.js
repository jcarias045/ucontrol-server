let express = require('express');
let router = express.Router();
const catproducts = require('../controllers/catproducts');

router.get('/get-catproducts', catproducts.getCatProducts);
router.post('/catproducts-create', catproducts.creatCatProduct);
router.delete('/catproducts-delete/:id',catproducts.deleteCatProduct);
router.put('/catproducts-update/:id', catproducts.updateCatProduct);

//para que el cliente pueda ver que informacion de la descripcion de la categoriga 
router.get('/get-catproduct',catproducts.getCatProductsId);

module.exports = router;