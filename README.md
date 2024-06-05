# Volcanoes Around the World API

## Description
This API provides information about volcanoes around the world and allows user management functionality. It supports operations such as fetching volcano data, registering users, and managing user profiles.

## Getting Started

### Prerequisites
- Node.js
- npm

### Installing
1. Clone the repository
2. Run `npm install` to install dependencies
3. Set up `.env` file with necessary environment variables (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`)

### Running the application
1. Start the server with `npm start`
2. Visit `http://localhost:3000/` to view the Swagger UI and test the API endpoints.

## API Routes
- GET `/api/data`: Retrieves all volcanoes (Authentication required)
- GET `/api/data/{id}`: Retrieves specific volcano by ID (Authentication required)
- POST `/api/users/register`: Registers a new user
- POST `/api/users/login`: Authenticates a user and returns a JWT
- GET `/api/users/{email}/profile`: Retrieves user profile data (Authentication required)
- PUT `/api/users/{email}/profile`: Updates user profile data (Authentication required)

## Testing
Explain how to run the automated tests for this system.

## Deployment
Add additional notes about how to deploy this on a live system.

## Authors
- Your Name

## Acknowledgments
- Information provided by the Smithsonian Institution's Global Volcanism Program
