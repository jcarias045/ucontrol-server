let express = require('express');
let router = express.Router();
const notepersonal = require('../controllers/notepersonal');

router.get('/get-notespersonal/:id/:personal', notepersonal.getNotesPersonal);
router.post('/create-notepersonal', notepersonal.createNotePersonal);
router.put('/update-notepersonal/:id', notepersonal.updateNotePersonal);
router.delete('/delete-notepersonal/:id', notepersonal.deleteNotePersonal);


module.exports = router;