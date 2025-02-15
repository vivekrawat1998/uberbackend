const express = require('express');
const router = express.Router();
const mapController = require('../controllers/map.controller');
const { authUser } = require('../middlewares/auth.middleware');

router.get('/coordinates', authUser, mapController.getCordinates);
router.get('/distance-time', authUser, mapController.getDistanceTime);
router.get('/get-suggestions', authUser, mapController.getAutoCompleteSuggestions);

module.exports = router;
