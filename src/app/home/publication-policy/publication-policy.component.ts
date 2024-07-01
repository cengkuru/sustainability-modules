import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-publication-policy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publication-policy.component.html',
  styleUrls: ['./publication-policy.component.scss']
})
export class PublicationPolicyComponent implements OnInit {
  sections = [
    {
      title: 'Purpose of Publication',
      content: 'The publication of OC4IDS data aligns with the Open Contracting principles of transparency and accountability in public infrastructure projects. By making this information accessible, we aim to foster trust, efficiency, and innovation in the procurement process.',
      subsections: [
        {
          title: 'Uses of the Data',
          content: 'The National Infrastructure Disclosure Platform data empowers various stakeholders: government agencies can improve project management and resource allocation; civil society organizations can monitor project progress and impacts; businesses can identify opportunities and enhance competitiveness; and citizens can engage in informed discussions about public infrastructure investments.'
        }
      ]
    },
    {
      title: 'Publication Details',
      content: 'We are committed to providing high-quality, timely, and comprehensive data in line with Open Contracting standards.',
      subsections: [
        {
          title: 'Creation of OC4IDS Datasets',
          content: 'Our data undergoes rigorous quality checks during the nightly refresh process. We ensure data completeness, accuracy, and compliance with the OC4IDS schema before publication.'
        },
        {
          title: 'OCID Generation',
          content: 'Our OCID system ensures unique identification of each project, facilitating data linking and tracking throughout the project lifecycle. This supports the Open Contracting principle of data accessibility and usability.'
        },
        {
          title: 'Accessing the Data',
          content: 'We provide multiple data access options to cater to different user needs and technical capabilities, adhering to the Open Contracting principle of making data open by default.'
        }
      ]
    },
    {
      title: 'Data Scope',
      content: 'Our publication scope is designed to provide a comprehensive view of public infrastructure projects, supporting informed decision-making and public oversight.',
      subsections: [
        {
          title: 'Exclusions and Omissions',
          content: 'While we strive for maximum transparency, certain projects are excluded to protect national security interests. We regularly review these exclusions to ensure they are justified and minimal.'
        },
        {
          title: 'Legal Concepts and OC4IDS Data',
          content: 'We have mapped our legal framework to OC4IDS fields, ensuring our data publication aligns with both national regulations and international open contracting standards.'
        }
      ]
    },
    {
      title: 'Responsibility and Contact',
      content: 'In line with Open Contracting principles of participation and collaboration, we welcome feedback and engagement from all stakeholders. The Department of Public Works and Infrastructure is committed to continually improving our data publication practices.',
    },
    {
      title: 'License',
      content: 'Our choice of the CC BY 4.0 license reflects our commitment to the Open Contracting principle of open data. This license ensures that our data can be freely used, modified, and shared by all, maximizing its potential impact.',
    },
    {
      title: 'Future Development Plans',
      content: 'We are dedicated to expanding and improving our OC4IDS publication. Our plans include increasing historical data coverage, enhancing data quality, and developing user-friendly tools for data analysis and visualization.',
    }
  ];

  activeSection: string = '';
  searchTerm: string = '';

  constructor() { }

  ngOnInit(): void {
    this.activeSection = this.sections[0].title;
  }

  setActiveSection(title: string): void {
    this.activeSection = title;
  }

  get filteredSections() {
    if (!this.searchTerm) return this.sections;
    return this.sections.filter(section =>
        section.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        section.content.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        section.subsections?.some(sub =>
            sub.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            sub.content.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
    );
  }
}
