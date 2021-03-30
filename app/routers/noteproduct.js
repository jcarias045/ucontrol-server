let express = require('express');
let router = express.Router();
const notesproduct = require('../controllers/notesproducts');

router.get('/get-notesproduct/:id/:product', notesproduct.getNotesProduct);
router.post('/create-noteproduct', notesproduct.createNoteProduct);
router.put('/update-noteproduct/:id', notesproduct.updateNote);
router.delete('/delete-noteproduct/:id', notesproduct.deleteNote);


module.exports = router;

//http://localhost:3050/api/create-user
//http://localhost:3050/api/users
//http://localhost:3050/api/delete-user/6050281607b30d61f02f1e46