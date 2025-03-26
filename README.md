# Climate Finance Project - MongoDB Migration

This project is migrating from Firebase/Firestore to MongoDB Atlas for better scalability and performance.

## Project Structure

- `src/` - Angular application code
- `server/` - MongoDB backend API
  - `models/` - MongoDB schema definitions
  - `routes/` - API routes
  - `migration/` - Data migration scripts
  - `server.js` - Express server entry point

## MongoDB Migration

This project is in the process of migrating the database from Firebase/Firestore to MongoDB Atlas. The MongoDB connection string is:

```
mongodb+srv://michael:I8atyUtCA21b3Az2@prototype.ncqh9de.mongodb.net/?retryWrites=true&w=majority&appName=prototype
```

### Migration Features

1. **Dual-Database Support**: The app can switch between Firebase and MongoDB using a feature flag
2. **Gradual Rollout**: MongoDB can be enabled per-environment or per-feature
3. **API Compatibility**: MongoDB API matches the Firebase/Firestore API for seamless transition

### Getting Started

1. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

2. Set up MongoDB Atlas access:
   - Log in to MongoDB Atlas
   - Navigate to "Network Access"
   - Add your IP address to the whitelist

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Run database migration:
   ```bash
   npm run migrate
   ```

### Environment Configuration

To switch between Firebase and MongoDB, modify the `environment.ts` file:

```typescript
export const environment = {
  // ...other config
  
  // Toggle to true to use MongoDB instead of Firebase
  useMongoDb: true
};
```

## Development

### Running the Application

- Run Angular frontend only: `npm start`
- Run Express backend only: `npm run server`
- Run both concurrently: `npm run dev`

### Testing MongoDB Connection

```bash
npm run test-mongo
```

## Note on Firebase Services

While the database is being migrated to MongoDB, the following Firebase services are still being used:

- Firebase Authentication
- Firebase Hosting
- Firebase Storage (for file uploads)

These services will be evaluated for migration in a future phase.

## License

Copyright (c) 2024. All rights reserved.
