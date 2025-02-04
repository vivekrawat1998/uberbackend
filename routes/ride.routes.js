// ride.routes.js
const express = require('express');
const { body ,query} = require('express-validator');
const authmiddleware = require('../middlewares/auth.middleware');
const { createRide } = require('../controllers/ride.controllers');
const {getFare} = require("../controllers/ride.controllers")
const {confirmRide} = require("../controllers/ride.controllers")
const {startRide} = require("../controllers/ride.controllers")

const router = express.Router();

router.post(
  '/create',
  authmiddleware.authUser, 
  body('pickup')
    .isString()
    .isLength({ min: 3 })
    .withMessage('Invalid pickup address'),
  body('destination')
    .isString()
    .isLength({ min: 3 })
    .withMessage('Invalid destination address'),
  body('vehicleType')
    .isString()
    .isLength({ min: 3 })
    .withMessage('Invalid vehicle type'),
  createRide 
);


router.get(
  '/getFare',
  query("pickup").isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
  query("destination").isString().isLength({ min: 3 }).withMessage('Invalid destination address'),
  getFare
)
router.post('/confirm',
  authmiddleware.authCaptain,
  body('rideId').isMongoId().withMessage('Invalid ride id'),
  confirmRide
)


router.get('/start-ride', 
  authmiddleware.authCaptain,
  query('rideId').isMongoId().withMessage("invalid ride id"),
  query('otp').isString().isLength({min:6, max:6}).withMessage("invalid  otp"),
  startRide
)

module.exports = router;
