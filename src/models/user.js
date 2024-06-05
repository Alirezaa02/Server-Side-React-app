const db = require('../config/db');
const { DateTime } = require("luxon");


const formatDate = (date) => {

    return DateTime.fromJSDate(date, { zone: 'local' }).toISODate();
};


const findByEmailWithPassword = async (email) => {
    const user = await db('users')
        .select(['email', 'firstName', 'lastName', 'dob', 'address', 'password'])
        .where({ email })
        .first();
    if (user && user.dob) {
        user.dob = formatDate(user.dob);
    }
    return user;
};

const getUserIdByEmail = async (email) => {
    const user = await db('users')
        .select(['id'])
        .where({ email })
        .first();
    return user;
};

const findByEmail = async (email) => {
    const user = await db('users')
        .select(['email', 'firstName', 'lastName', 'dob', 'address'])
        .where({ email })
        .first();
    if (user && user.dob) {
        user.dob = formatDate(user.dob);
    }
    return user;
};

const findByEmailPublic = async (email) => {
    const user = await db('users')
        .select(['email', 'firstName', 'lastName'])
        .where({ email })
        .first();
    return user;
};

const create = async (user) => {
    const [insertedId] = await db('users').insert(user);
    return insertedId;
};

const updateByEmail = async (email, userData) => {

    const updateResult = await db('users')
        .where({ email })
        .update(userData);


    if (updateResult === 0) {
        throw new Error('User not found');
    }

    const updatedUser = await findByEmail(email);

    return updatedUser;
};

module.exports = {
    findByEmailWithPassword,
    getUserIdByEmail,
    findByEmail,
    findByEmailPublic,
    create,
    updateByEmail
};