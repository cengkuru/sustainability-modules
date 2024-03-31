import { Component } from '@angular/core';

@Component({
  selector: 'app-economic',
  templateUrl: './economic.component.html',
  styleUrl: './economic.component.scss'
})
export class EconomicComponent {

  moduleInfo = {
    "title": "Economic and Financial",
    "description": "Understand project costs, budgets, and long-term impacts.",
    "dataPoints": "11 Data Points",
    "icon": "bi bi-cash-stack",
    "rationale": "Make informed financial decisions by assessing life-cycle costs, budgets, and cost-benefit analysis. Identify funding sources and manage risks to ensure the project's financial viability and long-term economic benefits."
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
      "name": "Procurement Strategy",
      "dataPoints": [
        {
          "title": "Procurement strategy",
          "stage": "Identification",
          "description": "Outlines the plan for purchasing goods and services, ensuring the project's success."
        }
      ]
    },
    {
      "name": "Economic Viability",
      "dataPoints": [
        {
          "title": "Life-cycle cost",
          "stage": "Preparation",
          "description": "The total cost of the project over its entire lifespan, ensuring it meets performance needs."
        },
        {
          "title": "Life-cycle cost calculation methodology",
          "stage": "Preparation",
          "description": "Explains how the life-cycle cost was calculated, ensuring transparency and accuracy."
        },
        {
          "title": "Funding source for preparation, implementation, and maintenance",
          "stage": "Across the project cycle",
          "description": "Identifies the organizations or sources providing funds for the project's various stages."
        },
        {
          "title": "Budget for preparation, implementation, and maintenance",
          "stage": "Across the project cycle",
          "description": "Specifies the allocated budget for each stage of the project, ensuring financial planning."
        },
        {
          "title": "Cost-benefit analysis",
          "stage": "Preparation",
          "description": "Assesses the economic benefits and costs of the project, aiding decision-making."
        },
        {
          "title": "Value for money",
          "stage": "Preparation",
          "description": "Evaluates the project's value in terms of economy, efficiency, effectiveness, and fairness."
        },
        {
          "title": "Asset lifetime",
          "stage": "Preparation",
          "description": "Estimates the expected lifespan of the asset, aiding long-term planning."
        }
      ]
    },
    {
      "name": "Financial",
      "dataPoints": [
        {
          "title": "Budget projections",
          "stage": "Preparation",
          "description": "Provides budget estimates for all years of a multi-year project, ensuring long-term financial planning."
        },
        {
          "title": "Budget shortfall",
          "stage": "Implementation",
          "description": "Discloses any budget deficits and their reasons, promoting transparency and accountability."
        }
      ]
    },
    {
      "name": "Economic and Financial",
      "dataPoints": [
        {
          "title": "Maintenance plan",
          "stage": "Preparation",
          "description": "Outlines the work needed to prevent asset breakdowns, ensuring long-term performance."
        }
      ]
    }
  ]




}
