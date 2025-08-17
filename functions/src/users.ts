import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import mongoose from "mongoose";
import {
  connectToMongo,
  requireRole,
  AuthenticatedRequest,
  logAccess
} from "./middleware";

// User model
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
 * Get all users - Admin only
 */
export const users = onRequest({cors: true}, async (req: AuthenticatedRequest, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).send('');
    return;
  }

  if (req.method === 'GET') {
    return getUsersHandler(req, res);
  } else if (req.method === 'POST') {
    return createUserHandler(req, res);
  } else {
    res.status(405).json({success: false, message: 'Method not allowed'});
  }
});

async function getUsersHandler(req: AuthenticatedRequest, res: any) {
  // Only admins can list users
  if (!await requireRole(['admin'])(req, res)) {
    return;
  }

  try {
    await connectToMongo();
    
    // Parse query parameters
    const {agency, role, status} = req.query;
    const filter: any = {};
    
    if (agency) filter.publicAuthority = agency;
    if (role) filter.roles = role;
    if (status) filter.status = status;
    
    const users = await UserModel.find(filter)
      .populate('publicAuthority', 'name code')
      .select('-password')
      .sort({createdAt: -1});
    
    logAccess(req.user, 'LIST', 'users', undefined, true);
    
    res.status(200).json({
      success: true,
      users,
      count: users.length
    });
  } catch (error: any) {
    logger.error('Failed to fetch users:', error);
    logAccess(req.user, 'LIST', 'users', undefined, false);
    res.status(500).json({success: false, message: 'Failed to fetch users'});
  }
}

async function createUserHandler(req: AuthenticatedRequest, res: any) {
  // Only admins can create users
  if (!await requireRole(['admin'])(req, res)) {
    return;
  }

  try {
    const {name, email, roles, publicAuthority, password} = req.body;
    
    // Validate required fields
    if (!name || !email) {
      res.status(400).json({success: false, message: 'Name and email are required'});
      return;
    }

    // Validate roles
    const validRoles = ['admin', 'hod', 'user'];
    const assignedRoles = roles || ['user'];
    if (!assignedRoles.every((r: string) => validRoles.includes(r))) {
      res.status(400).json({success: false, message: 'Invalid roles specified'});
      return;
    }

    // HOD and regular users must have an agency
    if (!assignedRoles.includes('admin') && !publicAuthority) {
      res.status(400).json({
        success: false, 
        message: 'Non-admin users must be assigned to an agency'
      });
      return;
    }

    await connectToMongo();

    // Check if user already exists
    const existingUser = await UserModel.findOne({email});
    if (existingUser) {
      res.status(409).json({success: false, message: 'User already exists'});
      return;
    }

    // Create Firebase user if password provided
    let firebaseUid;
    if (password) {
      try {
        const firebaseUser = await admin.auth().createUser({
          email,
          password,
          displayName: name,
          emailVerified: false
        });
        firebaseUid = firebaseUser.uid;
        
        // Set custom claims for roles
        await admin.auth().setCustomUserClaims(firebaseUid, {
          roles: assignedRoles,
          publicAuthority: publicAuthority || null
        });
      } catch (firebaseError: any) {
        logger.error('Failed to create Firebase user:', firebaseError);
        res.status(500).json({
          success: false, 
          message: `Failed to create Firebase user: ${firebaseError.message}`
        });
        return;
      }
    }

    // Create MongoDB user
    const newUser = await UserModel.create({
      name,
      email,
      roles: assignedRoles,
      publicAuthority: publicAuthority || undefined,
      status: 'active'
    });

    // Populate agency info
    await newUser.populate('publicAuthority', 'name code');
    
    logAccess(req.user, 'CREATE', 'user', newUser._id.toString(), true);
    
    res.status(201).json({
      success: true,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        roles: newUser.roles,
        publicAuthority: newUser.publicAuthority,
        status: newUser.status,
        firebaseUid
      }
    });
  } catch (error: any) {
    logger.error('Failed to create user:', error);
    logAccess(req.user, 'CREATE', 'user', undefined, false);
    res.status(500).json({success: false, message: 'Failed to create user'});
  }
}

/**
 * Update user - Admin only
 */
export const updateUser = onRequest({cors: true}, async (req: AuthenticatedRequest, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).send('');
    return;
  }
  // Only admins can update users
  if (!await requireRole(['admin'])(req, res)) {
    return;
  }

  try {
    const userId = req.query.userId as string;
    if (!userId) {
      res.status(400).json({success: false, message: 'User ID is required'});
      return;
    }

    const updates = req.body;
    const allowedUpdates = ['name', 'roles', 'publicAuthority', 'status'];
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

    // Validate roles if being updated
    if (validUpdates.roles) {
      const validRoles = ['admin', 'hod', 'user'];
      if (!validUpdates.roles.every((r: string) => validRoles.includes(r))) {
        res.status(400).json({success: false, message: 'Invalid roles specified'});
        return;
      }
    }

    await connectToMongo();

    // Find and update user
    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({success: false, message: 'User not found'});
      return;
    }

    // Update Firebase custom claims if roles or agency changed
    if (validUpdates.roles || validUpdates.publicAuthority !== undefined) {
      try {
        const firebaseUser = await admin.auth().getUserByEmail(user.email);
        await admin.auth().setCustomUserClaims(firebaseUser.uid, {
          roles: validUpdates.roles || user.roles,
          publicAuthority: validUpdates.publicAuthority || user.publicAuthority
        });
      } catch (firebaseError: any) {
        logger.warn('Could not update Firebase claims:', firebaseError);
      }
    }

    // Apply updates
    Object.assign(user, validUpdates);
    user.updatedAt = new Date();
    await user.save();

    // Populate agency info
    await user.populate('publicAuthority', 'name code');
    
    logAccess(req.user, 'UPDATE', 'user', userId, true);
    
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        publicAuthority: user.publicAuthority,
        status: user.status
      }
    });
  } catch (error: any) {
    logger.error('Failed to update user:', error);
    logAccess(req.user, 'UPDATE', 'user', req.query.userId as string, false);
    res.status(500).json({success: false, message: 'Failed to update user'});
  }
});

/**
 * Delete user - Admin only
 */
export const deleteUser = onRequest({cors: true}, async (req: AuthenticatedRequest, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).send('');
    return;
  }
  // Only admins can delete users
  if (!await requireRole(['admin'])(req, res)) {
    return;
  }

  try {
    const userId = req.query.userId as string;
    if (!userId) {
      res.status(400).json({success: false, message: 'User ID is required'});
      return;
    }

    await connectToMongo();

    // Find user
    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({success: false, message: 'User not found'});
      return;
    }

    // Prevent deleting the last admin
    if (user.roles.includes('admin')) {
      const adminCount = await UserModel.countDocuments({roles: 'admin'});
      if (adminCount <= 1) {
        res.status(400).json({
          success: false, 
          message: 'Cannot delete the last admin user'
        });
        return;
      }
    }

    // Delete from Firebase
    try {
      const firebaseUser = await admin.auth().getUserByEmail(user.email);
      await admin.auth().deleteUser(firebaseUser.uid);
    } catch (firebaseError: any) {
      logger.warn('Could not delete Firebase user:', firebaseError);
    }

    // Delete from MongoDB
    await user.deleteOne();
    
    logAccess(req.user, 'DELETE', 'user', userId, true);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    logger.error('Failed to delete user:', error);
    logAccess(req.user, 'DELETE', 'user', req.query.userId as string, false);
    res.status(500).json({success: false, message: 'Failed to delete user'});
  }
});

/**
 * Get user profile - Authenticated users can get their own profile
 */
/**
 * Update own profile - Users can update their own profile
 */
export const updateOwnProfile = onRequest({cors: true}, async (req: AuthenticatedRequest, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).send('');
    return;
  }

  // Any authenticated user can update their own profile
  if (!await requireRole(['admin', 'hod', 'user'])(req, res)) {
    return;
  }

  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    res.status(405).json({success: false, message: 'Method not allowed'});
    return;
  }

  try {
    await connectToMongo();
    
    const userId = req.user._id;
    const updates = req.body;
    
    // Only allow specific fields to be updated by users
    const allowedUpdates = ['name', 'phone', 'bio', 'avatar', 'preferences'];
    const updateKeys = Object.keys(updates);
    
    // Filter out invalid updates
    const validUpdates: any = {};
    updateKeys.forEach(key => {
      if (allowedUpdates.includes(key)) {
        validUpdates[key] = updates[key];
      }
    });

    if (Object.keys(validUpdates).length === 0) {
      res.status(400).json({success: false, message: 'No valid fields to update'});
      return;
    }

    // Add updatedAt timestamp
    validUpdates.updatedAt = new Date();

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: validUpdates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({success: false, message: 'User not found'});
      return;
    }

    logAccess(req.user, 'UPDATE', 'own-profile', userId, true);

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        phone: user.phone,
        bio: user.bio,
        avatar: user.avatar,
        preferences: user.preferences,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error: any) {
    logger.error('Failed to update profile:', error);
    logAccess(req.user, 'UPDATE', 'own-profile', req.user._id, false);
    res.status(500).json({success: false, message: 'Failed to update profile'});
  }
});

/**
 * Change password - Users can change their own password
 */
export const changePassword = onRequest({cors: true}, async (req: AuthenticatedRequest, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).send('');
    return;
  }

  // Any authenticated user can change their own password
  if (!await requireRole(['admin', 'hod', 'user'])(req, res)) {
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({success: false, message: 'Method not allowed'});
    return;
  }

  try {
    const {currentPassword, newPassword} = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false, 
        message: 'Current password and new password are required'
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false, 
        message: 'New password must be at least 6 characters'
      });
      return;
    }

    // Verify current password with Firebase Auth
    const firebase = await import('firebase-admin');
    const auth = firebase.auth();
    
    try {
      // Get user's email from our database
      await connectToMongo();
      const user = await UserModel.findById(req.user._id);
      
      if (!user) {
        res.status(404).json({success: false, message: 'User not found'});
        return;
      }

      // Update password in Firebase
      await auth.updateUser(req.user.uid, {
        password: newPassword
      });

      // Log the password change
      logAccess(req.user, 'UPDATE', 'password', req.user._id, true);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (authError: any) {
      logger.error('Firebase password update failed:', authError);
      
      if (authError.code === 'auth/weak-password') {
        res.status(400).json({
          success: false,
          message: 'Password is too weak. Please use a stronger password.'
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Failed to change password. Please verify your current password.'
        });
      }
      return;
    }
  } catch (error: any) {
    logger.error('Failed to change password:', error);
    logAccess(req.user, 'UPDATE', 'password', req.user._id, false);
    res.status(500).json({success: false, message: 'Failed to change password'});
  }
});

export const getUserProfile = onRequest({cors: true}, async (req: AuthenticatedRequest, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).send('');
    return;
  }
  // Any authenticated user can get their profile
  if (!await requireRole(['admin', 'hod', 'user'])(req, res)) {
    return;
  }

  try {
    const userId = req.query.userId as string || req.user._id;
    
    // Non-admins can only view their own profile
    if (!req.user.roles.includes('admin') && userId !== req.user._id.toString()) {
      res.status(403).json({
        success: false, 
        message: 'You can only view your own profile'
      });
      return;
    }

    await connectToMongo();
    
    const user = await UserModel.findById(userId)
      .populate('publicAuthority', 'name code description')
      .select('-password');
    
    if (!user) {
      res.status(404).json({success: false, message: 'User not found'});
      return;
    }
    
    logAccess(req.user, 'READ', 'user', userId, true);
    
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        publicAuthority: user.publicAuthority,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error: any) {
    logger.error('Failed to fetch user profile:', error);
    logAccess(req.user, 'READ', 'user', req.query.userId as string, false);
    res.status(500).json({success: false, message: 'Failed to fetch user profile'});
  }
});