let express = require('express');
let router = express.Router();
const Document = require('../controllers/document');
const multipart =require('connect-multiparty');
const md_upload_avatar=multipart({uploadDir: "./app/uploads/document"});

router.post('/upload',md_upload_avatar, Document.uploadDocument);
router.get('/get-files', Document.getDocument)

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