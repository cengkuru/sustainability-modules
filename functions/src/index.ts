/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import mongoose, {Schema} from "mongoose";

// Initialize Firebase Admin SDK once
try {
  admin.app();
} catch (e) {
  admin.initializeApp();
}

// Mongo connection (cached between invocations)
let mongoConnectionPromise: Promise<typeof mongoose> | null = null;
async function connectToMongo(): Promise<typeof mongoose> {
  if (!mongoConnectionPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not set for Cloud Functions");
    }
    logger.info("Connecting to MongoDB...");
    mongoConnectionPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    }).then(conn => {
      logger.info("MongoDB connected successfully");
      return conn;
    }).catch(err => {
      logger.error("MongoDB connection failed:", err);
      mongoConnectionPromise = null; // Reset on failure
      throw err;
    });
  }
  return mongoConnectionPromise;
}

// Minimal User schema (must match backend collection)
const UserSchema = new Schema({
  name: {type: String, required: true, trim: true},
  email: {type: String, required: true, unique: true, trim: true, lowercase: true},
  roles: [{type: String}],
  publicAuthority: {type: Schema.Types.ObjectId, ref: 'PublicAuthority'},
  status: {type: String, default: 'active'},
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now}
}, {collection: 'users'});

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

// Helper: verify Firebase ID token
async function verifyIdToken(idToken: string) {
  const decoded = await admin.auth().verifyIdToken(idToken, true);
  return decoded; // contains email, uid, etc.
}

// Auth exchange: verify Firebase ID token, ensure Mongo user exists, return profile
// Allow unauthenticated invocations
export const authExchange = onRequest({cors: true}, async (req, res) => {
  // CORS is now handled by the configuration

  if (req.method !== 'POST') {
    res.status(405).json({success: false, message: 'Method not allowed'});
    return;
  }

  try {
    const authHeader = req.headers.authorization || '';
    const idToken = (authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined) || (req.body && req.body.idToken);
    if (!idToken) {
      res.status(400).json({success: false, message: 'Missing Firebase ID token'});
      return;
    }

    // Verify token
    const decoded = await verifyIdToken(idToken);
    const email = decoded.email;
    const name = decoded.name || (email ? email.split('@')[0] : 'User');
    if (!email) {
      res.status(400).json({success: false, message: 'Verified token missing email'});
      return;
    }

    // Connect to Mongo and upsert user
    await connectToMongo();

    let user = await UserModel.findOne({email});
    if (!user) {
      // Assign admin role if email is in ADMIN_EMAILS (comma-separated) env var
      const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
      const roles = adminEmails.includes(email.toLowerCase()) ? ['admin'] : ['user'];

      user = await UserModel.create({
        name,
        email,
        roles,
        status: 'active'
      });
      logger.info(`Created new user: ${email} with roles: ${roles.join(', ')}`);
    } else {
      // Update roles if user exists but doesn't have admin role and should
      const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
      if (adminEmails.includes(email.toLowerCase()) && !user.roles.includes('admin')) {
        user.roles = ['admin'];
        await user.save();
        logger.info(`Updated user ${email} to admin role`);
      }
    }

    // Return profile used by frontend
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        createdAt: user.createdAt
      }
    });
  } catch (err: any) {
    logger.error('authExchange error', err);
    res.status(401).json({success: false, message: err?.message || 'Unauthorized'});
  }
});

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Export HTTP functions from feature modules
export * from "./users";
export * from "./agencies";
export * from "./projects";
export * from "./settings";
export * from "./policies";
export * from "./passwordReset";
