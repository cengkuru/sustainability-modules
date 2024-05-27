import { Component } from '@angular/core';

@Component({
  selector: 'app-institutional',
  templateUrl: './institutional.component.html',
  styleUrl: './institutional.component.scss'
})
export class InstitutionalComponent {
  moduleInfo = {
    "title": "Institutional",
    "description": "Evaluate policy alignment, integrity risks, and monitoring capabilities.",
    "dataPoints": "11 Data Points",
    "icon": "bi bi-building",
    "rationale": "Assess the project's compliance with policies, identify corruption risks, and ensure adequate monitoring. Promote transparency, accountability, and sustainable development by disclosing institutional data points."
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
      "name": "Environmental Impact",
      "dataPoints": [
        {
          "title": "Environmental impact category",
          "stage": "Preparation",
          "description": "Indicate if an environmental impact assessment was conducted and its category."
        },
        {
          "title": "Environmental measures",
          "stage": "Preparation and Implementation",
          "description": "Identify measures to mitigate and/or remedy environmental impact."
        },
        {
          "title": "Environmental licenses and exemptions",
          "stage": "Preparation, Implementation, and Maintenance",
          "description": "Disclose licenses, exemptions, and/or amnesties related to environmental compliance."
        }
      ]
    },
    {
      "name": "Biodiversity",
      "dataPoints": [
        {
          "title": "Protected area",
          "stage": "Preparation",
          "description": "Identify if the project is located in or provides access to a protected area."
        },
        {
          "title": "Conservation measures",
          "stage": "Preparation and Implementation",
          "description": "Disclose measures to protect and enhance biodiversity."
        }
      ]
    },
    {
      "name": "Climate Risk",
      "dataPoints": [
        {
          "title": "Climate and disaster risk assessment",
          "stage": "Preparation",
          "description": "Clarify the climate and disaster risks the project is exposed to."
        },
        {
          "title": "Climate measures",
          "stage": "Preparation and Operation",
          "description": "Clarify if the project design considered climate change mitigation and/or adaptation measures."
        },
        {
          "title": "Forecast of greenhouse gas emissions",
          "stage": "Preparation",
          "description": "Disclose the forecast greenhouse gas emissions related to the project."
        }
      ]
    },
    {
      "name": "Environmental and Climate Management",
      "dataPoints": [
        {
          "title": "Environmental certifications",
          "stage": "Tender Management",
          "description": "Disclose environmental and/or climate-related certifications issued for contractors and subcontractors."
        },
        {
          "title": "Decommissioning plans",
          "stage": "Decommissioning",
          "description": "Disclose the decommissioning plans for the project assets."
        },
        {
          "title": "Decommissioning cost forecast",
          "stage": "Decommissioning",
          "description": "Disclose the forecast decommissioning costs for the project assets."
        }
      ]
    }
  ]





}
