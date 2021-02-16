let express = require('express');
let router = express.Router();


const profiles = require('../controllers/profiles');


router.get('/get-profiles', profiles.getProfiles);
router.post('/profile-create', profiles.createProfile);
router.delete('/profile-delete/:id',profiles.deleteProfile);
router.put('/profile-update/:id', profiles.updateProfile);

//para obtener nada más el id y nombre 
router.get('/get-profile',profiles.getProfilesId);
router.get('/get-options/:id',profiles.getOptions);

module.exports = router;