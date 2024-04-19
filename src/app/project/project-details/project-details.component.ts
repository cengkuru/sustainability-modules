import { Component } from '@angular/core';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss']
})
export class ProjectDetailsComponent {
  // Tracks the currently active tab
  activeTab: string = 'identification';
  collapseStates: { [key: string]: boolean } = {};

  sampleData = {
    "version": "0.9",
    "uri": "https://standard.open-contracting.org/infrastructure/0.9/en/_static/example.json",
    "publishedDate": "2018-12-10T15:53:00Z",
    "publisher": {
      "name": "Open Data Services Co-operative Limited",
      "scheme": "GB-COH",
      "uid": "9506232",
      "uri": "http://data.companieshouse.gov.uk/doc/company/09506232"
    },
    "license": "http://opendatacommons.org/licenses/pddl/1.0/",
    "publicationPolicy": "https://standard.open-contracting.org/1.1/en/implementation/publication_policy/",
    "projects": [
      {
        "id": "za-ct-waterfront-revitalization-2021",
        "identifiers": [
          {
            "id": "ZA-CT-2021-01",
            "legalName": "Cape Town Waterfront Revitalization Authority"
          }
        ],
        "updated": "2021-05-15T12:00:00Z",
        "title": "Cape Town Waterfront Revitalization Project",
        "description": "This project involves the expansion and upgrading of the V&A Waterfront to increase tourist capacity and improve public spaces, including the addition of new commercial facilities and enhanced maritime services.",
        "status": "active",
        "period": {
          "startDate": "2021-01-01",
          "endDate": "2025-12-31"
        },
        "identificationPeriod": {
          "startDate": "2016-01-01T00:00:00Z",
          "endDate": "2016-06-30T00:00:00Z"
        },
        "preparationPeriod": {
          "startDate": "2016-07-01T00:00:00Z",
          "endDate": "2016-12-31T00:00:00Z"
        },
        "implementationPeriod": {
          "startDate": "2017-01-01T00:00:00Z",
          "endDate": "2017-06-30T00:00:00Z"
        },
        "completionPeriod": {
          "startDate": "2017-07-01T00:00:00Z",
          "endDate": "2017-12-31T00:00:00Z"
        },
        "maintenancePeriod": {
          "startDate": "2018-01-01T00:00:00Z",
          "endDate": "2040-07-01T00:00:00Z"
        },
        "decommissioningPeriod": {
          "startDate": "2040-07-01T00:00:00Z",
          "endDate": "2041-06-30T00:00:00Z"
        },










        "type": "Development",
        "purpose": "To enhance economic growth and tourism in the Cape Town region by modernizing infrastructure and expanding facilities at the V&A Waterfront.",
        "locations": [
          {
            "description": "Victoria & Alfred Waterfront, Cape Town, South Africa",
            "geometry": {
              "type": "Point",
              "coordinates": [18.423300, -33.918861]
            }
          }
        ],
        "budget": {
          "id": "budget-za-ct-01",
          "description": "Total budget allocated for the waterfront revitalization",
          "amount": {
            "currency": "ZAR",
            "value": 4500000000
          },
          "source": "Public-private partnership funding"
        },
        "projectParties": [
          {
            "role": "developer",
            "name": "Waterfront Development Co.",
            "identifier": {
              "scheme": "ZA-BR",
              "id": "WD123456"
            }
          },
          {
            "role": "government",
            "name": "City of Cape Town",
            "identifier": {
              "scheme": "ZA-GOV",
              "id": "CTO123"
            }
          }
        ],
        "milestones": [
          {
            "id": "milestone1",
            "type": "start",
            "title": "Groundbreaking",
            "status": "achieved",
            "date": "2021-01-15"
          },
          {
            "id": "milestone2",
            "type": "mid-point",
            "title": "Completion of Phase 1",
            "status": "expected",
            "date": "2023-12-31"
          }
        ],
        "documents": [
          {
            "documentType": "projectProposal",
            "id": "doc-2021-ct-wf-01",
            "title": "Waterfront Project Proposal",
            "description": "Comprehensive project proposal for the Cape Town Waterfront Revitalization.",
            "url": "http://capetown.gov.za/documents/waterfront-proposal.pdf",
            "datePublished": "2020-12-20"
          }
        ]
      }
    ]
  }




  // Information about the tabs and their respective names
  // Each tab now includes a 'fields' array



  // Detailed fields within the Identification phase
  identificationFields = [
    { label: 'Project Identifier', value: '001' },
    { label: 'Project Name', value: 'Cape Town Waterfront Revitalization' },
    { label: 'Project Description', value: 'Revitalization of the waterfront area to boost tourism and protect natural resources.' },
    { label: 'Sector', value: 'Tourism' },
    { label: 'Subsector', value: 'Urban Development' },
    { label: 'Project Location', value: 'V&A Waterfront, Cape Town, South Africa' },
    { label: 'Purpose', value: 'To enhance urban infrastructure and promote sustainable tourism.' },
    { label: 'Project Owner Organization', value: 'City of Cape Town' },
    { label: 'Project Owner Organization Roles', value: 'Project Initiator and Supervisor' },
    { label: 'Project Owner Contact Point', value: 'info@capetown.gov.za' },
    { label: 'Project Sponsor', value: 'South African Government' },
    { label: 'Project Sponsor Organization Roles', value: 'Funding and Strategic Support' },
    { label: 'Project Sponsor Contact Point', value: 'sponsor@sagov.org' },
    { label: 'Project Needs Assessment', value: 'Identified need for improved urban spaces and tourism facilities' },
    { label: 'Project Rationale', value: 'To support economic growth and enhance the quality of life for residents' },
    { label: 'Project Approval Date', value: '2020-01-01' },
    { label: 'Project Budget Amount', value: 'ZAR 3.2 billion' },
    { label: 'Project Budget Currency', value: 'ZAR' },
    { label: 'Project Budget Approval Date', value: '2020-02-15' },
    { label: 'Environmental Impact Assessment', value: 'Completed, findings reported to relevant authorities' },
    { label: 'Land and Settlement Impact Assessment', value: 'Minimal impact, with compensation measures in place' },
    { label: 'Project Status', value: 'Active' }
  ];


  preparationFields = [
    { label: 'Project Scope (main output)', value: 'Construction of new waterfront facilities, including 2000 meters of public walkways and 30 retail outlets.' },
    { label: 'Environmental Impact', value: 'Potential impacts include changes to local wildlife habitats; mitigation measures include creating wildlife corridors and noise reduction during construction.' },
    { label: 'Land and Settlement Impact', value: '150 hectares of land acquired, impacting approximately 40 properties. Compensation measures and resettlement assistance have been provided.' },
    { label: 'Contact Details', value: 'Postal: P.O. Box 123, Cape Town, 8000; Email: projectinfo@capetown.gov.za' },
    { label: 'Funding Sources', value: 'Funded by the South African Government, World Bank, and private investors.' },
    { label: 'Project Budget', value: 'Total budget: ZAR 4.5 billion, including ZAR 2 billion for construction, ZAR 500 million for environmental mitigation, and ZAR 1 billion for public amenities.' },
    { label: 'Project Budget Approval Date', value: '2021-05-20' },
    { label: 'Project Approval Date', value: '2021-03-15' }
  ];


  implementationFields = [
    { label: 'Project Status', value: '75% complete' },
    { label: 'Project Progress', value: '75%' },
    { label: 'Completion Cost', value: 'ZAR 5 billion estimated' },
    { label: 'Completion Date', value: '2026-12-31' },
    { label: 'Scope at Completion', value: 'Final scope includes 2500 meters of waterfront development, including public spaces and commercial areas.' },
    { label: 'Reasons for Project Changes', value: 'Adjustments made to incorporate additional safety measures and environmental protections.' },
    { label: 'Reference to Audit and Evaluation Reports', value: 'Audit Report 2025, Evaluation Report 2026' },
    { label: 'Variation to Contract Price', value: 'Initial contract price was ZAR 4.5 billion, adjusted to ZAR 5 billion due to material cost increases.' },
    { label: 'Escalation of Contract Price', value: 'Contract price escalated by 10% due to unforeseen economic factors.' },
    { label: 'Variation to Contract Duration', value: 'Project duration extended by six months due to regulatory approvals.' },
    { label: 'Variation to Contract Scope', value: 'Scope expanded to include additional environmental mitigation measures.' }
  ];


  completionFields = [
    { label: 'Project Status', value: 'Completed' },
    { label: 'Completion Cost', value: 'ZAR 5.2 billion' },
    { label: 'Completion Date', value: '2026-12-31' },
    { label: 'Scope at Completion', value: 'The project concluded with the successful development of 2500 meters of waterfront, including parks, commercial spaces, and recreational facilities.' },
    { label: 'Reasons for Project Changes', value: 'Changes were primarily due to updated environmental regulations and additional requirements from stakeholders leading to enhancements in design and safety features.' },
    { label: 'Reference to Audit and Evaluation Reports', value: 'Audit Report 2026 Q4, Evaluation Report 2027 Q1' }
  ];


  tabs = [
    { id: 'identification', name: 'Identification', fields: this.identificationFields },
    { id: 'preparation', name: 'Preparation', fields: this.preparationFields },
    { id: 'implementation', name: 'Implementation', fields: this.implementationFields },
    { id: 'completion', name: 'Completion', fields: this.completionFields }
  ];


  constructor() {
    // Initialize all tabs as collapsed
    this.tabs.forEach(tab => {
      this.collapseStates[tab.id] = true;
    });
  }


  // Function to set the active tab
  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

  toggleAccordion(tabId: string): void {
    this.collapseStates[tabId] = !this.collapseStates[tabId];
  }
}
