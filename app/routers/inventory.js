let express = require('express');
let router = express.Router();
const multipart =require('connect-multiparty');



const inventories = require('../controllers/inventories');


// router.get('/get-inventories/:id', inventories.getInventories);
router.post('/inventory-create', inventories.createInventory);
// router.put('/inventory-update/:id', inventories.updateInventory);
// router.delete('/inventory-delete/:id', inventories.deleteInventory);
// router.get('/get-inventory', inventories.getInventoriesID);


router.get('/get-inventory/:id', inventories.getInventories);
router.get('/get-inventoryexcel/:id', inventories.getInventory);


router.get('/inventory-product/:id/:supplier', inventories.getNameProduct);
router.get('/get-productInventary/:id', inventories.getProductInfoxInventary);
router.get('/get-kardex/:id', inventories.getKardex);

module.exports = router;