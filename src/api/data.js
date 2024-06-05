const express = require('express');
const apiRouter = express.Router();
const { body, check, validationResult } = require('express-validator');
const dataController = require('../controllers/data');
const ratingController = require('../controllers/rating');
const {verifyAuthentication, verifyAuthenticationForPublic} = require('../middleware/auth');

// Route for getting countries
apiRouter.get('/countries', dataController.fetchCountries);

// Route for getting all volcanoes
apiRouter.get('/volcanoes/', dataController.fetchAllVolcanoes);

// Middleware to validate absence of query parameters
function ensureNoQueryParams(request, response, proceed) {
    if (Object.keys(request.query).length > 0) {
        return response.status(400).json({
            error: true,
            message: "Invalid query parameters. Query parameters are not permitted."
        });
    }
    proceed();
}

// Route for getting specific volcano by ID
apiRouter.get('/volcano/:id', verifyAuthenticationForPublic, ensureNoQueryParams, dataController.fetchVolcanoById);

// Validation rules for volcano queries
const validateVolcanoDetails = [
    check('id').isNumeric().withMessage('ID must be a numeric value'),
    check('distance').optional().isNumeric().withMessage('Distance must be a numeric value'),
    (request, response, proceed) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({
                error: true,
                message: errors.array().map(err => err.msg).join('. ')
            });
        }
        proceed();
    }
];

// Route for getting nearby volcanoes based on ID
apiRouter.get('/volcanoes/nearby/:id', verifyAuthenticationForPublic, validateVolcanoDetails, dataController.fetchNearbyVolcanoesById);

// Route for posting a rating for a specific volcano
apiRouter.post('/volcano/:id/rating', verifyAuthentication, [
    body('rating')
        .not().isEmpty().withMessage('Request body incomplete: Rating is required.')
        .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5')
], ratingController.submitRating);

// Route for getting ratings for a specific volcano
apiRouter.get('/volcano/:id/ratings', verifyAuthenticationForPublic, ratingController.fetchRatingsForVolcano);

module.exports = apiRouter;