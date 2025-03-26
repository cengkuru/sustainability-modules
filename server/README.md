# MongoDB Migration Backend

This directory contains the backend service for migrating from Firebase/Firestore to MongoDB Atlas.

## Getting Started

### 1. MongoDB Atlas Setup

Before using the application with MongoDB, you need to whitelist your IP address in MongoDB Atlas:

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to your project "prototype"
3. Click on "Network Access" in the left sidebar
4. Click "Add IP Address"
5. Either:
   - Add your current IP address (click "Add Current IP Address")
   - For development, you can add `0.0.0.0/0` to allow all IPs (not recommended for production)
6. Click "Confirm"

### 2. Starting the Backend Server

```bash
# Start only the backend server
npm run server

# Start both frontend and backend concurrently
npm run dev
```

### 3. Testing the Connection

```bash
# Test the MongoDB connection
npm run test-mongo
```

### 4. Running Data Migration

To migrate data from Firebase/Firestore to MongoDB:

1. Create a `firebase-service-account.json` file in the project root with your Firebase admin credentials
2. Run the migration script:

```bash
npm run migrate
```

## API Endpoints

- `GET /api/status` - Check API status
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get a project by ID
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project
- `GET /api/policies` - Get all policies
- `GET /api/policies/:id` - Get a policy by ID
- `POST /api/policies` - Create a new policy
- `PUT /api/policies/:id` - Update a policy
- `DELETE /api/policies/:id` - Delete a policy

## Configuration

Environment variables are stored in `.env` file in the server directory:

- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `NODE_ENV` - Environment (development/production)

## Architecture

The backend follows a standard Express.js architecture:

- `models/` - MongoDB schema definitions
- `routes/` - API route handlers
- `migration/` - Data migration scripts
- `server.js` - Main application entry point