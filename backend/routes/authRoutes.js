import express from 'express';
import {body} from 'express-validator';
import 
    {login, register , getProfile, updateProfile, changePassword} 
    from '../controller/authController.js'
import protect from '../middleware/auth.js';

const router = express.Router();

const registerValidation = [
    body('username')
        .trim()
        .isLength({min:3})
        .withMessage("Username must be atleast 3 characters."),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage("Please enter a valid email"),
    body('password')
        .trim()
        .isLength({min:6})
        .withMessage("Password must be of 6 characters")
]

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage("Please enter a valid email "),
    body('password')
        .notEmpty()
        .withMessage("Password is required")
]

// Public Route
router.post('/register',registerValidation, register);
router.post('/login', loginValidation, login )

// Protected Route
router.get('/profile', protect, getProfile)
router.put('/profile', protect, updateProfile)
router.post('/change-password', protect, changePassword)

export default router;