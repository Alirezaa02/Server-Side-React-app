const db = require('../config/db');

const createRating = (ratingData) => {
    return db('ratings').insert(ratingData).then(ids => ({ id: ids[0], ...ratingData }));
};

const getRatingsByVolcanoId = (volcano_id) => {
    return db('ratings')
        .where({ volcano_id })
        .join('users', 'ratings.user_id', '=', 'users.id')
        .select('ratings.id', 'rating', 'created_at', 'users.email as user_email');
};

module.exports = {
    createRating,
    getRatingsByVolcanoId
};
