import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import {PolicyService} from "../../core/services/policy.service";
import {Policy, Section} from "../../core/models/polict.model";

@Component({
  selector: 'app-publication-policy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publication-policy.component.html',
  styleUrls: ['./publication-policy.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms', style({ opacity: 0 })),
      ]),
    ]),
    trigger('listAnimation', [
      transition('* <=> *', [
        query(':enter',
            [style({ opacity: 0, transform: 'translateY(50px)' }),
              stagger('50ms', animate('500ms ease', style({ opacity: 1, transform: 'translateY(0)' })))],
            { optional: true }
        ),
      ]),
    ]),
  ],
})
export class PublicationPolicyComponent implements OnInit {
  sections: Section[] = [];
  activeSection: string = '';
  searchTerm: string = '';
  isSidebarOpen: boolean = false;

  constructor(private policyService: PolicyService) { }

  ngOnInit(): void {
    this.loadPolicy();
  }

  loadPolicy(): void {
    this.policyService.getPolicy().subscribe(
        (policy: Policy) => {
          this.sections = policy.sections;
          if (this.sections.length > 0) {
            this.activeSection = this.sections[0].title;
          }
        },
        (error) => {
          console.error('Error fetching policy:', error);
          // Handle error (e.g., show error message to user)
        }
    );
  }

  setActiveSection(title: string): void {
    this.activeSection = title;
    if (window.innerWidth < 768) {
      this.isSidebarOpen = false;
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  get filteredSections(): Section[] {
    if (!this.searchTerm) return this.sections;
    return this.sections.filter(section =>
        section.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        section.content.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        section.subsections?.some((sub) =>
            sub.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            sub.content.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
    );
  }
}
