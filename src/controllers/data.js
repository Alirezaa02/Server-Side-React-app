const dataModel = require('../models/data');

const fetchAllVolcanoes = async (request, response) => {
    try {
        const { country, populatedWithin } = request.query;
        const validPopulatedDistances = ['5km', '10km', '30km', '100km'];

        if (!country) {
            return response.status(400).json({ error: true, message: "Country is a required query parameter." });
        }

        if (Object.keys(request.query).some(key => !['country', 'populatedWithin'].includes(key))) {
            return response.status(400).json({ error: true, message: "Invalid query parameters. Only 'country' and 'populatedWithin' are permitted." });
        }

        if (populatedWithin && !validPopulatedDistances.includes(populatedWithin)) {
            return response.status(400).json({ error: true, message: "Invalid value for populatedWithin. Only: 5km, 10km, 30km, 100km are permitted." });
        }

        const volcanoes = await dataModel.findAllVolcanoes(country, populatedWithin);
        response.status(200).json(volcanoes);
    } catch (error) {
        response.status(500).json({ error: true, message: error.message });
    }
};

const fetchVolcanoById = async (request, response) => {
    try {
        const { id } = request.params;

        let volcano;

        if (request.isAuthenticated) {
            volcano = await dataModel.findByIdWithPopulation(id);
        } else {
            volcano = await dataModel.findById(id);
        }

        if (!volcano) {
            return response.status(404).json({ error: true, message: `Volcano with ID: ${request.params.id} not found.` });
        }
        response.status(200).json(volcano);
    } catch (error) {
        response.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

const fetchCountries = async (request, response) => {
    try {
        const results = await dataModel.findAllCountries();
        const countries = results.map(item => item.country);
        response.status(200).json(countries);
    } catch (error) {
        response.status(400).json({ error: error.message });
    }
};

const fetchNearbyVolcanoesById = async (request, response) => {
    try {
        const { id } = request.params;

        let referenceVolcano;
        if (request.isAuthenticated) {
            referenceVolcano = await dataModel.findByIdWithPopulation(id);
        } else {
            referenceVolcano = await dataModel.findById(id);
        }

        if (!referenceVolcano) {
            return response.status(404).json({ error: true, message: 'Volcano not found' });
        }

        const { latitude, longitude } = referenceVolcano;
        let { distance } = request.query;

        distance = distance || '5';

        const volcanoes = await dataModel.findNearbyVolcanoes(latitude, longitude, distance, request.isAuthenticated);
        response.json(volcanoes);
    } catch (error) {
        response.status(400).json({ error: true, message: error.message });
    }
};

module.exports = {
    fetchCountries,
    fetchAllVolcanoes,
    fetchVolcanoById,
    fetchNearbyVolcanoesById
};