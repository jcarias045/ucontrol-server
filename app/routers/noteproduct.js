let express = require('express');
let router = express.Router();
const notesproduct = require('../controllers/notesproducts');

router.get('/get-notesproduct/:id/:product', notesproduct.getNotesProduct);
router.post('/create-noteproduct', notesproduct.createNoteProduct);
router.put('/update-noteproduct/:id', notesproduct.updateNote);
router.delete('/delete-noteproduct/:id', notesproduct.deleteNote);


module.exports = router;