let express = require('express');
let router = express.Router();
const multipart =require('connect-multiparty');
const md_upload_avatar=multipart({uploadDir: "./app/uploads/avatar"});
 

//Test clientes
const customers = require('../controllers/customers.js');

// //API para tabla de prueba clientes (si se fijan aca podemos definir las rutas para cada metodo)
router.post('/customer-create', customers.createCustomer);
router.get('/get-customers/:id/:userid/:profile',customers.getCustomers);
// router.get('/customers/:id/:user', customers.customers);
// router.get('/customer-info/:id', customers.getCustomerInfo);
router.put('/customer-update/:id', customers.updateCustomer);
// router.delete('/customer-delete/:id', customers.deleteCustomer);
// router.post('/sign-in-customer', customers.signInCustomer);
router.put('/desactive-customer/:id', customers.desactivateCustomer);
// router.put('/upload-image/:id',md_upload_avatar,customers.uploadImages);
// router.get('/get-image/:logoName', customers.getImages);
// router.get('/customer-userlist/:id', customers.customersUsers);
router.get('/get-customerdetails/:id', customers.getCustomersDetails);
router.get('/get-customersforsaleorder/:id/:userid',customers.getCustomersforSaleOrder);




module.exports = router;

