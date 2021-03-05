let express = require('express');
let router = express.Router();
const jobs = require('../controllers/jobs');

router.get('/get-jobs', jobs.getJobs);
router.post('/create-job', jobs.createJob);
router.put('/job-update/:id', jobs.updateJob);
router.delete('/delete-job/:id', jobs.deleteJob);
router.get('/get-jobid/:id', jobs.getJobId);
router.put('/desactive-job/:id',jobs.desactivateJob);

module.exports = router;