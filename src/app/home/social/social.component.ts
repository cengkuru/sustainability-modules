import { Component } from '@angular/core';

@Component({
  selector: 'app-social',
  templateUrl: './social.component.html',
  styleUrl: './social.component.scss'
})
export class SocialComponent {
  moduleInfo = {
    "title": "Social Impact",
    "description": "Assess the project's impact on beneficiaries, inclusivity, land rights, labor, health, safety, and employment.",
    "dataPoints": "12 Data Points",
    "icon": "bi bi-building",
    "rationale": "Evaluate the project's social benefits and risks. Ensure inclusive design, fair compensation, and protection of rights. Promote transparency and accountability in addressing social concerns and creating positive outcomes for communities."
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
      "name": "Inclusive Design",
      "dataPoints": [
        {
          "title": "Inclusive design and implementation",
          "stage": "Preparation and Implementation",
          "description": "Clarify if gender, disabilities, and vulnerable populations were considered in project design and implementation."
        }
      ]
    },
    {
      "name": "Indigenous Peoples",
      "dataPoints": [
        {
          "title": "Indigenous land",
          "stage": "Preparation",
          "description": "Identify if the project is located on or crosses indigenous land."
        }
      ]
    },
    {
      "name": "Public Participation",
      "dataPoints": [
        {
          "title": "Public consultation meetings",
          "stage": "Preparation",
          "description": "Disclose public meetings held with communities and impacted groups."
        },
        {
          "title": "Land compensation budget",
          "stage": "Preparation",
          "description": "Disclose budget allocated for land compensation."
        }
      ]
    },
    {
      "name": "Labor",
      "dataPoints": [
        {
          "title": "Labor obligations",
          "stage": "Implementation",
          "description": "Disclose labor obligations in the construction contract."
        },
        {
          "title": "Labor budget",
          "stage": "Tender Management",
          "description": "Disclose budget allocated to labor costs."
        },
        {
          "title": "Workers' accidents",
          "stage": "Implementation",
          "description": "Disclose the number of accidents involving workers."
        },
        {
          "title": "Jobs generated",
          "stage": "Implementation and Operation",
          "description": "Disclose the number of jobs generated by the project."
        }
      ]
    },
    {
      "name": "Health & Safety",
      "dataPoints": [
        {
          "title": "Health and safety certifications",
          "stage": "Tender Management",
          "description": "Disclose health and safety certifications required from bidders."
        },
        {
          "title": "Construction materials testing",
          "stage": "Implementation",
          "description": "Disclose testing of construction materials for safety and quality."
        },
        {
          "title": "Building inspections",
          "stage": "Implementation",
          "description": "Disclose building inspections carried out to ensure safety."
        }
      ]
    }
  ]


}
