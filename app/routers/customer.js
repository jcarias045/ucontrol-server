let express = require('express');
let router = express.Router();
 

//Test clientes
const customers = require('../controllers/customers.js');

//API para tabla de prueba clientes (si se fijan aca podemos definir las rutas para cada metodo)
router.post('/customer-create', customers.createCustomer);
//router.get('/api/customer/:id', customers.getCustomer);
router.get('/customers', customers.customers);
router.get('/customer-info/:id', customers.getCustomerInfo);
router.put('/customer-update/:id', customers.updateCustomer);
router.delete('/customer-delete/:id', customers.deleteCustomer);



module.exports = router;

