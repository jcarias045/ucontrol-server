let express = require('express');
let router = express.Router();
const notes = require('../controllers/notes');
router.get('/get-notes', notes.getNotes);
router.post('/note-create', notes.createNote);
router.put('/note-update/:id', notes.updateNote);
router.delete('/note-delete/:id', notes.deleteNote);
router.get('/get-note', notes.getNotesID);

module.exports = router;