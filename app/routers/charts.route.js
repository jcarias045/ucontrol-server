let express = require('express');
let router = express.Router();

const charts = require('../controllers/charts.controller');

router.get('/get-supplies-pays/:companyId', charts.CxP)
router.get('/get-categori-product/:companyId', charts.productsByCategory)

module.exports = router;