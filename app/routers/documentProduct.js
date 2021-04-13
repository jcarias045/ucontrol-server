const path = require('path');
//const multer = require('multer');
let express = require('express');
const router = express.Router();
const DocumentProduct = require('../controllers/documentProduct');
const multipart =require('connect-multiparty');
const md_upload_avatar=multipart({uploadDir: "./app/uploads/document"});

router.post('/upload-documentProduct',md_upload_avatar, DocumentProduct.uploadDocument);
router.get('/get-filesProduct', DocumentProduct.getDocument)
router.get('/get-avatarProduct/:FileName', DocumentProduct.getAvatar)

module.exports = router;