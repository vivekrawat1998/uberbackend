const express = require('express');
const { registerUser, loginUser, getUserProfile, logoutUser } = require('../controllers/user.controllers');
const { check } = require('express-validator');
const { authUser } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', [
    check('fullname.firstname').isLength({ min: 3 }).withMessage('First name must be at least 3 characters long'),
    check('fullname.lastname').isLength({ min: 3 }).withMessage('Last name must be at least 3 characters long'),
    check('email').isEmail().withMessage('Please enter a valid email'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], registerUser);

router.post('/login', [
    check('email').isEmail().withMessage('Invalid Email'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], loginUser);

router.get('/profile', authUser, getUserProfile);

router.get('/logout', authUser, logoutUser);

module.exports = router;