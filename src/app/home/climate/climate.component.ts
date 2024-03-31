import { Component } from '@angular/core';

@Component({
  selector: 'app-climate',
  templateUrl: './climate.component.html',
  styleUrl: './climate.component.scss'
})
export class ClimateComponent {
  moduleInfo = {
    "title": "Climate Finance",
    "description": "Ensure transparency and effectiveness in climate change mitigation and adaptation investments.",
    "dataPoints": "33 Data Points",
    "icon": "bi bi-cloud-sun",
    "rationale": "Promote accountability and impact in climate finance by disclosing key data points. Enable stakeholders to assess the transparency, effectiveness, and alignment of investments with climate goals."
  }


  newModules = [
    {
      title: 'Economic and Financial',
      description: 'Critical data points for assessing budget, operations, and maintenance impacts.',
      dataPoints: '11 Data Points',
      icon: 'bi bi-cash-stack',
      url: 'economic'
    },
    {
      title: 'Environmental and Climate Resilience',
      description: 'Insights into biodiversity, disaster risk, and climate adaptability.',
      dataPoints: '11 Data Points',
      icon: 'bi bi-tree',
      url: 'environment'
    },
    {
      title: 'Social Impact',
      description: 'Evaluating projects for gender equality, inclusion, and community health.',
      dataPoints: '12 Data Points',
      icon: 'bi bi-people-fill',
      url: 'social'
    },
    {
      title: 'Institutional',
      description: 'Assessing coherence with policies, integrity risks, and monitoring capacities.',
      dataPoints: '11 Data Points',
      icon: 'bi bi-building',
      url: 'institutional'
    },
    {
      title: 'Climate Finance',
      description: 'Enhancing transparency in investments for climate change mitigation and adaptation.',
      dataPoints: '33 Data Points',
      icon: 'bi bi-cloud-sun',
      url: 'climate'
    }
  ];

  categories = [
    {
      "name": "Climate Objective",
      "dataPoints": [
        {
          "title": "Climate objective",
          "stage": "Identification",
          "description": "Disclose the main climate objective: mitigation, adaptation, or cross-cutting."
        }
      ]
    },
    {
      "name": "Financial Instrument",
      "dataPoints": [
        {
          "title": "Financial instrument",
          "stage": "Identification",
          "description": "Disclose the financial instrument type: loan, grant, equity, or guarantees."
        }
      ]
    },
    {
      "name": "Climate Transformation",
      "dataPoints": [
        {
          "title": "Climate transformation",
          "stage": "Identification",
          "description": "Disclose the climate transformation rationale for the project."
        }
      ]
    },
    {
      "name": "Climate Finance Decision-Making",
      "dataPoints": [
        {
          "title": "Climate finance decision-making",
          "stage": "Identification",
          "description": "Disclose the decision-making process for climate finance investment."
        }
      ]
    },
    {
      "name": "Nationally Determined Contributions",
      "dataPoints": [
        {
          "title": "Nationally Determined Contributions",
          "stage": "Identification",
          "description": "Disclose how the project aligns with the country's NDCs."
        }
      ]
    },
    {
      "name": "Paris Agreement",
      "dataPoints": [
        {
          "title": "Paris Agreement",
          "stage": "Identification",
          "description": "Disclose how the project aligns with the Paris Agreement."
        }
      ]
    },
    {
      "name": "Beneficiaries",
      "dataPoints": [
        {
          "title": "Beneficiaries",
          "stage": "Identification",
          "description": "Disclose the intended beneficiaries of the climate finance investment."
        }
      ]
    },
    {
      "name": "Investment Amount",
      "dataPoints": [
        {
          "title": "Amount of investment",
          "stage": "Identification",
          "description": "Disclose the amount of climate finance investment."
        }
      ]
    },
    {
      "name": "Funding Source",
      "dataPoints": [
        {
          "title": "Funding source",
          "stage": "Identification",
          "description": "Disclose the funding source for the climate finance investment."
        }
      ]
    },
    {
      "name": "Green Climate Fund",
      "dataPoints": [
        {
          "title": "Green Climate Fund accredited entity",
          "stage": "Identification",
          "description": "Identify if the project is funded by the Green Climate Fund."
        },
        {
          "title": "Accredited entity type",
          "stage": "Identification",
          "description": "Disclose the type of accredited entity for GCF investment."
        }
      ]
    },
    {
      "name": "Project Preparation",
      "dataPoints": [
        {
          "title": "Project preparation costs",
          "stage": "Preparation",
          "description": "Disclose the costs of preparing the climate finance project."
        },
        {
          "title": "Project preparation period",
          "stage": "Preparation",
          "description": "Disclose the duration of the project preparation phase."
        }
      ]
    },
    {
      "name": "Project Approval",
      "dataPoints": [
        {
          "title": "Project approval period",
          "stage": "Preparation",
          "description": "Disclose the duration of the project approval process."
        }
      ]
    },
    {
      "name": "Co-Finance",
      "dataPoints": [
        {
          "title": "Ratio of co-finance",
          "stage": "Preparation",
          "description": "Disclose the ratio of co-financing for the climate finance investment."
        }
      ]
    },
    {
      "name": "Climate Finance Terms",
      "dataPoints": [
        {
          "title": "Terms of climate finance",
          "stage": "Preparation",
          "description": "Disclose the terms and conditions of the climate finance investment."
        }
      ]
    },
    {
      "name": "Carbon Efficiency",
      "dataPoints": [
        {
          "title": "Carbon efficiency",
          "stage": "Preparation",
          "description": "Disclose the carbon efficiency of the climate finance investment."
        }
      ]
    },
    {
      "name": "Co-Benefits",
      "dataPoints": [
        {
          "title": "Non-climate co-benefits",
          "stage": "Preparation",
          "description": "Disclose any non-climate co-benefits of the climate finance investment."
        }
      ]
    },
    {
      "name": "Public Consultation",
      "dataPoints": [
        {
          "title": "Public consultation meetings",
          "stage": "Preparation",
          "description": "Disclose public consultation meetings related to the investment."
        }
      ]
    },
    {
      "name": "Disbursement Records",
      "dataPoints": [
        {
          "title": "Disbursement records",
          "stage": "Implementation",
          "description": "Disclose the disbursement records for the climate finance investment."
        }
      ]
    },
    {
      "name": "Project Monitoring",
      "dataPoints": [
        {
          "title": "Type of project monitoring",
          "stage": "Implementation",
          "description": "Disclose the type of monitoring for the climate finance project."
        },
        {
          "title": "Performance monitoring",
          "stage": "Implementation",
          "description": "Disclose the performance monitoring indicators for the project."
        }
      ]
    },
    {
      "name": "Reporting",
      "dataPoints": [
        {
          "title": "Reporting period",
          "stage": "Implementation",
          "description": "Disclose the reporting period for the climate finance project."
        }
      ]
    },
    {
      "name": "Oversight",
      "dataPoints": [
        {
          "title": "Oversight reports",
          "stage": "Implementation",
          "description": "Disclose oversight reports for the climate finance project."
        }
      ]
    },
    {
      "name": "Independent Monitoring",
      "dataPoints": [
        {
          "title": "Independent monitoring",
          "stage": "Implementation",
          "description": "Identify the entities acting as independent monitors for the project."
        }
      ]
    },
    {
      "name": "Independent Evaluation",
      "dataPoints": [
        {
          "title": "Independent evaluation",
          "stage": "Implementation",
          "description": "Disclose independent evaluations of the climate finance project."
        }
      ]
    },
    {
      "name": "Impact Measurement",
      "dataPoints": [
        {
          "title": "Impact measurement",
          "stage": "Operation",
          "description": "Disclose the methodology to measure the long-term impact of the project."
        }
      ]
    },
    {
      "name": "Carbon Footprint",
      "dataPoints": [
        {
          "title": "Carbon footprint",
          "stage": "Operation",
          "description": "Disclose the carbon footprint of the climate finance project."
        }
      ]
    },
    {
      "name": "Stranded Assets",
      "dataPoints": [
        {
          "title": "Infrastructure assets to be decommissioned",
          "stage": "Decommission",
          "description": "Identify the assets to be decommissioned as part of the project."
        }
      ]
    },
    {
      "name": "Decommissioning",
      "dataPoints": [
        {
          "title": "Decommission period",
          "stage": "Decommission",
          "description": "Disclose the start and end dates for decommissioning assets."
        },
        {
          "title": "Decommission plan",
          "stage": "Decommission",
          "description": "Disclose the technical plan for decommissioning assets."
        }
      ]
    },
    {
      "name": "Carbon Savings",
      "dataPoints": [
        {
          "title": "Carbon decommission savings",
          "stage": "Decommission",
          "description": "Disclose the evaluation of CO2 savings from decommissioning assets."
        }
      ]
    },
    {
      "name": "Mitigation Plan",
      "dataPoints": [
        {
          "title": "Decommission mitigation plan",
          "stage": "Decommission",
          "description": "Disclose the mitigation plan for people and communities affected by decommissioning."
        }
      ]
    }
  ]



}
