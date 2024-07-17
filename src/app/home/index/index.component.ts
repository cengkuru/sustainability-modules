import { Component, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from "@angular/router";
import { trigger, transition, style, animate } from '@angular/animations';
import { filter } from 'rxjs/operators';

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
export class IndexComponent implements OnInit {
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

  creativeCommonsLicense = {
    name: 'Creative Commons Attribution 4.0 International License',
    icon: 'bi-creative-commons',
    link: 'https://creativecommons.org/licenses/by/4.0/'
  };

  constructor(public router: Router) {}

  ngOnInit() {
    // Navigate to the default route if the current route is empty
    if (this.router.url === '/public' || this.router.url === '/public/') {
      this.router.navigate(['/public/home']);
    }

    // Subscribe to router events to handle navigation
    this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Perform any necessary actions after navigation, such as scrolling to top
      window.scrollTo(0, 0);
    });
  }

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
}
