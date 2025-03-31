const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { auth } = require('../middleware/auth');

// Get all projects (public projects)
router.get('/public', projectController.getAllProjects);

// Protected routes - require authentication
router.use(auth);

// Get user projects
router.get('/user', projectController.getUserProjects);

// Get project by ID
router.get('/:id', projectController.getProjectById);

// Create new project
router.post('/', projectController.createProject);

// Update project
router.put('/:id', projectController.updateProject);

// Toggle publish status
router.patch('/:id/publish', projectController.togglePublishStatus);

// Delete project
router.delete('/:id', projectController.deleteProject);

module.exports = router; 