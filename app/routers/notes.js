let express = require('express');
let router = express.Router();
 

//Test clientes
const notes = require('../controllers/note.js');

//API para tabla de prueba clientes (si se fijan aca podemos definir las rutas para cada metodo)
router.post('/notes-create', notes.createNotes);
//router.get('/api/notes/:id', notes.getnotes);
router.get('/notes', notes.notes);
router.get('/notes-info/:id', notes.getNotesInfo);
router.put('/notes-update/:id', notes.updateNotes);
router.delete('/notes-delete/:id', notes.deleteNotes);



module.exports = router;

