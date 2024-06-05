const { validationResult } = require('express-validator');
const dataModel = require('../models/data');
const ratingModel = require('../models/rating');
const userModel = require('../models/user');

const submitRating = async (request, response) => {
    try {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ error: true, message: "Request body incomplete: Rating is required."});
        }

        const { id } = request.params;

        if (!id) {
            return response.status(400).json({ error: true, message: "ID parameter is required." });
        }

        let targetVolcano;

        if (request.isAuthenticated) {
            targetVolcano = await dataModel.findByIdWithPopulation(id);
        } else {
            targetVolcano = await dataModel.findById(id);
        }

        if (!targetVolcano) {
            return response.status(404).json({ error: true, message: 'Volcano not found.' });
        }

        const { rating } = request.body;

        const user = await userModel.getUserIdByEmail(request.user.email);
        if (!user) return response.status(404).json({ error: true, message: "User not found." });
        const newRating = {
            volcano_id: id,
            user_id: user.id,
            rating,
            created_at: new Date()
        };
        await ratingModel.createRating(newRating);

        response.status(201).json("New rating added.");
    } catch (error) {

        response.status(400).json({ error: true, message: error.message });
    }
};

const fetchRatingsForVolcano = async (request, response) => {
    try {
        const { id } = request.params;

        if (!id) {
            return response.status(400).json({ error: true, message: "ID parameter is required." });
        }

        let targetVolcano;
        let profile;

        if (request.isAuthenticated) {
            targetVolcano = await dataModel.findByIdWithPopulation(id);
            profile = await userModel.findByEmail(request.user.email);
            if (!profile) return response.status(404).json({ error: true, message: "User not found." });

        } else {
            targetVolcano = await dataModel.findById(id);
        }

        if (!targetVolcano) {
            return response.status(404).json({ error: true, message: 'Volcano not found.' });
        }

        const ratings = await ratingModel.getRatingsByVolcanoId(id);

        const formattedRatings = ratings.map(rating => {

            if (!request.isAuthenticated) {
                delete rating.user_email;
            }
            return rating;
        });

        response.json(formattedRatings);
    } catch (error) {

        response.status(400).json({ error: true, message: error.message });
    }
};

module.exports = {
    submitRating,
    fetchRatingsForVolcano
};