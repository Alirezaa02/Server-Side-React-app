const express = require('express');
const { body } = require('express-validator');
const userRouter = express.Router();
const userController = require('../controllers/user');
const {verifyAuthentication, verifyAuthenticationForPublic} = require('../middleware/auth');

// Route for user registration
userRouter.post('/register', [
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], userController.createUser);

// Route for user login
userRouter.post('/login', [
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('password').not().isEmpty().withMessage('Password is required')
], userController.authenticateUser);

// Route for fetching user profile
userRouter.get('/:email/profile', verifyAuthenticationForPublic, userController.retrieveUserProfile);

// Validation rules for updating user information
const userUpdateValidationRules = [
    body('firstName').not().isEmpty().withMessage('Request body incomplete: firstName, lastName, dob and address are required.'),
    body('lastName').not().isEmpty().withMessage('Request body incomplete: firstName, lastName, dob and address are required.'),
    body('dob').not().isEmpty().withMessage('Request body incomplete: firstName, lastName, dob and address are required.'),
    body('address').not().isEmpty().withMessage('Request body incomplete: firstName, lastName, dob and address are required.'),
    body('firstName').isString().withMessage('Request body invalid: firstName, lastName and address must be strings only.'),
    body('lastName').isString().withMessage('Request body invalid: firstName, lastName and address must be strings only.'),
    body('dob')
        .trim()
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('Invalid input: dob must be a real date in format YYYY-MM-DD.')
        .custom((value) => {
            const date = new Date(value);
            const [year, month, day] = value.split('-');
            if (date.getFullYear() != year || date.getMonth() + 1 != month || date.getDate() != day) {
                throw new Error('Invalid input: dob must be a real date in format YYYY-MM-DD.');
            }
            const now = new Date();
            if (date > now) {
                throw new Error('Invalid input: dob must be a date in the past.');
            }
            return true;
        }),
    body('address').isString().withMessage('Request body invalid: firstName, lastName and address must be strings only.')
];

// Route for updating user profile
userRouter.put('/:email/profile', verifyAuthentication, userUpdateValidationRules, userController.editUserProfile);

module.exports = userRouter;