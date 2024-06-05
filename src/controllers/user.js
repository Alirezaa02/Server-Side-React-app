const { validationResult } = require('express-validator');
const userModel = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const createUser = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(400).json({ error: true, message: "Request body incomplete, both email and password are required" });
    }

    try {
        const { email, password } = request.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const existingUser = await userModel.findByEmail(email);
        if (existingUser) {
            return response.status(409).json({ error: true, message: "User already exists" });
        }
        await userModel.create({
            email,
            password: hashedPassword
        });
        response.status(201).json({ message: "User created" });
    } catch (error) {
        response.status(400).json({ error: true, message: error.message });
    }
};

const authenticateUser = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(400).json({ error: true, message: "Request body incomplete, both email and password are required" });
    }

    try {
        const { email, password } = request.body;
        const user = await userModel.findByEmailWithPassword(email);
        if (!user) {
            return response.status(401).json({ error: true, message: 'User not found' });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return response.status(401).json({ error: true, message: "Incorrect email or password" });
        }

        const authToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });

        response.status(200).json({
            token: authToken,
            token_type: "Bearer",
            expires_in: 86400
        });
    } catch (error) {
        response.status(400).json({ error: true, message: error.message });
    }
};

const retrieveUserProfile = async (request, response) => {
    try {
        let profile;

        if (request.isAuthenticated && request.params.email === request.user.email) {
            profile = await userModel.findByEmail(request.params.email);
        } else {
            profile = await userModel.findByEmailPublic(request.params.email);
        }

        if (!profile) return response.status(404).json({ error: true, message: "User not found" });
        response.status(200).json(profile);
    } catch (error) {
        response.status(400).json({ error: true, message: error.message });
    }
};

const editUserProfile = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(400).json({ error: true, message: errors.array()[0].msg });
    }

    if (request.params.email !== request.user.email) {
        return response.status(403).json({ error: true, message: 'Forbidden' });
    }

    try {
        const profileData = request.body;
        const { password, email: newEmail, ...safeUpdateData } = profileData;
        const updatedUser = await userModel.updateByEmail(request.user.email, safeUpdateData);
        response.status(200).json(updatedUser);
    } catch (error) {
        if (error.message === 'User not found') {
            return response.status(404).json({ error: true, message: 'User not found' });
        }
        response.status(500).json({ error: true, message: 'Internal Server Error' });
    }
};

module.exports = {
    createUser,
    authenticateUser,
    retrieveUserProfile,
    editUserProfile
};