const path = require('path');
//const multer = require('multer');
let express = require('express');
const router = express.Router();
const DocumentUser = require('../controllers/documentUser');
const multipart =require('connect-multiparty');
const md_upload_avatar=multipart({uploadDir: "./app/uploads/document"});

router.post('/upload-documentUser',md_upload_avatar, DocumentUser.uploadDocument);
router.get('/get-filesUser', DocumentUser.getDocument)
router.get('/get-avatarUser/:FileName', DocumentUser.getAvatar)

module.exports = router;