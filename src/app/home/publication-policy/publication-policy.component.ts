import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { PolicyService } from "../../core/services/policy.service";
import { Policy, Section } from "../../core/models/polict.model";

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
    trigger('sidebarAnimation', [
      transition('closed => open', [
        style({ transform: 'translateX(-100%)' }),
        animate('300ms ease-in-out', style({ transform: 'translateX(0)' })),
      ]),
      transition('open => closed', [
        animate('300ms ease-in-out', style({ transform: 'translateX(-100%)' })),
      ]),
    ]),
  ],
})
export class PublicationPolicyComponent implements OnInit {
  sections: Section[] = [];
  activeSection: string = '';
  searchTerm: string = '';
  isSidebarOpen: boolean = false;
  isMobile: boolean = false;

  constructor(private policyService: PolicyService) {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    this.loadPolicy();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    if (!this.isMobile) {
      this.isSidebarOpen = true;
    }
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
    if (this.isMobile) {
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
