const path = require('path');
//const multer = require('multer');
let express = require('express');
const router = express.Router();
const DocumentPersonal = require('../controllers/documentPersonal');
const multipart =require('connect-multiparty');
const md_upload_avatar=multipart({uploadDir: "./app/uploads/document"});

router.post('/upload-documentPersonal',md_upload_avatar, DocumentPersonal.uploadDocument);
router.get('/get-filesPersonal', DocumentPersonal.getDocument)
router.get('/get-avatarPersonal/:FileName', DocumentPersonal.getAvatar)

module.exports = router;