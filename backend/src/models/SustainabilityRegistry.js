const mongoose = require('mongoose');
const { SustainabilityBase } = require('./SustainabilityBase');
const EconomicSustainability = require('./EconomicSustainability');
const EnvironmentalSustainability = require('./EnvironmentalSustainability');
const SocialSustainability = require('./SocialSustainability');
const InstitutionalSustainability = require('./InstitutionalSustainability');
const ClimateFinanceSustainability = require('./ClimateFinanceSustainability');

/**
 * Registry of all sustainability modules
 */
const sustainabilityModules = {
  economic: {
    model: EconomicSustainability,
    name: 'Economic and Financial Sustainability',
    description: 'Tracks economic viability over the entire project lifecycle'
  },
  environmental: {
    model: EnvironmentalSustainability,
    name: 'Environmental and Climate Resilience',
    description: 'Captures environmental impacts and climate considerations'
  },
  social: {
    model: SocialSustainability,
    name: 'Social Sustainability',
    description: 'Addresses how the project affects communities and workers'
  },
  institutional: {
    model: InstitutionalSustainability,
    name: 'Institutional Sustainability',
    description: 'Captures governance and compliance aspects'
  },
  climateFinance: {
    model: ClimateFinanceSustainability,
    name: 'Climate Finance Module',
    description: 'Designed for investments supporting climate change actions'
  }
};

/**
 * Helper function to enable a sustainability module for a project
 * @param {String} projectId - Project ID 
 * @param {String} moduleType - Module type (economic, environmental, etc.)
 * @param {Object} userId - User enabling the module
 * @returns {Promise<Object>} - The created sustainability module document
 */
const enableModule = async (projectId, moduleType, userId) => {
  if (!sustainabilityModules[moduleType]) {
    throw new Error(`Invalid module type: ${moduleType}`);
  }
  
  const Model = sustainabilityModules[moduleType].model;
  
  // Create the module document
  const moduleDoc = new Model({
    project: projectId,
    createdBy: userId
  });
  
  // Save the module document
  await moduleDoc.save();
  
  // Update the project to reflect this module is enabled
  await mongoose.model('Project').findByIdAndUpdate(
    projectId,
    {
      $set: { 'sustainabilityModules.isEnabled': true },
      $addToSet: { 'sustainabilityModules.enabledModules': moduleType },
      $set: { 'sustainabilityModules.enabledAt': new Date() },
      $set: { 'sustainabilityModules.enabledBy': userId }
    }
  );
  
  return moduleDoc;
};

/**
 * Helper function to disable a sustainability module for a project
 * @param {String} projectId - Project ID
 * @param {String} moduleType - Module type to disable
 * @returns {Promise<Boolean>} - Success status
 */
const disableModule = async (projectId, moduleType) => {
  if (!sustainabilityModules[moduleType]) {
    throw new Error(`Invalid module type: ${moduleType}`);
  }
  
  const Model = sustainabilityModules[moduleType].model;
  
  // Find the module document and mark as inactive
  await Model.findOneAndUpdate(
    { project: projectId, moduleType },
    { isActive: false }
  );
  
  // Update the project to reflect this module is disabled
  await mongoose.model('Project').findByIdAndUpdate(
    projectId,
    {
      $pull: { 'sustainabilityModules.enabledModules': moduleType }
    }
  );
  
  // Check if there are any modules left enabled
  const project = await mongoose.model('Project').findById(projectId);
  if (project.sustainabilityModules.enabledModules.length === 0) {
    // If no modules are enabled, set isEnabled to false
    await mongoose.model('Project').findByIdAndUpdate(
      projectId,
      { $set: { 'sustainabilityModules.isEnabled': false } }
    );
  }
  
  return true;
};

/**
 * Helper function to get all active sustainability modules for a project
 * @param {String} projectId - Project ID
 * @returns {Promise<Array>} - Array of active module documents
 */
const getActiveModules = async (projectId) => {
  return await SustainabilityBase.find({
    project: projectId,
    isActive: true
  });
};

module.exports = {
  sustainabilityModules,
  enableModule,
  disableModule,
  getActiveModules
}; 