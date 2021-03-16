let express = require('express');
let router = express.Router();
 

//Test clientes
// const customers = require('../controllers/customers.js');

//API para tabla de prueba clientes (si se fijan aca podemos definir las rutas para cada metodo)
//router.post('/api/customer', customers.createCustomer);
//router.get('/api/customer/:id', customers.getCustomer);
// router.get('/customers', customers.customers);
//router.put('/api/customer', customers.updateCustomer);
//router.delete('/api/customer/:id', customers.deleteCustomer);

//Test UIControlDB-test
const users = require('../controllers/users');


router.get('/users', users.getUsers);
router.post('/sign-in',users.signIn);
// router.get('/get-users',users.getUsers);
router.post('/create-user',users.createUser);
router.put('/update-user/:id',users.updateUser);
router.delete('/delete-user/:id',users.deleteUser);
// router.put('/desactivate-user/:id',users.desactivateUser);

module.exports = router;