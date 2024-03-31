import { Component } from '@angular/core';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrl: './project-details.component.scss'
})
export class ProjectDetailsComponent {

  // Active section identifier
  activeSection: string = 'project-overview'; // Default to showing the first section

  project = {
    "oc4ids": "ocds-123abc-000-00001",
    "name": "Uganda Solar Power Plant",
    "country": "Uganda",
    "budget": 120000000,
    "currency": "USD",
    "description": "Construction of a 50MW solar photovoltaic power plant",
    "sector": "Energy",
    "subSector": "Renewable Energy",
    "purpose": "Increase renewable energy generation capacity",
    "location": {
      "description": "Nwoya District, Northern Uganda",
      "geometry": {
        "type": "Point",
        "coordinates": [2.9463, 31.3903]
      }
    },
    "status": "Implementation",
    "projectIdentification": {
      "environmentalImpactAssessment": "Environmental impact assessment approved",
      "socialImpactAssessment": "Social impact assessment conducted"
    },
    "projectPreparation": {
      "projectScope": "Design, construction, and operation of a 50MW solar power plant",
      "riskAssessments": [
        "Construction risks",
        "Operational risks",
        "Financial risks"
      ],
      "procurementPlan": "Public-private partnership with competitive bidding",
      "budget": 8000000,
      "fundingSources": [
        "Government budget",
        "Private investment",
        "Development bank loan"
      ],
      "publicConsultations": [
        {
          "numParticipants": 80,
          "date": "2022-03-15",
          "location": "Nwoya Town"
        },
        {
          "numParticipants": 95,
          "date": "2022-04-20",
          "location": "Anaka Town"
        },
        {
          "numParticipants": 75,
          "date": "2022-05-12",
          "location": "Purongo Town"
        }
      ]
    },
    "projectProcurement": {
      "procurementMethod": "Public-private partnership with competitive bidding",
      "contractType": "Build-Own-Operate-Transfer",
      "contractValue": 100000000,
      "numBidders": 5,
      "awardDetails": {
        "supplier": "Sun Power Energies Ltd.",
        "date": "2023-01-15",
        "value": 100000000
      }
    },
    "projectImplementation": {
      "contractMilestones": [
        {
          "name": "Site preparation",
          "dueDate": "2023-06-30"
        },
        {
          "name": "Foundation and civil works",
          "dueDate": "2023-12-31"
        },
        {
          "name": "Panel installation and electrical works",
          "dueDate": "2024-06-30"
        },
        {
          "name": "Testing and commissioning",
          "dueDate": "2024-09-30"
        }
      ],
      "variations": [
        {
          "type": "Scope",
          "description": "Addition of battery storage system",
          "value": 10000000,
          "reason": "Improve grid stability and energy storage"
        }
      ],
      "progressReports": [
        {
          "date": "2023-12-31",
          "progress": 25,
          "notes": "Site preparation and foundation works completed"
        }
      ],
      "supervisorReports": [
        {
          "date": "2023-12-31",
          "notes": "Quality of construction meets specifications"
        }
      ]
    },
    "projectCompletion": {
      "finalScope": "50MW solar power plant with 10MWh battery storage",
      "finalCost": 110000000,
      "delayReasons": [
        "Supply chain disruptions",
        "Weather conditions"
      ],
      "completionReports": [
        {
          "date": "2024-12-31",
          "notes": "Project completed and operational"
        }
      ]
    },
    "decommissioning": {
      "planDescription": "Focused on recycling materials, rehabilitating the site, and restoring the area to its original or better state.",
      "contractor": {
        "name": "EcoSol Decommissioning Services",
        "value": 5000000,
        "duration": 2
      },
      "schedule": {
        "start": "2045-01-01",
        "end": "2047-12-31"
      },
      "costForecast": 10000000,
      "environmentalImpact": {
        "carbonSavings": 5000
      }
    },
    "economicAndFinancial": {
      "procurementStrategy": "Public-private partnership with competitive bidding",
      "lifeCycleCost": 120000000,
      "lifeCycleCostCalculationMethod": "Net present value discounted at 10% over 25 years",
      "fundingSourcePreparation": "Government budget",
      "fundingSourceImplementation": "70% private investment, 20% government budget, 10% development bank loan",
      "fundingSourceMaintenance": "Private operator revenues",
      "budgetPreparation": 2000000,
      "budgetImplementation": 80000000,
      "budgetMaintenance": 50000000,
      "costBenefitAnalysis": "Economic rate of return of 12%",
      "valueForMoney": "PPP provides optimal risk transfer compared to public procurement",
      "assetLifetime": 25,
      "budgetProjections": {
        "implementation": 80000000,
        "maintenance": 50000000
      },
      "budgetShortfall": null,
      "maintenancePlan": "Preventive maintenance every 6 months, panel replacement every 10 years"
    },
    "environmentalAndClimate": {
      "environmentalImpactCategory": "B",
      "environmentalMeasures": "Habitat restoration, stormwater management",
      "environmentalLicensesAndExemptions": "Environmental impact assessment approved",
      "protectedArea": false,
      "conservationMeasures": "Native vegetation buffers around site",
      "climateAndDisasterRisk": {
        "extremeHeat": true,
        "flooding": true,
        "highWinds": true
      },
      "climateMeasures": "Flood barriers, robust panel mounting, drainage improvements",
      "greenhouseGasEmissionsEstimate": -50000,
      "environmentalCertifications": "Pursuing LEED Gold certification",
      "decomissioningPlans": "Recycling of materials, site rehabilitation",
      "decomissioningCostForecast": 10000000
    },

    "social": {
      "numberOfBeneficiaries": 200000,
      "inclusiveDesignAndImplementation": "Solar home systems for low-income households",
      "indigenousLand": false,
      "publicConsultationMeetings": [
        {
          "numParticipants": 80,
          "date": "2022-03-15",
          "location": "Nwoya Town"
        },
        {
          "numParticipants": 95,
          "date": "2022-04-20",
          "location": "Anaka Town"
        },
        {
          "numParticipants": 75,
          "date": "2022-05-12",
          "location": "Purongo Town"
        }
      ],
      "landCompensationBudget": 500000,
      "laborObligations": "Fair wages, safe working conditions, no child labor",
      "laborBudget": 15000000,
      "workersAccidents": 0,
      "healthAndSafetyCertifications": "ISO 45001",
      "constructionMaterialsTesting": "Panels tested to IEC standards",
      "buildingInspections": "Monthly inspections by energy regulator",
      "jobsGenerated": {
        "construction": 300,
        "operations": 25
      }
    },

    "institutional": {
      "policyCoherence": "Aligned with Uganda's Vision 2040 and Renewable Energy Policy 2022.",
      "freedomOfInformationRequests": 2,
      "freedomOfInformationResponses": 2,
      "lobbyingTransparency": "Compliant with national transparency regulations.",
      "beneficialOwnership": "Public registry available at https://ublr.go.ug/companies/456789.",
      "sustainabilityCriteria": "30% weight in bid evaluation for sustainability.",
      "antiCorruptionCertifications": "ISO 37001 certification for anti-bribery management.",
      "independentMonitoring": "Uganda Electricity Regulatory Authority oversees project.",
      "performanceMonitoring": "Monthly checks on output, availability, and energy delivery.",
      "riskManagementPlans": "Comprehensive strategies for construction, operational, and financial risks.",
      "sustainableSubsectors": "Focus on solar photovoltaic power.",
      "transparencyAndAccountability": "Public disclosure of project documents and reports.",
    },

    "climateFinance": {
      "climateObjective": "Mitigation",
      "financialInstrument": {
        "type": "Concessional loan",
        "amount": 20000000
      },
      "climateTransformation": "Expands clean energy, reduces emissions",
      "climateFinanceDecisionMaking": "Priorities set in Uganda Climate Change Policy",
      "nationallyDeterminedContributions": "Contributes to 80% renewable energy target by 2030",
      "parisAgreement": "Supports Paris mitigation goals",
      "beneficiaries": {
        "number": 200000,
        "description": "People gaining clean energy access"
      },
      "investmentAmount": 100000000,
      "fundingSource": [
        "Green Climate Fund",
        "Private investment"
      ],
      "greenClimateFundAccreditedEntity": true,
      "accreditedEntityType": "Direct national access",
      "projectPreparationCosts": 1000000,
      "projectPreparationPeriod": {
        "start": "2022-01-01",
        "end": "2023-06-30"
      },
      "projectApprovalPeriod": {
        "start": "2023-07-01",
        "end": "2023-12-31"
      },
      "coFinanceRatio": 0.2,
      "climateFinanceTerms": {
        "maturity": 40,
        "gracePeriod": 5,
        "annualPrincipalRepayment": 0.025,
        "interestRate": 0.0025,
        "serviceFee": 0.0075,
        "commitmentFee": 0.005
      },
      "carbonEfficiency": 0.5,
      "nonClimateCoBenefits": [
        "Improved energy access",
        "Reduced indoor air pollution"
      ],
      "publicConsultationMeetings": 3,
      "disbursementRecords": "https://greenclimate.fund/project/456/disbursements",
      "projectMonitoringType": "Mixed",
      "performanceMonitoring": [
        "GHG emissions reduced",
        "Beneficiaries reached"
      ],
      "reportingPeriod": "Annual",
      "oversightReports": "https://greenclimate.fund/project/456/oversight",
      "independentMonitoring": "Uganda Auditor General",
      "independentEvaluation": "https://greenclimate.fund/project/456/evaluation",
      "impactMeasurement": "Household surveys on beneficiaries and socioeconomic impacts",
      "carbonFootprint": -50000,
      "assetsToBeDecommissioned": "Diesel generators",
      "decomissioningPeriod": {
        "start": "2045-01-01",
        "end": "2047-12-31"
      },
      "decomissioningPlan": "https://anytown.gov/utilities/diesel-generators-decommissioning",
      "carbonDecomissioningSavings": 5000,
      "decomissioningMitigationPlan": "Retraining for workers, community transition support"
    }

  }
  constructor() {}



  getTotalParticipants() {
    return this.project.projectPreparation.publicConsultations.reduce((total, consultation) => total + consultation.numParticipants, 0);
  }

  getTotalParticipants1() {
    return this.project.social.publicConsultationMeetings.reduce((total, meeting) => total + meeting.numParticipants, 0);
  }

  setActiveSection(sectionId: string): void {
    this.activeSection = sectionId;
  }




}
