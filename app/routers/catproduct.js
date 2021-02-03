let express = require('express');
let router = express.Router();
 

//Test clientes
const catproduct = require('../controllers/catproduct.js');

//API para tabla de prueba clientes (si se fijan aca podemos definir las rutas para cada metodo)
router.post('/customer-create', catproduct.createCatProduct);
//router.get('/api/CatProduct/:id', catproduct.getCatProduct);
router.get('/catproduct', catproduct.catproducts);
router.get('/catproduct-info/:id', catproduct.getCatProductInfo);
router.put('/catproduct-update/:id', catproduct.updateCatProduct);
router.delete('/catproduct-delete/:id', catproduct.deleteCatProduct);



module.exports = router;

