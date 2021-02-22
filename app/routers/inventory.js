let express = require('express');
let router = express.Router();
const multipart =require('connect-multiparty');



const inventories = require('../controllers/inventories');


router.get('/get-inventories', inventories.getInventories);
router.post('/inventory-create', inventories.createInventory);
router.put('/inventory-update/:id', inventories.updateInventory);
router.delete('/inventory-delete/:id', inventories.deleteInventory);
router.get('/get-inventory', inventories.getInventoriesID);




router.get('/inventory-product/:id/:supplier', inventories.getNameProduct);
router.get('/get-productInventary/:id', inventories.getProductInfoxInventary);

module.exports = router;