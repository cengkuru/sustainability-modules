const mongoose = require('mongoose');
const { 
  ProjectStatus, 
  ProjectType,
  PublishStatus
} = require('./CodeLists');

const projectSchema = new mongoose.Schema({
  // Core identification information
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  updated: {
    type: Date,
    default: Date.now
  },
  language: {
    type: String,
    default: "en"
  },
  
  // Public authority information
  publicAuthority: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PublicAuthority',
    required: true
  },
  
  // Project classification information
  status: {
    type: String,
    enum: Object.values(ProjectStatus),
    default: ProjectStatus.IDENTIFICATION
  },
  type: {
    type: String,
    enum: Object.values(ProjectType),
    required: true
  },
  sector: [{
    type: String
  }],
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
  
  // Phase-specific timing information
  identificationPeriod: {
    startDate: Date,
    endDate: Date
  },
  preparationPeriod: {
    startDate: Date,
    endDate: Date
  },
  implementationPeriod: {
    startDate: Date,
    endDate: Date
  },
  completionPeriod: {
    startDate: Date,
    endDate: Date
  },
  maintenancePeriod: {
    startDate: Date,
    endDate: Date
  },
  decommissioningPeriod: {
    startDate: Date,
    endDate: Date
  },
  
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
      status: {
        type: String,
        enum: ['pre-award', 'active', 'closed']
      },
      tender: {
        procurementMethod: String,
        procurementMethodDetails: String,
        costEstimate: {
          amount: Number,
          currency: String
        },
        numberOfTenderers: Number,
        tenderers: [{
          id: String,
          name: String
        }],
        procuringEntity: {
          id: String,
          name: String
        }
      },
      suppliers: [{
        id: String,
        name: String
      }],
      contractValue: {
        amount: Number,
        currency: String
      },
      contractPeriod: {
        startDate: Date,
        endDate: Date
      },
      finalValue: {
        amount: Number,
        currency: String
      },
      modifications: [{
        id: String,
        date: Date,
        description: String,
        rationale: String,
        type: String,
        oldContractValue: {
          amount: Number,
          currency: String
        },
        newContractValue: {
          amount: Number,
          currency: String
        }
      }]
    }
  }],
  
  // Completion information
  completion: {
    endDate: Date,
    endDateDetails: String,
    finalValue: {
      amount: Number,
      currency: String
    },
    finalScope: String,
    finalScopeDetails: String
  },
  
  // Documents
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  
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
    consultationMeetings: [{
      id: String,
      date: Date,
      numberOfParticipants: Number,
      address: {
        streetAddress: String,
        locality: String,
        region: String,
        postalCode: String,
        countryName: String
      }
    }],
    inIndigenousLand: Boolean,
    landCompensationBudget: {
      amount: Number,
      currency: String
    }
  },
  
  // Sustainability modules tracking
  sustainabilityModules: {
    isEnabled: {
      type: Boolean,
      default: false
    },
    enabledModules: [{
      type: String,
      enum: ['economic', 'environmental', 'social', 'institutional', 'climateFinance']
    }],
    enabledAt: Date,
    enabledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // System/metadata fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  publishStatus: {
    type: String,
    enum: Object.values(PublishStatus),
    default: PublishStatus.DRAFT
  },
  publishedAt: {
    type: Date
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  unpublishedAt: {
    type: Date
  },
  unpublishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Update the updated field on save
projectSchema.pre('save', function(next) {
  this.updated = Date.now();
  next();
});

// Method to check if project can be published/unpublished
projectSchema.methods.canTogglePublish = async function(user) {
  if (!user) return false;
  
  // Admin can always toggle publish status
  if (user.isAdmin()) return true;
  
  // HOD can only toggle publish for their public authority
  if (user.isHOD() && user.publicAuthority.equals(this.publicAuthority)) {
    return true;
  }
  
  return false;
};

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;