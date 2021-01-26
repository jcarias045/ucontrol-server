let express = require('express');
let router = express.Router();
 

//Test clientes
const customers = require('../controllers/customers.js');

//API para tabla de prueba clientes (si se fijan aca podemos definir las rutas para cada metodo)
//router.post('/api/customer', customers.createCustomer);
//router.get('/api/customer/:id', customers.getCustomer);
router.get('/customers', customers.customers);
//router.put('/api/customer', customers.updateCustomer);
//router.delete('/api/customer/:id', customers.deleteCustomer);



module.exports = router;