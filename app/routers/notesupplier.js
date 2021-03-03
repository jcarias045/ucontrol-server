let express = require('express');
let router = express.Router();
const notessupplier = require('../controllers/notessuppliers');

router.get('/get-notessupplier/:id/:supplier', notessupplier.getNotesSupplier);
router.post('/create-notessupplier', notessupplier.createNoteSupplier);
router.put('/update-notessupplier/:id', notessupplier.updateNote);
router.delete('/delete-notes-supplier/:id', notessupplier.deleteNote);

module.exports = router;