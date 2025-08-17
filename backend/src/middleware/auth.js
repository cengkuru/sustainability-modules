const jwt = require('jsonwebtoken');
const User = require('../models/User');
const admin = require('../config/firebase');

// Middleware to authenticate JWT token
exports.auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No authentication token, access denied' });
    }

    let user = null;

    // 1) Try Firebase ID token verification first (primary method)
    try {
      console.log('Verifying Firebase token...');
      const decodedFirebase = await admin.auth().verifyIdToken(token, true);
      console.log('Token verified for email:', decodedFirebase.email);
      const email = decodedFirebase.email;
      if (email) {
        user = await User.findOne({ email }).select('-password');
        // Auto-provision a user if not present
        if (!user) {
          // Check if this email should be admin
          const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
          const roles = adminEmails.includes(email.toLowerCase()) ? ['admin'] : ['user'];
          
          user = await User.create({
            name: decodedFirebase.name || email.split('@')[0],
            email,
            roles,
            status: 'active'
          });
        }
      }
    } catch (firebaseErr) {
      console.log('Firebase token verification failed:', firebaseErr.message);
      // 2) Fallback to existing JWT (backward compatible)
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.id).select('-password');
      } catch (e) {
        console.log('JWT verification also failed:', e.message);
        // Both methods failed
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Account is not active' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Middleware to check admin role
exports.admin = (req, res, next) => {
  if (req.user && req.user.roles && req.user.roles.includes('admin')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied: Admin privileges required'
    });
  }
}; 