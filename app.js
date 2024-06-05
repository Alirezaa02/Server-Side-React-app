const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const fs = require('fs');
const https = require('https');

const dataRoutes = require('./src/api/data');
const userRoutes = require('./src/api/user');
const errorHandler = require('./src/middleware/error');

const app = express();
const PORT = process.env.PORT || 3000;

// Load Swagger documentation
const swaggerDocument = YAML.load('./public/docs/swagger.yaml');

// SSL Configuration
const privateKey = fs.readFileSync('selfsigned.key', 'utf8');
const certificate = fs.readFileSync('selfsigned.crt', 'utf8');
const sslOptions = { key: privateKey, cert: certificate };

// Middleware Configuration
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Allowed API endpoints
const allowedEndpoints = [
    '/', '/countries', '/volcanoes', '/volcano/{id}', '/user/register', '/user/login', '/user/{email}/profile', '/me',
    '/volcanoes/nearby/{id}', '/volcano/{id}/rating', '/volcano/{id}/ratings'
];

// Path validation middleware
app.use((request, response, next) => {
    const pathIsAllowed = allowedEndpoints.some(path => request.path === path || request.path.startsWith(path));
    if (pathIsAllowed) {
        next();
    } else {
        response.status(404).json({
            error: true,
            message: "Not Found"
        });
    }
});

// Routing
app.use('/', dataRoutes);
app.use('/user', userRoutes);

// Personalized endpoint
app.get('/me', (request, response) => {
    response.status(200).json({
        name: process.env.STD_NAME,
        student_number: process.env.STD_ID
    });
});

// Swagger UI Integration
app.use('/', swaggerUI.serve);
app.get('/', swaggerUI.setup(swaggerDocument));

// Error handling
app.use(errorHandler);

// HTTPS Server Setup
const secureServer = https.createServer(sslOptions, app);
secureServer.listen(PORT, () => {
    console.log(`HTTPS Server running on port ${PORT}`);
});

module.exports = app;