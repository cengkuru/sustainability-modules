const mongoose = require('mongoose');

// Define a schema that mimics the Firestore structure
const projectSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  featured: {
    type: Boolean,
    default: false
  },
  location: {
    name: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  stages: {
    identification: {
      basicData: {
        sectorSubsector: String,
        projectOwner: String,
        projectReferenceNumber: String,
        purpose: String,
        projectDescription: String
      },
      climateFinanceData: {
        climateObjective: String,
        amountOfInvestment: String
      }
    },
    preparation: {
      basicData: {
        projectBudget: String,
        projectBudgetApprovalDate: String,
        fundingSources: String
      },
      socialSustainabilityData: {
        numberOfBeneficiaries: Number
      }
    },
    tenderManagement: {
      basicData: {
        contractType: String,
        procurementMethod: String,
        contractStatus: String,
        contractDuration: String,
        contractStartDate: String,
        numberOfFirmsTendering: Number,
        costEstimate: String,
        contractPrice: String
      }
    },
    implementation: {
      basicData: {
        variationToContractPrice: String,
        variationToContractDuration: String,
        escalationOfContractPrice: String
      },
      socialSustainabilityData: {
        jobsGenerated: Number
      }
    },
    completion: {
      basicData: {
        projectStatus: String,
        completionDate: String,
        completionCost: String,
        scopeAtCompletion: String
      }
    },
    operationsAndMaintenance: {
      basicData: {
        typeOfMaintenanceWorks: String,
        maintenanceScope: String
      },
      economicAndFinancialSustainabilityData: {
        budgetForMaintenance: String
      }
    },
    decommissioning: {
      basicData: {
        typeOfMaintenanceWorks: String,
        worksDescription: String
      },
      climateFinanceData: {
        decommissionPeriod: String,
        decommissionCosts: String
      }
    }
  },
  metadata: {
    dateCreated: Date,
    dateUpdated: Date,
    version: String
  }
}, { 
  timestamps: true, // Adds createdAt and updatedAt fields
  strict: false // Allows for flexibility with fields not defined in the schema
});

// Create a text index for searching
projectSchema.index({
  name: 'text',
  'location.name': 'text',
  'stages.identification.basicData.projectDescription': 'text'
});

module.exports = mongoose.model('Project', projectSchema); 