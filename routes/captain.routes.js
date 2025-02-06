const express = require('express');
const { registerCaptain, loginCaptain, getCaptainProfile, logoutCaptain } = require('../controllers/captain.controllers');
const { check } = require('express-validator');
const { authCaptain } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', [
    check('fullname.firstname').isLength({ min: 3 }).withMessage('First name must be at least 3 characters long'),
    check('fullname.lastname').isLength({ min: 3 }).withMessage('Last name must be at least 3 characters long'),
    check('email').isEmail().withMessage('Please enter a valid email'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    check('vehicle.color').isLength({ min: 3 }).withMessage('Color must be at least 3 characters long'),
    check('vehicle.plate').isLength({ min: 3 }).withMessage('Plate must be at least 3 characters long'),
    check('vehicle.capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
    check('vehicle.vehicleType').isIn(['car', 'motorcycle', 'auto']).withMessage('Invalid vehicle type')
], registerCaptain);

router.post(
  "/login",
  [
    check("email").isEmail().withMessage("Invalid Email"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  loginCaptain
);

router.get("/profile", authCaptain, getCaptainProfile);

router.get("/logout", authCaptain, logoutCaptain);

module.exports = router;
