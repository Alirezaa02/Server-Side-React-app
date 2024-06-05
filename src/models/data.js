const db = require('../config/db');

const findAllVolcanoes = (country, populatedWithin) => {
    let query = db('data').select('id', 'name', 'country', 'region', 'subregion');

    if (country) {
        query = query.where({ country });
    }

    if (populatedWithin) {
        const populationColumn = `population_${populatedWithin}`;
        query = query.where(populationColumn, '>', 0);
    }

    return query;
};

const findById = (id) => {
    return db('data')
        .select([
            "id", "name", "country", "region", "subregion",
            "last_eruption", "summit", "elevation", "latitude", "longitude"
        ])
        .where({ id })
        .first();
};

const findByIdWithPopulation = (id) => {
    return db('data')
        .select([
            "id", "name", "country", "region", "subregion",
            "last_eruption", "summit", "elevation", "latitude", "longitude",
            "population_5km", "population_10km",
            "population_30km", "population_100km"
        ])
        .where({ id })
        .first();
};


const findAllCountries = () => {
    return db('data').distinct('country').orderBy('country', 'asc');
};

const findNearbyVolcanoes = async (latitude, longitude, distance = '10', isAuthenticated) => {
    const point = db.raw(`ST_GeomFromText('POINT(${longitude} ${latitude})')`);
    const distanceInMeters = distance * 1000;

    let query = db('data')
        .whereRaw(`ST_Distance_Sphere(point(longitude, latitude), ?) <= ?`, [point, distanceInMeters])
        .select('id', 'name', 'country', 'region', 'subregion', 'latitude', 'longitude');

    if (isAuthenticated) {
        query = query.select('population_5km', 'population_10km', 'population_30km', 'population_100km');
    }

    return query;
};


module.exports = {
    findAllVolcanoes,
    findAllCountries,
    findById,
    findByIdWithPopulation,
    findNearbyVolcanoes
};
