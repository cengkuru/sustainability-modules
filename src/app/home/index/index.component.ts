import { Component } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
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
  ],
})
export class IndexComponent {
  pageTitle = 'The National Infrastructure Disclosure Platform';
  isProfileDropdownOpen = false;
  isMobileMenuOpen = false;
  isLoggedIn = false;
  isFooterExpanded = false;

  currentYear = new Date().getFullYear();
  owner = 'CoST Infrastructure Transparency Initiative';
  appName = 'CoST Data Portal: Prototype';

  navLinks = [
    { path: 'home', label: 'Home', icon: 'bi-house-fill' },
    { path: 'projects', label: 'Projects', icon: 'bi-kanban-fill' },
    { path: 'data-analytics', label: 'Analysis', icon: 'bi-graph-up-arrow' },
    { path: 'downloads', label: 'Downloads', icon: 'bi-cloud-download-fill' },
    { path: 'feedback', label: 'Feedback', icon: 'bi-chat-left-text-fill' },
  ];

  footerLinks = [
    { path: 'publication-policy', label: 'Publication Policy', icon: 'bi-file-text' }
  ];

  constructor(public router: Router) { }

  toggleProfileDropdown() {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  login() {
    this.router.navigate(['/public/login']);
  }

  toggleFooter() {
    this.isFooterExpanded = !this.isFooterExpanded;
  }
}
