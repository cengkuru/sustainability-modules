const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const PublicAuthority = require('../models/PublicAuthority');
const { auth } = require('../middleware/auth');
const { ProjectStatus } = require('../models/CodeLists');

// Public route for basic metrics (does not require authentication)
router.get('/public-metrics', async (req, res) => {
  try {
    // Get basic counts from collections
    const totalProjectsPromise = Project.countDocuments({});
    
    // Get project counts by status
    const activeProjectsPromise = Project.countDocuments({ 
      status: { $in: [ProjectStatus.IMPLEMENTATION, ProjectStatus.CONSTRUCTION] }
    });
    const reviewProjectsPromise = Project.countDocuments({ 
      status: { $in: [ProjectStatus.PREPARATION, ProjectStatus.PLANNING] }
    });
    const completedProjectsPromise = Project.countDocuments({ 
      status: { $in: [ProjectStatus.COMPLETION, ProjectStatus.COMPLETED] }
    });

    // Wait for all promises to resolve
    const [
      totalProjects,
      activeProjects,
      reviewProjects,
      completedProjects
    ] = await Promise.all([
      totalProjectsPromise,
      activeProjectsPromise,
      reviewProjectsPromise,
      completedProjectsPromise
    ]);

    // Return metrics
    res.status(200).json({
      totalProjects,
      activeProjects,
      reviewProjects,
      completedProjects
    });
  } catch (error) {
    console.error('Error fetching public metrics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching public metrics', 
      error: error.message 
    });
  }
});

// Recent projects endpoint (public)
router.get('/projects/recent', async (req, res) => {
  try {
    const recentProjects = await Project.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('name status type updatedAt');
    
    res.status(200).json(recentProjects);
  } catch (error) {
    console.error('Error fetching recent projects:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching recent projects', 
      error: error.message 
    });
  }
});

// Protected routes below - require authentication
router.use(auth);

// Get system-wide metrics (protected - admin only)
router.get('/metrics', async (req, res) => {
  try {
    // Only admin users can access system-wide metrics
    if (!req.user.roles.includes('admin')) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin role required.'
      });
    }

    // Get counts from different collections
    const totalUsersPromise = User.countDocuments({});
    const totalAuthoritiesPromise = PublicAuthority.countDocuments({});
    const totalProjectsPromise = Project.countDocuments({});
    
    // Get project counts by status
    const activeProjectsPromise = Project.countDocuments({ 
      status: { $in: [ProjectStatus.IMPLEMENTATION, ProjectStatus.CONSTRUCTION] }
    });
    const reviewProjectsPromise = Project.countDocuments({ 
      status: { $in: [ProjectStatus.PREPARATION, ProjectStatus.PLANNING] }
    });
    const completedProjectsPromise = Project.countDocuments({ 
      status: { $in: [ProjectStatus.COMPLETION, ProjectStatus.COMPLETED] }
    });

    // Wait for all promises to resolve
    const [
      totalUsers,
      totalAuthorities,
      totalProjects,
      activeProjects,
      reviewProjects,
      completedProjects
    ] = await Promise.all([
      totalUsersPromise,
      totalAuthoritiesPromise,
      totalProjectsPromise,
      activeProjectsPromise,
      reviewProjectsPromise,
      completedProjectsPromise
    ]);

    // Return metrics
    res.status(200).json({
      totalUsers,
      totalAuthorities,
      totalProjects,
      activeProjects,
      reviewProjects,
      completedProjects
    });
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching system metrics', 
      error: error.message 
    });
  }
});

module.exports = router; 