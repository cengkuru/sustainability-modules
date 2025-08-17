import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import {Request} from "firebase-functions/v2/https";
import {Response} from "express";
import mongoose from "mongoose";

// User model matching backend schema
const UserSchema = new mongoose.Schema({
  name: {type: String, required: true, trim: true},
  email: {type: String, required: true, unique: true, trim: true, lowercase: true},
  roles: [{type: String}],
  publicAuthority: {type: mongoose.Schema.Types.ObjectId, ref: 'PublicAuthority'},
  status: {type: String, default: 'active'},
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now}
}, {collection: 'users'});

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

// PublicAuthority model
const PublicAuthoritySchema = new mongoose.Schema({
  name: {type: String, required: true, trim: true, unique: true},
  code: {type: String, required: true, unique: true, trim: true},
  description: {type: String, trim: true},
  status: {type: String, default: 'active'},
  address: {
    streetAddress: String,
    locality: String,
    region: String,
    postalCode: String,
    countryName: String
  },
  contactInfo: {
    email: String,
    phone: String,
    website: String
  },
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now}
}, {collection: 'publicauthorities'});

// PublicAuthorityModel is exported for use in other modules
export const PublicAuthorityModel = mongoose.models.PublicAuthority || mongoose.model('PublicAuthority', PublicAuthoritySchema);

// Project model (simplified for middleware)
const ProjectSchema = new mongoose.Schema({
  id: {type: String, required: true, unique: true},
  title: {type: String, required: true, trim: true},
  description: {type: String, required: true},
  publicAuthority: {type: mongoose.Schema.Types.ObjectId, ref: 'PublicAuthority', required: true},
  publishStatus: {type: String, default: 'draft'},
  updated: {type: Date, default: Date.now},
  createdAt: {type: Date, default: Date.now}
}, {collection: 'projects'});

const ProjectModel = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

// MongoDB connection
let mongoConnectionPromise: Promise<typeof mongoose> | null = null;
export async function connectToMongo(): Promise<typeof mongoose> {
  if (!mongoConnectionPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not set for Cloud Functions");
    }
    mongoConnectionPromise = mongoose.connect(uri);
  }
  return mongoConnectionPromise;
}

// Extended request interface with user
export interface AuthenticatedRequest extends Request {
  user?: any;
  token?: string;
}

/**
 * Verify Firebase ID token and attach user to request
 */
export async function verifyAuth(req: AuthenticatedRequest, res: Response): Promise<boolean> {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.status(204).send('');
      return false; // Don't continue processing for OPTIONS
    }

    // Extract token from Authorization header
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    
    if (!token) {
      res.status(401).json({success: false, message: 'No authorization token provided'});
      return false;
    }

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token, true);
    const email = decodedToken.email;
    
    if (!email) {
      res.status(401).json({success: false, message: 'Token missing email'});
      return false;
    }

    // Connect to MongoDB and get user
    await connectToMongo();
    const user = await UserModel.findOne({email}).populate('publicAuthority');
    
    if (!user) {
      res.status(404).json({success: false, message: 'User not found in database'});
      return false;
    }

    if (user.status !== 'active') {
      res.status(403).json({success: false, message: 'User account is not active'});
      return false;
    }

    // Attach user to request
    req.user = user;
    req.token = token;
    return true;
  } catch (error: any) {
    logger.error('Auth verification failed:', error);
    res.status(401).json({success: false, message: 'Authentication failed'});
    return false;
  }
}

/**
 * Require specific roles for access
 */
export function requireRole(allowedRoles: string[]) {
  return async (req: AuthenticatedRequest, res: Response): Promise<boolean> => {
    // Handle CORS preflight requests first
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.status(204).send('');
      return false;
    }

    // First verify authentication
    if (!await verifyAuth(req, res)) {
      return false;
    }

    // Check if user has any of the allowed roles
    const userRoles = req.user?.roles || [];
    const hasRole = allowedRoles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      res.status(403).json({
        success: false, 
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
      return false;
    }

    return true;
  };
}

/**
 * Require user to belong to an agency (not admin)
 */
export async function requireAgency(req: AuthenticatedRequest, res: Response): Promise<boolean> {
  // First verify authentication
  if (!await verifyAuth(req, res)) {
    return false;
  }

  // Admins don't need agency assignment
  if (req.user?.roles?.includes('admin')) {
    return true;
  }

  // Check if user has agency assignment
  if (!req.user?.publicAuthority) {
    res.status(403).json({
      success: false,
      message: 'User must be assigned to an agency'
    });
    return false;
  }

  return true;
}

/**
 * Check if user can access a specific project
 */
export async function checkProjectOwnership(
  req: AuthenticatedRequest, 
  res: Response, 
  projectId: string
): Promise<boolean> {
  try {
    // First verify authentication
    if (!await verifyAuth(req, res)) {
      return false;
    }

    const user = req.user;
    const userRoles = user?.roles || [];

    // Get the project
    await connectToMongo();
    const project = await ProjectModel.findOne({
      $or: [
        {id: projectId},
        {_id: projectId}
      ]
    });

    if (!project) {
      res.status(404).json({success: false, message: 'Project not found'});
      return false;
    }

    // Admin can view any project (but not edit)
    if (userRoles.includes('admin')) {
      // For modification operations, deny
      if (req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') {
        // Unless it's a publish/unpublish operation
        const isPublishOperation = req.path?.includes('publish');
        if (!isPublishOperation) {
          res.status(403).json({
            success: false,
            message: 'Admins cannot modify project data, only publish status'
          });
          return false;
        }
      }
      return true;
    }

    // HOD can only access their agency's projects
    if (userRoles.includes('hod')) {
      if (!user.publicAuthority) {
        res.status(403).json({
          success: false,
          message: 'HOD user must be assigned to an agency'
        });
        return false;
      }

      // Check if project belongs to user's agency
      const projectAgency = project.publicAuthority?.toString();
      const userAgency = user.publicAuthority._id?.toString() || user.publicAuthority.toString();
      
      if (projectAgency !== userAgency) {
        res.status(403).json({
          success: false,
          message: 'Access denied. Project belongs to different agency'
        });
        return false;
      }
      return true;
    }

    // Regular users can only view published projects
    if (project.publishStatus !== 'published') {
      res.status(403).json({
        success: false,
        message: 'Access denied. Project is not published'
      });
      return false;
    }

    // Read-only for regular users
    if (req.method !== 'GET') {
      res.status(403).json({
        success: false,
        message: 'Access denied. Users have read-only access'
      });
      return false;
    }

    return true;
  } catch (error: any) {
    logger.error('Project ownership check failed:', error);
    res.status(500).json({success: false, message: 'Failed to verify project access'});
    return false;
  }
}

/**
 * Helper to get query filters based on user role
 */
export function getProjectFilters(user: any): any {
  const userRoles = user?.roles || [];
  
  // Admin sees all projects
  if (userRoles.includes('admin')) {
    return {};
  }
  
  // HOD sees only their agency's projects
  if (userRoles.includes('hod') && user.publicAuthority) {
    return {publicAuthority: user.publicAuthority._id || user.publicAuthority};
  }
  
  // Regular users see only published projects
  return {publishStatus: 'published'};
}

/**
 * Log access attempts for audit trail
 */
export function logAccess(
  user: any,
  action: string,
  resource: string,
  resourceId?: string,
  success: boolean = true
): void {
  logger.info('Access log:', {
    userId: user?._id,
    userEmail: user?.email,
    userRoles: user?.roles,
    action,
    resource,
    resourceId,
    success,
    timestamp: new Date().toISOString()
  });
}