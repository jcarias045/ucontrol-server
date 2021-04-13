const path = require('path');
//const multer = require('multer');
let express = require('express');
const router = express.Router();
const Document = require('../controllers/document');
const multipart =require('connect-multiparty');
const md_upload_avatar=multipart({uploadDir: "./app/uploads/document"});


// const upload = multer({
//     storage: multer.diskStorage({
//       destination(req, file, cb) {
//         cb(null, './app/uploads/document');
//       },
//       filename(req, file, cb) {
//         cb(null, `${new Date().getTime()}_${file.originalname}`);
//       }
//     }),
//   });

// router.post('/upload', upload.single('file'), Document.uploadDocument );




router.post('/upload',md_upload_avatar, Document.uploadDocument);
router.get('/get-files', Document.getDocument)
router.get('/getAvatar/:FileName', Document.getAvatar)

// router.post("/upload", upload.single("file"), async function(req, res, next) {
//     const {
//       file,
//       body: { name }
//     } = req;
  
//     const fileName = name;
//     await pipeline(
//       file.stream,
//       fs.createWriteStream(`${__dirname}/uploads/document/${fileName}`)
//     );
  
//     res.send("File uploaded as " + fileName);
//   });

module.exports = router;