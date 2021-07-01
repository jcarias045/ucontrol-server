let express = require('express');
let router = express.Router();

const multipart =require('connect-multiparty');
const md_upload_avatar=multipart({uploadDir: "./app/uploads/avatar"});
const products = require('../controllers/products');

// router.get('/get-logo/:logoName', products.getLogo);
// router.put('/upload-logo/:id',md_upload_avatar,products.uploadLogo);
router.post('/product-create', products.createProduct);
router.put('/update-product/:id', products.updateProduct);
router.delete('/product-delete/:id', products.deleteProduct);
router.get('/get-product', products.getPoductsId);
router.put('/desactive-product/:id', products.desactiveProduct);
router.get('/get-productsall/:id', products.getPoducts);
router.get('/get-pdfproductlist/:id', products.ExportProductList)
// router.get('/product-info/:id',products.getProduct);



router.get('/get-recommended-products/:id/:supplier',products.getRecommendedProducts);
router.get('/get-recommended-productsinventary/:id/:supplier',products.getRecommendedProductsInventory);
router.get('/get-productsinventory/:id/:company',products.getProductByInventory);
router.get('/get-recipe/:id',products.getRecipe);
router.delete('/delete-recipeitem/:id', products.deleteRecipeItem);
router.get('/get-productifrecipe/:id', products.getProductsRecipes); //para obtener productos que son receta
router.get('/get-productdata/:id', products.getProductData); //para obtener solo informacion del prodcuto seleccionado
router.get('/get-recipedetailsinventary/:id/:company', products.getRecipeDetails); //para obtener solo informacion del prodcuto seleccionado

//obteniendo producto por codigo
router.get('/get-product-cod/:codproduct/:companyId', products.getProductByCod)

module.exports = router;