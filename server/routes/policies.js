const express = require('express');
const router = express.Router();
const Policy = require('../models/Policy');

// GET all policies
router.get('/', async (req, res, next) => {
  try {
    const policies = await Policy.find();
    return res.json(policies);
  } catch (error) {
    next(error);
  }
});

// GET a policy by ID
router.get('/:id', async (req, res, next) => {
  try {
    const policy = await Policy.findOne({ id: req.params.id });
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    return res.json(policy);
  } catch (error) {
    next(error);
  }
});

// POST - Create a new policy
router.post('/', async (req, res, next) => {
  try {
    // Check if policy with this ID already exists
    const existingPolicy = await Policy.findOne({ id: req.body.id });
    if (existingPolicy) {
      return res.status(409).json({ message: 'Policy with this ID already exists' });
    }
    
    const newPolicy = new Policy(req.body);
    await newPolicy.save();
    return res.status(201).json(newPolicy);
  } catch (error) {
    next(error);
  }
});

// PUT - Update a policy
router.put('/:id', async (req, res, next) => {
  try {
    const policy = await Policy.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    
    return res.json(policy);
  } catch (error) {
    next(error);
  }
});

// DELETE - Delete a policy
router.delete('/:id', async (req, res, next) => {
  try {
    const policy = await Policy.findOneAndDelete({ id: req.params.id });
    
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    
    return res.json({ message: 'Policy deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// GET - Search policies
router.get('/search/:query', async (req, res, next) => {
  try {
    const query = req.params.query;
    const policies = await Policy.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });
    
    return res.json(policies);
  } catch (error) {
    next(error);
  }
});

module.exports = router; 