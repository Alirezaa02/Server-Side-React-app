const jsonWebToken = require('jsonwebtoken');

const verifyAuthentication = (request, response, continueMiddleware) => {
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader) {
        return response.status(401).json({ error: true, message: 'Authentication token required' });
    }

    if (!authorizationHeader.startsWith('Bearer ')) {
        return response.status(401).json({
            error: true,
            message: "Authorization header is malformed"
        });
    }

    const accessToken = authorizationHeader.split(' ')[1];
    try {
        const verifiedToken = jsonWebToken.verify(accessToken, process.env.JWT_SECRET);
        request.user = verifiedToken;
        request.isAuthenticated = true;
        continueMiddleware();
    } catch (verificationError) {
        if (verificationError instanceof jsonWebToken.TokenExpiredError) {
            return response.status(401).json({ error: true, message: "JWT token has expired" });
        } else if (verificationError instanceof jsonWebToken.JsonWebTokenError) {
            return response.status(401).json({ error: true, message: "Invalid JWT token" });
        } else {
            return response.status(500).json({ error: true, message: "Error processing token" });
        }
    }
};

const verifyAuthenticationForPublic = (request, response, continueMiddleware) => {
    const authorizationHeader = request.headers.authorization;
    if (authorizationHeader) {
        const parts = authorizationHeader.split(' ');
        if (authorizationHeader.startsWith('Bearer ') && parts.length === 2) {
            const accessToken = parts[1];

            try {
                const verifiedToken = jsonWebToken.verify(accessToken, process.env.JWT_SECRET);
                request.user = verifiedToken;
                request.isAuthenticated = true;
                continueMiddleware();
            } catch (verificationError) {
                if (verificationError instanceof jsonWebToken.TokenExpiredError) {
                    return response.status(401).json({
                        error: true,
                        message: "JWT token has expired"
                    });
                } else if (verificationError instanceof jsonWebToken.JsonWebTokenError) {
                    return response.status(401).json({
                        error: true,
                        message: "Invalid JWT token"
                    });
                } else {
                    return response.status(500).json({
                        error: true,
                        message: "Error processing token"
                    });
                }
            }
        } else {
            return response.status(401).json({
                error: true,
                message: "Authorization header is malformed"
            });
        }
    } else {
        request.isAuthenticated = false;
        continueMiddleware();
    }
};

module.exports = {
    verifyAuthentication,
    verifyAuthenticationForPublic
};