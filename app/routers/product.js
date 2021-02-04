let express = require('express');
let router = express.Router();
 

//Test clientes
const product = require('../controllers/products.js');

//API para tabla de prueba clientes (si se fijan aca podemos definir las rutas para cada metodo)
router.post('/product-create', product.createProduct);
router.get('/product', product.products);
router.get('/product-info/:id', product.getProductInfo);
router.put('/product-update/:id', product.updateProduct);
router.delete('/product-delete/:id', product.deleteProduct);


module.exports = router;