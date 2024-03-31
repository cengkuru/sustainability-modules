import { Component } from '@angular/core';


@Component({
  selector: 'app-project-listing',
  templateUrl: './project-listing.component.html',
  styleUrl: './project-listing.component.scss'
})
export class ProjectListingComponent {
  projects = [
    {
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
        "budget": 80000000,
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
        "environmentalImpactCategory": "Category B",
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
        "healthAndSafetyCertifications": "Contractor has ISO 45001 certification",
        "constructionMaterialsTesting": "Panels tested to IEC standards",
        "buildingInspections": "Monthly inspections by energy regulator",
        "jobsGenerated": {
          "construction": 300,
          "operations": 25
        }
      },
      "institutional": {
        "policyCoherence": [
          {
            "plan": "Uganda Vision 2040",
            "details": "Aligns with renewable energy targets"
          },
          {
            "plan": "Uganda Renewable Energy Policy 2022",
            "details": "Part of utility-scale solar program"
          }
        ],
        "freedomOfInformationRequests": 2,
        "freedomOfInformationResponses": 2,
        "lobbyingTransparency": null,
        "beneficialOwnership": {
          "disclosureLevel": "public registry",
          "details": "https://ublr.go.ug/companies/456789"
        },
        "sustainabilityCriteria": {
          "weightInBidEvaluation": 0.3
        },
        "antiCorruptionCertifications": "Contractor has ISO 37001 certification",
        "independentMonitoring": "Uganda Electricity Regulatory Authority",
        "performanceMonitoring": [
          "Output",
          "Availability",
          "Energy delivery"
        ],
        "riskManagementPlans": [
          "Construction risks",
          "Operational risks",
          "Financial risks"
        ],
        "sustainableSubsectors": [
          "Solar photovoltaic power"
        ]
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
        "carbonDecommissioningSavings": 5000,
        "decomissioningMitigationPlan": "Retraining for workers, community transition support"
      }
    },
    {
      "oc4ids": "ocds-123abc-000-00002",
      "name": "Panama City Metro Line 3",
      "country": "Panama",
      "budget": 2800000000,
      "currency": "USD",
      "description": "Construction of a new 26km metro line with 14 stations, including a connection over the Panama Canal via the fourth bridge.",
      "sector": "Transport",
      "subSector": "Urban Rail",
      "purpose": "Expand urban mobility and connectivity in Panama City metropolitan area",
      "location": {
        "description": "Panama City, Panama",
        "geometry": {
          "type": "MultiLineString",
          "coordinates": [
            [
              [-79.535, 8.9714],
              [-79.5302, 8.9884],
              [-79.5273, 9.0043]
            ],
            [
              [-79.5243, 9.0191],
              [-79.5198, 9.0366],
              [-79.5139, 9.0528]
            ]
          ]
        }
      },
      "status": "Preparation",
      "projectIdentification": {
        "environmentalImpactAssessment": "Environmental impact assessment approved",
        "socialImpactAssessment": "Social impact assessment conducted"
      },
      "projectPreparation": {
        "projectScope": "Design, construction, and operation of a 26km metro line with 14 stations and connection over the Panama Canal",
        "riskAssessments": [
          "Construction risks",
          "Demand risks",
          "Financial risks"
        ],
        "procurementPlan": "Design-build-finance-operate-maintain PPP",
        "budget": 2500000000,
        "fundingSources": [
          "Government budget",
          "Private finance"
        ],
        "publicConsultations": [
          {
            "numParticipants": 200,
            "date": "2022-03-15",
            "location": "Panama City"
          },
          {
            "numParticipants": 150,
            "date": "2022-04-20",
            "location": "Arraijan"
          },
          {
            "numParticipants": 180,
            "date": "2022-05-10",
            "location": "Panama Pacifico"
          }
        ]
      },
      "projectProcurement": {
        "procurementMethod": "Design-build-finance-operate-maintain PPP",
        "contractType": "Public-private partnership",
        "contractValue": 2800000000,
        "numBidders": 3,
        "awardDetails": {
          "supplier": "Metro Panamá Consortium",
          "date": "2024-03-31",
          "value": 2800000000
        }
      },
      "projectImplementation": {
        "contractMilestones": [
          {
            "name": "Final design",
            "dueDate": "2025-06-30"
          },
          {
            "name": "Site preparation and utility relocation",
            "dueDate": "2025-12-31"
          },
          {
            "name": "Civil works and track installation",
            "dueDate": "2028-06-30"
          },
          {
            "name": "Systems installation and testing",
            "dueDate": "2029-06-30"
          },
          {
            "name": "Commissioning and start of operations",
            "dueDate": "2029-12-31"
          }
        ],
        "variations": [
          {
            "type": "Scope",
            "description": "Addition of two new stations",
            "value": 120000000,
            "reason": "Improve accessibility and coverage"
          }
        ],
        "progressReports": [
          {
            "date": "2025-12-31",
            "progress": 10,
            "notes": "Final design and site preparation completed"
          }
        ],
        "supervisorReports": [
          {
            "date": "2025-12-31",
            "notes": "Design and planning meets specifications"
          }
        ]
      },
      "projectCompletion": {
        "finalScope": "28km metro line with 16 stations and canal crossing",
        "finalCost": 2920000000,
        "delayReasons": [
          "Design changes",
          "Unforeseen site conditions"
        ],
        "completionReports": [
          {
            "date": "2030-06-30",
            "notes": "Project completed and operational"
          }
        ]
      },
      "economicAndFinancial": {
        "procurementStrategy": "Design-build-finance-operate-maintain PPP",
        "lifeCycleCost": 2800000000,
        "lifeCycleCostCalculationMethod": "Net present value discounted at 8% over 30 years",
        "fundingSourcePreparation": "Government budget",
        "fundingSourceImplementation": "70% private finance, 30% government budget",
        "fundingSourceMaintenance": "Farebox revenues",
        "budgetPreparation": 40000000,
        "budgetImplementation": 2500000000,
        "budgetMaintenance": 1500000000,
        "costBenefitAnalysis": "Economic internal rate of return of 18%",
        "valueForMoney": "PPP provides optimal risk allocation and whole life costing",
        "assetLifetime": 30,
        "budgetProjections": {
          "implementation": 2500000000,
          "maintenance": 1500000000
        },
        "budgetShortfall": null,
        "maintenancePlan": "Preventive maintenance and asset replacement fund"
      },
      "environmentalAndClimate": {
        "environmentalImpactCategory": "Category A",
        "environmentalMeasures": "Habitat restoration, stormwater management, noise barriers",
        "environmentalLicensesAndExemptions": "Environmental impact assessment approved",
        "protectedArea": true,
        "conservationMeasures": "Reforestation, wildlife crossings",
        "climateAndDisasterRisk": {
          "flooding": true,
          "extremeRainfall": true,
          "seaLevelRise": true
        },
        "climateMeasures": "Flood barriers, drainage improvements, elevated track",
        "greenhouseGasEmissionsEstimate": -150000,
        "environmentalCertifications": "Pursuing LEED Gold certification",
        "decomissioningPlans": "Recycling of materials, site rehabilitation",
        "decomissioningCostForecast": 300000000
      },
      "social": {
        "numberOfBeneficiaries": 750000,
        "inclusiveDesignAndImplementation": "Universal accessibility, affordable fares",
        "indigenousLand": false,
        "publicConsultationMeetings": [
          {
            "numParticipants": 200,
            "date": "2022-03-15",
            "location": "Panama City"
          },
          {
            "numParticipants": 150,
            "date": "2022-04-20",
            "location": "Arraijan"
          },
          {
            "numParticipants": 180,
            "date": "2022-05-10",
            "location": "Panama Pacifico"
          }
        ],
        "landCompensationBudget": 80000000,
        "laborObligations": "Fair wages, safe working conditions, no forced labor",
        "laborBudget": 600000000,
        "workersAccidents": 0,
        "healthAndSafetyCertifications": "Contractor has ISO 45001 certification",
        "constructionMaterialsTesting": "Materials tested to international standards",
        "buildingInspections": "Monthly inspections by Ministry of Public Works",
        "jobsGenerated": {
          "construction": 8000,
          "operations": 800
        }
      },
      "institutional": {
        "policyCoherence": [
          {
            "plan": "Panama 2030 National Logistics Strategy",
            "details": "Expands public transit as part of intermodal transport network"
          },
          {
            "plan": "Panama City 2040 Urban Mobility Master Plan",
            "details": "Increases coverage and frequency of metro service"
          }
        ],
        "freedomOfInformationRequests": 5,
        "freedomOfInformationResponses": 5,
        "lobbyingTransparency": "Meetings with industry associations disclosed",
        "beneficialOwnership": {
          "disclosureLevel": "public registry",
          "details": "https://panamacompra.gob.pa/ownership/metro-line-3"
        },
        "sustainabilityCriteria": {
          "weightInBidEvaluation": 0.3
        },
        "antiCorruptionCertifications": "Contractor has ISO 37001 certification",
        "independentMonitoring": "Comptroller General of Panama",
        "performanceMonitoring": [
          "Ridership",
          "On-time performance",
          "Passenger satisfaction"
        ],
        "riskManagementPlans": [
          "Construction risks",
          "Demand risks",
          "Financial risks"
        ],
        "sustainableSubsectors": [
          "Urban passenger rail"
        ]
      },
      "climateFinance": {
        "climateObjective": "Mitigation",
        "financialInstrument": {
          "type": "Concessional loan",
          "amount": 500000000
        },
        "climateTransformation": "Shifts passengers from cars to low-carbon transit",
        "climateFinanceDecisionMaking": "Aligned with National Decarbonization Plan",
        "nationallyDeterminedContributions": "Contributes to 35% emission reduction in transport by 2050",
        "parisAgreement": "Supports Paris mitigation goals",
        "beneficiaries": {
          "number": 750000,
          "description": "Commuters gaining access to clean, efficient transit"
        },
        "investmentAmount": 2800000000,
        "fundingSource": [
          "Inter-American Development Bank",
          "Private investment"
        ],
        "greenClimateFundAccreditedEntity": false,
        "accreditedEntityType": null,
        "projectPreparationCosts": 40000000,
        "projectPreparationPeriod": {
          "start": "2020-01-01",
          "end": "2023-12-31"
        },
        "projectApprovalPeriod": {
          "start": "2024-01-01",
          "end": "2024-06-30"
        },
        "coFinanceRatio": 0.3,
        "climateFinanceTerms": {
          "maturity": 30,
          "gracePeriod": 5,
          "annualPrincipalRepayment": 0.033,
          "interestRate": 0.02,
          "serviceFee": 0.005,
          "commitmentFee": 0.0025
        },
        "carbonEfficiency": 0.3,
        "nonClimateCoBenefits": [
          "Reduced air pollution",
          "Increased access and mobility for low-income residents"
        ],
        "publicConsultationMeetings": 3,
        "disbursementRecords": "https://idbdocs.iadb.org/projects/PN-L1234/disbursements",
        "projectMonitoringType": "Mixed",
        "performanceMonitoring": [
          "GHG emissions reduced",
          "Modal shift achieved",
          "Beneficiaries reached"
        ],
        "reportingPeriod": "Annual",
        "oversightReports": "https://contraloria.gob.pa/metro-line-3/oversight",
        "independentMonitoring": "Comptroller General of Panama",
        "independentEvaluation": "https://idbdocs.iadb.org/projects/PN-L1234/evaluation",
        "impactMeasurement": "Surveys to measure ridership, travel time savings, accessibility",
        "carbonFootprint": -150000,
        "assetsToBeDecommissioned": "Diesel buses",
        "decomissioningPeriod": {
          "start": "2054-01-01",
          "end": "2056-12-31"
        },
        "decomissioningPlan": "https://mibus.gob.pa/fleet-transition",
        "carbonDecommissioningSavings": 20000,
        "decomissioningMitigationPlan": "Retraining for bus drivers, expanded feeder services"
      }
    },
    {
      "oc4ids": "ocds-123abc-000-00001",
      "name": "West Lombok Water Supply Expansion",
      "country": "Indonesia",
      "budget": 2800000000,
      "currency": "IDR",
      "description": "Expansion of the existing water supply network to provide improved access to clean water for residents in rural areas of West Lombok.",
      "sector": "Water and Sanitation",
      "subSector": "Water Supply",
      "purpose": "To improve health and sanitation standards by providing reliable access to potable water.",
      "location": {
        "description": "Rural areas of West Lombok, Indonesia",
        "geometry": {
          "type": "Point",
          "coordinates": [116.092, -8.5656]
        }
      },
      "status": "Preparation",
      "projectIdentification": {
        "environmentalImpactAssessment": "Environmental impact assessment underway",
        "socialImpactAssessment": "Social impact assessment completed with community engagement"
      },
      "projectPreparation": {
        "projectScope": "Installation of new water pipelines and treatment facilities",
        "riskAssessments": [
          "Environmental risks",
          "Technical risks",
          "Community engagement risks"
        ],
        "procurementPlan": "Open tender for construction and installation services",
        "budget": {
          "amount": 70000000,
          "currency": "IDR"
        },
        "fundingSources": [
          "Government budget",
          "International development grants"
        ],
        "publicConsultations": [
          {
            "numParticipants": 120,
            "date": "2024-01-15",
            "location": "Mataram"
          }
        ]
      },
      "projectProcurement": {
        "procurementMethod": "Open tender",
        "contractType": "Fixed-price contract",
        "contractValue": {
          "amount": 75000000,
          "currency": "IDR"
        },
        "numBidders": 5,
        "awardDetails": {
          "supplier": "PT Clean Water Indonesia",
          "date": "2024-06-30",
          "value": {
            "amount": 75000000,
            "currency": "IDR"
          }
        }
      },
      "projectImplementation": {
        "contractMilestones": [
          {
            "name": "Groundbreaking",
            "dueDate": "2025-01-30"
          },
          {
            "name": "Pipeline installation",
            "dueDate": "2025-07-30"
          },
          {
            "name": "Water treatment facility completion",
            "dueDate": "2026-01-30"
          }
        ],
        "variations": [],
        "progressReports": [
          {
            "date": "2025-07-30",
            "progress": 50,
            "notes": "Half of the pipelines have been successfully installed."
          }
        ],
        "supervisorReports": [
          {
            "date": "2025-07-30",
            "notes": "Installation is on schedule and meets quality standards."
          }
        ]
      },
      "projectCompletion": {
        "finalScope": "Expanded water supply network with new treatment facilities",
        "finalCost": {
          "amount": 75000000,
          "currency": "IDR"
        },
        "delayReasons": [],
        "completionReports": [
          {
            "date": "2026-06-30",
            "notes": "Project completed and operational, serving 10,000 households."
          }
        ]
      }
    }
  ];

}
