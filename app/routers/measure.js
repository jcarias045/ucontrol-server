let express = require('express');
let router = express.Router();
const measure = require('../controllers/measures');

router.get('/get-measures/:id', measure.getMeasures);
router.post('/create-measures', measure.createMeasure);
router.put('/update-measure/:id', measure.updateMeasure);
router.delete('/delete-measure/:id', measure.deleteMeasure);


module.exports = router;