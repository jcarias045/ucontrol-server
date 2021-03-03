let express = require('express');
let router = express.Router();

const multipart =require('connect-multiparty');
const md_upload_avatar=multipart({uploadDir: "./app/uploads/avatar"});
const products = require('../controllers/products');

// router.get('/get-logo/:logoName', products.getLogo);
// router.put('/upload-logo/:id',md_upload_avatar,products.uploadLogo);
// router.post('/product-create', products.createProduct);
// router.put('/product-update/:id', products.updateProduct);
// router.delete('/product-delete/:id', products.deleteProduct);
// router.get('/get-product', products.getPoductsId);
// router.put('/desactive-product/:id', products.desactiveProduct);
router.get('/get-productsall', products.getPoducts);



router.get('/get-recommended-products/:id/:supplier',products.getRecommendedProducts);
router.get('/get-recommended-productsinventary/:id/:supplier',products.getRecommendedProductsInventory);

module.exports = router;