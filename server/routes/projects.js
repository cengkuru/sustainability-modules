const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// GET all projects
router.get('/', async (req, res, next) => {
  try {
    const projects = await Project.find();
    return res.json(projects);
  } catch (error) {
    next(error);
  }
});

// GET a project by ID
router.get('/:id', async (req, res, next) => {
  try {
    const project = await Project.findOne({ id: req.params.id });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    return res.json(project);
  } catch (error) {
    next(error);
  }
});

// POST - Create a new project
router.post('/', async (req, res, next) => {
  try {
    // Check if project with this ID already exists
    const existingProject = await Project.findOne({ id: req.body.id });
    if (existingProject) {
      return res.status(409).json({ message: 'Project with this ID already exists' });
    }
    
    const newProject = new Project(req.body);
    await newProject.save();
    return res.status(201).json(newProject);
  } catch (error) {
    next(error);
  }
});

// PUT - Update a project
router.put('/:id', async (req, res, next) => {
  try {
    const project = await Project.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    return res.json(project);
  } catch (error) {
    next(error);
  }
});

// DELETE - Delete a project
router.delete('/:id', async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({ id: req.params.id });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    return res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// GET - Search projects
router.get('/search/:query', async (req, res, next) => {
  try {
    const query = req.params.query;
    const projects = await Project.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });
    
    return res.json(projects);
  } catch (error) {
    next(error);
  }
});

module.exports = router; 