let express = require('express');
let router = express.Router();
const bookingsSupplier = require('../controllers/appointmentssuppliers');

router.get('/get-bookingsupplier/:id/:supplierid', bookingsSupplier.getBookingSupplier);
router.post('/create-bookingsupplier', bookingsSupplier.createBookingSupplier);
router.put('/update-bookingsupplier/:id', bookingsSupplier.updateBookingSupplier);
router.delete('/delete-bookingsupplier/:id', bookingsSupplier.deleteBookingSupplier);



module.exports = router;