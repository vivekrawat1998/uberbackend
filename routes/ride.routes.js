const express = require('express');
const { createRide, getFare, confirmRide, startRide } = require('../controllers/ride.controllers');
const { check } = require('express-validator');
const { authUser, authCaptain } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/create', [
    check('pickup').notEmpty().withMessage('Pickup location is required'),
    check('destination').notEmpty().withMessage('Destination is required'),
    check('vehicleType').notEmpty().withMessage('Vehicle type is required')
], authUser, createRide);

router.get(
  '/getFare',
  check("pickup").isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
  check("destination").isString().isLength({ min: 3 }).withMessage('Invalid destination address'),
  getFare
)
router.post('/confirm',
  authCaptain,
  check('rideId').isMongoId().withMessage('Invalid ride id'),
  confirmRide
)

router.get('/start-ride', 
  authCaptain,
  check('rideId').isMongoId().withMessage("invalid ride id"),
  check('otp').isString().isLength({min:6, max:6}).withMessage("invalid  otp"),
  startRide
)

module.exports = router;
