let express = require('express');
let router = express.Router();
const multipart =require('connect-multiparty');
const md_upload_avatar=multipart({uploadDir: "./app/uploads/avatar"});


const companies = require('../controllers/companies');


router.get('/get-companies', companies.getCompanies);
router.get('/get-logo/:avatarName', companies.getAvatar);
router.put('/upload-logo/:id',md_upload_avatar,companies.uploadAvatar);
router.post('/company-create', companies.createCompany);
router.put('/company-update/:id', companies.updateCompany);
router.delete('/company-delete/:id', companies.deleteCompany);
// router.get('/getcompany/:id',companies.getCompany);
router.get('/get-comapnyinfo/:id',companies.getInfoCompany);

// router.get('/get-company', companies.getCompaniesId);
router.put('/desactive-company/:id', companies.desactivateCompany);

module.exports = router;

// /get-companies
// /company-create
// /company-update/