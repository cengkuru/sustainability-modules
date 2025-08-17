import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import mongoose from "mongoose";
import {
  connectToMongo,
  requireRole,
  verifyAuth,
  AuthenticatedRequest,
  logAccess
} from "./middleware";

// PublicAuthority (Agency) model
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

const PublicAuthorityModel = mongoose.models.PublicAuthority || mongoose.model('PublicAuthority', PublicAuthoritySchema);

// User model for counting agency users
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

/**
 * Get all agencies - Public endpoint with optional auth for additional info
 */
export const getAgencies = onRequest({cors: true}, async (req: AuthenticatedRequest, res) => {
  // Handle CORS preflight for public endpoint
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).send('');
    return;
  }
  try {
    await connectToMongo();
    
    // Check if user is authenticated (optional)
    let isAuthenticated = false;
    let userRoles: string[] = [];
    
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      // Try to verify auth but don't fail if not authenticated
      try {
        await verifyAuth(req, res);
        isAuthenticated = true;
        userRoles = req.user?.roles || [];
      } catch {
        // Not authenticated, continue as public user
      }
    }
    
    // Build query
    const {status, search} = req.query;
    const filter: any = {};
    
    // Public users only see active agencies
    if (!isAuthenticated || !userRoles.includes('admin')) {
      filter.status = 'active';
    } else if (status) {
      filter.status = status;
    }
    
    // Search by name or code
    if (search) {
      filter.$or = [
        {name: {$regex: search, $options: 'i'}},
        {code: {$regex: search, $options: 'i'}}
      ];
    }
    
    const agencies = await PublicAuthorityModel.find(filter).sort({name: 1});
    
    // If admin, include user count for each agency
    let enrichedAgencies = agencies;
    if (isAuthenticated && userRoles.includes('admin')) {
      enrichedAgencies = await Promise.all(agencies.map(async (agency) => {
        const userCount = await UserModel.countDocuments({
          publicAuthority: agency._id,
          status: 'active'
        });
        return {
          ...agency.toObject(),
          userCount
        };
      }));
    }
    
    if (isAuthenticated) {
      logAccess(req.user, 'LIST', 'agencies', undefined, true);
    }
    
    res.status(200).json({
      success: true,
      agencies: enrichedAgencies,
      count: enrichedAgencies.length
    });
  } catch (error: any) {
    logger.error('Failed to fetch agencies:', error);
    res.status(500).json({success: false, message: 'Failed to fetch agencies'});
  }
});

/**
 * Get single agency - Public endpoint
 */
export const getAgency = onRequest({cors: true}, async (req: AuthenticatedRequest, res) => {
  // Handle CORS preflight for public endpoint
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).send('');
    return;
  }
  try {
    const agencyId = req.query.agencyId as string;
    if (!agencyId) {
      res.status(400).json({success: false, message: 'Agency ID is required'});
      return;
    }
    
    await connectToMongo();
    
    const agency = await PublicAuthorityModel.findById(agencyId);
    
    if (!agency) {
      res.status(404).json({success: false, message: 'Agency not found'});
      return;
    }
    
    // Check if user is authenticated for additional info
    let enrichedAgency = agency.toObject();
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      try {
        await verifyAuth(req, res);
        const userRoles = req.user?.roles || [];
        
        // If admin, include additional stats
        if (userRoles.includes('admin')) {
          const userCount = await UserModel.countDocuments({
            publicAuthority: agency._id,
            status: 'active'
          });
          
          const ProjectModel = mongoose.models.Project || mongoose.model('Project', new mongoose.Schema({
            publicAuthority: mongoose.Schema.Types.ObjectId
          }, {collection: 'projects'}));
          
          const projectCount = await ProjectModel.countDocuments({
            publicAuthority: agency._id
          });
          
          enrichedAgency = {
            ...enrichedAgency,
            userCount,
            projectCount
          };
        }
        
        logAccess(req.user, 'READ', 'agency', agencyId, true);
      } catch {
        // Not authenticated, return basic info only
      }
    }
    
    res.status(200).json({
      success: true,
      agency: enrichedAgency
    });
  } catch (error: any) {
    logger.error('Failed to fetch agency:', error);
    res.status(500).json({success: false, message: 'Failed to fetch agency'});
  }
});

/**
 * Create agency - Admin only
 */
export const createAgency = onRequest({cors: true}, async (req: AuthenticatedRequest, res) => {
  // Only admins can create agencies
  if (!await requireRole(['admin'])(req, res)) {
    return;
  }
  
  try {
    const {name, code, description, address, contactInfo} = req.body;
    
    // Validate required fields
    if (!name || !code) {
      res.status(400).json({success: false, message: 'Name and code are required'});
      return;
    }
    
    await connectToMongo();
    
    // Check if agency already exists
    const existing = await PublicAuthorityModel.findOne({
      $or: [{name}, {code}]
    });
    
    if (existing) {
      res.status(409).json({
        success: false, 
        message: 'Agency with this name or code already exists'
      });
      return;
    }
    
    // Create new agency
    const newAgency = await PublicAuthorityModel.create({
      name,
      code,
      description,
      address,
      contactInfo,
      status: 'active'
    });
    
    logAccess(req.user, 'CREATE', 'agency', newAgency._id.toString(), true);
    
    res.status(201).json({
      success: true,
      agency: newAgency
    });
  } catch (error: any) {
    logger.error('Failed to create agency:', error);
    logAccess(req.user, 'CREATE', 'agency', undefined, false);
    res.status(500).json({success: false, message: 'Failed to create agency'});
  }
});

/**
 * Update agency - Admin only
 */
export const updateAgency = onRequest({cors: true}, async (req: AuthenticatedRequest, res) => {
  // Only admins can update agencies
  if (!await requireRole(['admin'])(req, res)) {
    return;
  }
  
  try {
    const agencyId = req.query.agencyId as string;
    if (!agencyId) {
      res.status(400).json({success: false, message: 'Agency ID is required'});
      return;
    }
    
    const updates = req.body;
    const allowedUpdates = ['name', 'code', 'description', 'address', 'contactInfo', 'status'];
    const updateKeys = Object.keys(updates);
    
    // Filter out invalid updates
    const validUpdates: any = {};
    updateKeys.forEach(key => {
      if (allowedUpdates.includes(key)) {
        validUpdates[key] = updates[key];
      }
    });
    
    if (Object.keys(validUpdates).length === 0) {
      res.status(400).json({success: false, message: 'No valid updates provided'});
      return;
    }
    
    await connectToMongo();
    
    // Check for duplicate name or code if being updated
    if (validUpdates.name || validUpdates.code) {
      const existing = await PublicAuthorityModel.findOne({
        $or: [
          validUpdates.name ? {name: validUpdates.name} : {},
          validUpdates.code ? {code: validUpdates.code} : {}
        ],
        _id: {$ne: agencyId}
      });
      
      if (existing) {
        res.status(409).json({
          success: false,
          message: 'Agency with this name or code already exists'
        });
        return;
      }
    }
    
    // Update agency
    const agency = await PublicAuthorityModel.findById(agencyId);
    if (!agency) {
      res.status(404).json({success: false, message: 'Agency not found'});
      return;
    }
    
    Object.assign(agency, validUpdates);
    agency.updatedAt = new Date();
    await agency.save();
    
    logAccess(req.user, 'UPDATE', 'agency', agencyId, true);
    
    res.status(200).json({
      success: true,
      agency
    });
  } catch (error: any) {
    logger.error('Failed to update agency:', error);
    logAccess(req.user, 'UPDATE', 'agency', req.query.agencyId as string, false);
    res.status(500).json({success: false, message: 'Failed to update agency'});
  }
});

/**
 * Delete agency - Admin only
 */
export const deleteAgency = onRequest({cors: true}, async (req: AuthenticatedRequest, res) => {
  // Only admins can delete agencies
  if (!await requireRole(['admin'])(req, res)) {
    return;
  }
  
  try {
    const agencyId = req.query.agencyId as string;
    if (!agencyId) {
      res.status(400).json({success: false, message: 'Agency ID is required'});
      return;
    }
    
    await connectToMongo();
    
    // Check if agency has users
    const userCount = await UserModel.countDocuments({publicAuthority: agencyId});
    if (userCount > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete agency with ${userCount} assigned users. Reassign or delete users first.`
      });
      return;
    }
    
    // Check if agency has projects
    const ProjectModel = mongoose.models.Project || mongoose.model('Project', new mongoose.Schema({
      publicAuthority: mongoose.Schema.Types.ObjectId
    }, {collection: 'projects'}));
    
    const projectCount = await ProjectModel.countDocuments({publicAuthority: agencyId});
    if (projectCount > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete agency with ${projectCount} projects. Delete or reassign projects first.`
      });
      return;
    }
    
    // Delete agency
    const agency = await PublicAuthorityModel.findByIdAndDelete(agencyId);
    if (!agency) {
      res.status(404).json({success: false, message: 'Agency not found'});
      return;
    }
    
    logAccess(req.user, 'DELETE', 'agency', agencyId, true);
    
    res.status(200).json({
      success: true,
      message: 'Agency deleted successfully'
    });
  } catch (error: any) {
    logger.error('Failed to delete agency:', error);
    logAccess(req.user, 'DELETE', 'agency', req.query.agencyId as string, false);
    res.status(500).json({success: false, message: 'Failed to delete agency'});
  }
});

/**
 * Get agency users - Admin or HOD of the agency
 */
export const getAgencyUsers = onRequest({cors: true}, async (req: AuthenticatedRequest, res) => {
  // Require authentication
  if (!await verifyAuth(req, res)) {
    return;
  }
  
  try {
    const agencyId = req.query.agencyId as string;
    if (!agencyId) {
      res.status(400).json({success: false, message: 'Agency ID is required'});
      return;
    }
    
    const userRoles = req.user?.roles || [];
    
    // Check permissions
    if (!userRoles.includes('admin')) {
      // HODs can only see their own agency's users
      if (!userRoles.includes('hod')) {
        res.status(403).json({success: false, message: 'Access denied'});
        return;
      }
      
      // Verify HOD belongs to this agency
      const userAgency = req.user.publicAuthority?._id?.toString() || req.user.publicAuthority?.toString();
      if (userAgency !== agencyId) {
        res.status(403).json({
          success: false,
          message: 'You can only view users from your own agency'
        });
        return;
      }
    }
    
    await connectToMongo();
    
    // Get agency users
    const users = await UserModel.find({
      publicAuthority: agencyId,
      status: 'active'
    })
    .select('-password')
    .sort({name: 1});
    
    logAccess(req.user, 'LIST', 'agency-users', agencyId, true);
    
    res.status(200).json({
      success: true,
      users,
      count: users.length
    });
  } catch (error: any) {
    logger.error('Failed to fetch agency users:', error);
    logAccess(req.user, 'LIST', 'agency-users', req.query.agencyId as string, false);
    res.status(500).json({success: false, message: 'Failed to fetch agency users'});
  }
});