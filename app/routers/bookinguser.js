let express = require('express');
let router = express.Router();
const bookingsUser = require('../controllers/appointmentsuser');

router.get('/get-bookingUser/:id/:Userid', bookingsUser.getBookingUser);
//router.get('/get-BookingCustomerInfo/:id', bookingsUser.getBookingCustomerInfo)
router.post('/create-bookingUser', bookingsUser.createBookingUser);
router.put('/update-bookingUser/:id',bookingsUser.updateBookingUser);
router.delete('/delete-bookingUser/:id', bookingsUser.deleteBookingUser);
// router.put('/desactivate-bookingUser/:id', bookingsUser.desactiveBooking);

module.exports = router;