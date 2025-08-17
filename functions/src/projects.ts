import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import mongoose from "mongoose";
import {
  connectToMongo,
  requireRole,
  verifyAuth,
  AuthenticatedRequest,
  logAccess,
  checkProjectOwnership,
  requireAgency
} from "./middleware";

// Project model schema matching backend
const ProjectSchema = new mongoose.Schema({
  // Core identification
  id: {type: String, required: true, unique: true},
  title: {type: String, required: true, trim: true},
  description: {type: String, required: true},
  updated: {type: Date, default: Date.now},
  language: {type: String, default: "en"},
  
  // Public authority reference
  publicAuthority: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PublicAuthority',
    required: true
  },
  
  // Project classification
  status: {type: String, default: 'identification'},
  type: {type: String, required: true},
  sector: [{type: String}],
  purpose: String,
  
  // Location information
  locations: [{
    id: String,
    description: String,
    geometry: {
      type: {
        type: String,
        enum: ['Point', 'LineString', 'Polygon']
      },
      coordinates: []
    },
    address: {
      streetAddress: String,
      locality: String,
      region: String,
      postalCode: String,
      countryName: String
    }
  }],
  
  // Financial information
  budget: {
    description: String,
    amount: {
      amount: Number,
      currency: String
    },
    requestDate: Date,
    approvalDate: Date,
    budgetBreakdowns: [{
      id: String,
      description: String,
      amount: {
        amount: Number,
        currency: String
      },
      period: {
        startDate: Date,
        endDate: Date
      },
      sourceParty: {
        id: String,
        name: String
      }
    }]
  },
  
  // Timing information
  period: {
    startDate: Date,
    endDate: Date,
    maxExtentDate: Date,
    durationInDays: Number
  },
  
  // Phase-specific periods
  identificationPeriod: {startDate: Date, endDate: Date},
  preparationPeriod: {startDate: Date, endDate: Date},
  implementationPeriod: {startDate: Date, endDate: Date},
  completionPeriod: {startDate: Date, endDate: Date},
  maintenancePeriod: {startDate: Date, endDate: Date},
  decommissioningPeriod: {startDate: Date, endDate: Date},
  
  // Parties involved
  parties: [{
    id: String,
    name: String,
    identifier: {
      scheme: String,
      id: String,
      legalName: String
    },
    address: {
      streetAddress: String,
      locality: String,
      region: String,
      postalCode: String,
      countryName: String
    },
    contactPoint: {
      name: String,
      email: String,
      telephone: String
    },
    roles: [String]
  }],
  
  // Contracting processes
  contractingProcesses: [{
    id: String,
    summary: {
      ocid: String,
      status: {type: String, enum: ['pre-award', 'active', 'closed']},
      tender: mongoose.Schema.Types.Mixed,
      suppliers: [{id: String, name: String}],
      contractValue: {amount: Number, currency: String},
      contractPeriod: {startDate: Date, endDate: Date},
      finalValue: {amount: Number, currency: String},
      modifications: [mongoose.Schema.Types.Mixed]
    }
  }],
  
  // Completion information
  completion: {
    endDate: Date,
    endDateDetails: String,
    finalValue: {amount: Number, currency: String},
    finalScope: String,
    finalScopeDetails: String
  },
  
  // Documents
  documents: [{type: mongoose.Schema.Types.ObjectId, ref: 'Document'}],
  
  // Environmental information
  environment: {
    goals: [String],
    hasImpactAssessment: Boolean,
    inProtectedArea: Boolean,
    climateMeasures: [{
      type: [String],
      description: String
    }]
  },
  
  // Social information
  social: {
    consultationMeetings: [mongoose.Schema.Types.Mixed],
    inIndigenousLand: Boolean,
    landCompensationBudget: {amount: Number, currency: String}
  },
  
  // Sustainability modules
  sustainabilityModules: {
    isEnabled: {type: Boolean, default: false},
    enabledModules: [{
      type: String,
      enum: ['economic', 'environmental', 'social', 'institutional', 'climateFinance']
    }],
    enabledAt: Date,
    enabledBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
  },
  
  // System/metadata fields
  createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  lastModifiedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  createdAt: {type: Date, default: Date.now},
  publishStatus: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  publishedAt: Date,
  publishedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  unpublishedAt: Date,
  unpublishedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
}, {collection: 'projects'});

// Update the updated field on save
ProjectSchema.pre('save', function(next) {
  this.updated = new Date();
  next();
});

const ProjectModel = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

/**
 * Get projects with role-based filtering
 * - Admin: All projects
 * - HOD: Only their agency's projects
 * - User: Only published projects
 */
export const getProjects = onRequest({cors: true}, async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).send('');
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({success: false, message: 'Method not allowed'});
    return;
  }

  try {
    await connectToMongo();
    const authed = await verifyAuth(req as AuthenticatedRequest, res);
    if (!authed) return;
    const user = (req as AuthenticatedRequest).user;
    
    // Build query based on role
    let query: any = {};
    
    if (user.roles.includes('admin')) {
      // Admin sees all projects
      logger.info('Admin accessing all projects');
    } else if (user.roles.includes('hod') && user.publicAuthority) {
      // HOD sees only their agency's projects
      query.publicAuthority = user.publicAuthority;
      logger.info(`HOD accessing projects for agency: ${user.publicAuthority}`);
    } else {
      // Regular users see only published projects
      query.publishStatus = 'published';
      logger.info('User accessing published projects only');
    }
    
    // Get pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    // Get sort parameters
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 1 : -1;
    
    // Execute query with population
    const [projects, totalCount] = await Promise.all([
      ProjectModel.find(query)
        .populate('publicAuthority', 'name abbreviation')
        .populate('createdBy', 'name email')
        .sort({[sortBy]: sortOrder})
        .skip(skip)
        .limit(limit)
        .lean(),
      ProjectModel.countDocuments(query)
    ]);
    
    logAccess(user, 'LIST', 'projects', undefined, true);
    
    res.status(200).json({
      success: true,
      data: projects,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error: any) {
    logger.error('getProjects error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch projects'
    });
  }
});

/**
 * Get single project with access control
 */
export const getProject = onRequest({cors: true}, async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({success: false, message: 'Method not allowed'});
    return;
  }

  try {
    await connectToMongo();
    const authed = await verifyAuth(req as AuthenticatedRequest, res);
    if (!authed) return;
    const user = (req as AuthenticatedRequest).user;
    const projectId = req.query.id as string;
    
    if (!projectId) {
      res.status(400).json({success: false, message: 'Project ID required'});
      return;
    }
    
    const project: any = await ProjectModel.findById(projectId)
      .populate('publicAuthority', 'name abbreviation')
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .lean();
    
    if (!project) {
      res.status(404).json({success: false, message: 'Project not found'});
      return;
    }
    
    // Check access permissions
    const canAccess = 
      user.roles.includes('admin') || // Admin can see all
      (user.roles.includes('hod') && project.publicAuthority._id.equals(user.publicAuthority)) || // HOD can see their agency's
      project.publishStatus === 'published'; // Others can see published
    
    if (!canAccess) {
      res.status(403).json({success: false, message: 'Access denied'});
      return;
    }
    
    logAccess(user, 'READ', 'project', project._id.toString(), true);
    
    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error: any) {
    logger.error('getProject error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch project'
    });
  }
});

/**
 * Create project - HOD only, auto-assign to their agency
 */
export const createProject = onRequest({cors: true}, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({success: false, message: 'Method not allowed'});
    return;
  }

  try {
    await connectToMongo();
    
    // Require HOD role and agency assignment
    const hasRole = await requireRole(['hod', 'admin'])(req as AuthenticatedRequest, res);
    if (!hasRole) return;
    
    const hasAgency = await requireAgency(req as AuthenticatedRequest, res);
    if (!hasAgency) return;
    
    const user = (req as AuthenticatedRequest).user;
    const projectData = req.body;
    
    // Auto-assign to user's agency if HOD
    if (user.roles.includes('hod')) {
      projectData.publicAuthority = user.publicAuthority;
    } else if (user.roles.includes('admin') && !projectData.publicAuthority) {
      res.status(400).json({
        success: false,
        message: 'Admin must specify publicAuthority when creating project'
      });
      return;
    }
    
    // Set metadata
    projectData.createdBy = user._id;
    projectData.createdAt = new Date();
    projectData.updated = new Date();
    
    // Generate unique ID if not provided
    if (!projectData.id) {
      projectData.id = `PRJ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    const project = new ProjectModel(projectData);
    await project.save();
    
    // Populate references for response
    await project.populate('publicAuthority', 'name abbreviation');
    await project.populate('createdBy', 'name email');
    
    logAccess(user, 'CREATE', 'project', project._id.toString(), true);
    
    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error: any) {
    logger.error('createProject error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create project'
    });
  }
});

/**
 * Update project - HOD only, must own project
 */
export const updateProject = onRequest({cors: true}, async (req, res) => {
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    res.status(405).json({success: false, message: 'Method not allowed'});
    return;
  }

  try {
    await connectToMongo();
    
    const hasRole = await requireRole(['hod', 'admin'])(req as AuthenticatedRequest, res);
    if (!hasRole) return;
    
    const user = (req as AuthenticatedRequest).user;
    const projectId = req.query.id as string;
    const updates = req.body;
    
    if (!projectId) {
      res.status(400).json({success: false, message: 'Project ID required'});
      return;
    }
    
    // Check ownership
    const canAccess = await checkProjectOwnership(req as AuthenticatedRequest, res, projectId);
    if (!canAccess) return;
    
    // Prevent changing certain fields
    delete updates._id;
    delete updates.createdBy;
    delete updates.createdAt;
    delete updates.publicAuthority; // Cannot change agency
    
    // Update metadata
    updates.lastModifiedBy = user._id;
    updates.updated = new Date();
    
    const project = await ProjectModel.findByIdAndUpdate(
      projectId,
      updates,
      {new: true, runValidators: true}
    )
    .populate('publicAuthority', 'name abbreviation')
    .populate('createdBy', 'name email')
    .populate('lastModifiedBy', 'name email');
    
    if (!project) {
      res.status(404).json({success: false, message: 'Project not found'});
      return;
    }
    
    logAccess(user, 'UPDATE', 'project', project._id.toString(), true);
    
    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error: any) {
    logger.error('updateProject error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update project'
    });
  }
});

/**
 * Delete project - HOD only, must own project
 */
export const deleteProject = onRequest({cors: true}, async (req, res) => {
  if (req.method !== 'DELETE') {
    res.status(405).json({success: false, message: 'Method not allowed'});
    return;
  }

  try {
    await connectToMongo();
    
    const hasRole = await requireRole(['hod', 'admin'])(req as AuthenticatedRequest, res);
    if (!hasRole) return;
    
    const user = (req as AuthenticatedRequest).user;
    const projectId = req.query.id as string;
    
    if (!projectId) {
      res.status(400).json({success: false, message: 'Project ID required'});
      return;
    }
    
    // Check ownership
    const canAccess = await checkProjectOwnership(req as AuthenticatedRequest, res, projectId);
    if (!canAccess) return;
    
    const project = await ProjectModel.findByIdAndDelete(projectId);
    
    if (!project) {
      res.status(404).json({success: false, message: 'Project not found'});
      return;
    }
    
    logAccess(user, 'DELETE', 'project', project._id.toString(), true);
    
    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error: any) {
    logger.error('deleteProject error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete project'
    });
  }
});

/**
 * Publish project - Admin only
 */
export const publishProject = onRequest({cors: true}, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({success: false, message: 'Method not allowed'});
    return;
  }

  try {
    await connectToMongo();
    
    const hasRole = await requireRole(['admin'])(req as AuthenticatedRequest, res);
    if (!hasRole) return;
    
    const user = (req as AuthenticatedRequest).user;
    const projectId = req.query.id as string;
    
    if (!projectId) {
      res.status(400).json({success: false, message: 'Project ID required'});
      return;
    }
    
    const project = await ProjectModel.findByIdAndUpdate(
      projectId,
      {
        publishStatus: 'published',
        publishedAt: new Date(),
        publishedBy: user._id,
        lastModifiedBy: user._id,
        updated: new Date()
      },
      {new: true}
    )
    .populate('publicAuthority', 'name abbreviation')
    .populate('publishedBy', 'name email');
    
    if (!project) {
      res.status(404).json({success: false, message: 'Project not found'});
      return;
    }
    
    logAccess(user, 'UPDATE', 'project-publish', project._id.toString(), true);
    
    res.status(200).json({
      success: true,
      data: project,
      message: 'Project published successfully'
    });
  } catch (error: any) {
    logger.error('publishProject error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to publish project'
    });
  }
});

/**
 * Unpublish project - Admin only
 */
export const unpublishProject = onRequest({cors: true}, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({success: false, message: 'Method not allowed'});
    return;
  }

  try {
    await connectToMongo();
    
    const hasRole = await requireRole(['admin'])(req as AuthenticatedRequest, res);
    if (!hasRole) return;
    
    const user = (req as AuthenticatedRequest).user;
    const projectId = req.query.id as string;
    
    if (!projectId) {
      res.status(400).json({success: false, message: 'Project ID required'});
      return;
    }
    
    const project = await ProjectModel.findByIdAndUpdate(
      projectId,
      {
        publishStatus: 'draft',
        unpublishedAt: new Date(),
        unpublishedBy: user._id,
        lastModifiedBy: user._id,
        updated: new Date()
      },
      {new: true}
    )
    .populate('publicAuthority', 'name abbreviation')
    .populate('unpublishedBy', 'name email');
    
    if (!project) {
      res.status(404).json({success: false, message: 'Project not found'});
      return;
    }
    
    logAccess(user, 'UPDATE', 'project-unpublish', project._id.toString(), true);
    
    res.status(200).json({
      success: true,
      data: project,
      message: 'Project unpublished successfully'
    });
  } catch (error: any) {
    logger.error('unpublishProject error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to unpublish project'
    });
  }
});

/**
 * Get project statistics
 */
export const getProjectStats = onRequest({cors: true}, async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({success: false, message: 'Method not allowed'});
    return;
  }

  try {
    await connectToMongo();
    const authed = await verifyAuth(req as AuthenticatedRequest, res);
    if (!authed) return;
    const user = (req as AuthenticatedRequest).user;
    
    // Build query based on role
    let query: any = {};
    
    if (user.roles.includes('admin')) {
      // Admin sees stats for all projects
    } else if (user.roles.includes('hod') && user.publicAuthority) {
      // HOD sees stats for their agency only
      query.publicAuthority = user.publicAuthority;
    } else {
      // Regular users see stats for published projects only
      query.publishStatus = 'published';
    }
    
    const stats = await ProjectModel.aggregate([
      {$match: query},
      {
        $group: {
          _id: null,
          totalProjects: {$sum: 1},
          publishedCount: {
            $sum: {$cond: [{$eq: ['$publishStatus', 'published']}, 1, 0]}
          },
          draftCount: {
            $sum: {$cond: [{$eq: ['$publishStatus', 'draft']}, 1, 0]}
          },
          totalBudget: {
            $sum: '$budget.amount.amount'
          },
          byStatus: {
            $push: '$status'
          },
          bySector: {
            $push: '$sector'
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalProjects: 1,
          publishedCount: 1,
          draftCount: 1,
          totalBudget: 1,
          statusBreakdown: {
            identification: {
              $size: {
                $filter: {
                  input: '$byStatus',
                  cond: {$eq: ['$$this', 'identification']}
                }
              }
            },
            preparation: {
              $size: {
                $filter: {
                  input: '$byStatus',
                  cond: {$eq: ['$$this', 'preparation']}
                }
              }
            },
            implementation: {
              $size: {
                $filter: {
                  input: '$byStatus',
                  cond: {$eq: ['$$this', 'implementation']}
                }
              }
            },
            completion: {
              $size: {
                $filter: {
                  input: '$byStatus',
                  cond: {$eq: ['$$this', 'completion']}
                }
              }
            }
          }
        }
      }
    ]);
    
    logAccess(user, 'READ', 'project-stats', undefined, true);
    
    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalProjects: 0,
        publishedCount: 0,
        draftCount: 0,
        totalBudget: 0,
        statusBreakdown: {
          identification: 0,
          preparation: 0,
          implementation: 0,
          completion: 0
        }
      }
    });
  } catch (error: any) {
    logger.error('getProjectStats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch project statistics'
    });
  }
});