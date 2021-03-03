let express = require('express');
let router = express.Router();
const notescustomer = require('../controllers/notescustomers');

router.get('/get-notescustomer/:id/:customer', notescustomer.getNotesCustomer);
router.post('/create-notecustomer', notescustomer.createNoteCustomer);
router.put('/update-notecustomer/:id', notescustomer.updateNote);
router.delete('/delete-notecustomer/:id', notescustomer.deleteNote);


module.exports = router;