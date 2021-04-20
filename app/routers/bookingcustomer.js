let express = require('express');
let router = express.Router();
const bookingsCustomers = require('../controllers/appointmentscustomers');

router.get('/get-bookingcustomer/:id/:customerid', bookingsCustomers.getBookingCustomer);
router.get('/get-bookingallcustomer/:id', bookingsCustomers.getBookingAllCustomer);
router.get('/get-bookingId/:id',bookingsCustomers.getBookingId);
router.post('/create-bookingcustomer', bookingsCustomers.createBookingCustomer);
router.put('/update-bookingcustomer/:id',bookingsCustomers.updateBookingCustomer);
router.delete('/delete-bookingcustomer/:id', bookingsCustomers.deleteBookingCustomer);
// router.put('/desactivate-bookingcustomer/:id', bookingsCustomers.desactiveBooking);

module.exports = router;