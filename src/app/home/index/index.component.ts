import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from "@angular/router";
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
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
        animate('300ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
    trigger('staggerList', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(10px)' }),
          stagger('60ms', animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })))
        ], { optional: true }),
      ])
    ]),
  ],
})
export class IndexComponent implements OnInit {
  pageTitle = 'The National Infrastructure Disclosure Platform';
  isProfileDropdownOpen = false;
  isMobileMenuOpen = false;
  isLoggedIn = false;
  isFooterExpanded = false;
  isHeaderVisible = true;
  lastScrollPosition = 0;

  currentYear = new Date().getFullYear();
  owner = 'CoST Infrastructure Transparency Initiative';
  appName = 'CoST Data Portal: Prototype';

  navLinks = [
    { path: 'home', label: 'Home', icon: 'bi bi-house' },
    { path: 'projects', label: 'Projects', icon: 'bi bi-file-text' },
    { path: 'data-analytics', label: 'Analysis', icon: 'bi bi-bar-chart' },
    { path: 'downloads', label: 'Downloads', icon: 'bi bi-download' },
    { path: 'feedback', label: 'Feedback', icon: 'bi bi-star' },
    { path: 'api-documentation', label: 'API Documentation', icon: 'bi bi-code-square' }
  ];

  footerLinks = [
    { path: 'publication-policy', label: 'Publication Policy', icon: 'bi bi-file-text' }
  ];

  creativeCommonsLicense = {
    name: 'Creative Commons Attribution 4.0 International License',
    icon: 'bi bi-file-text',
    link: 'https://creativecommons.org/licenses/by/4.0/'
  };

  constructor(public router: Router) {}

  ngOnInit() {
    if (this.router.url === '/public' || this.router.url === '/public/') {
      this.router.navigate(['/public/home']);
    }

    this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo(0, 0);
      this.closeMobileMenu();
    });
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const currentScrollPosition = window.pageYOffset;
    if (currentScrollPosition > this.lastScrollPosition && currentScrollPosition > 100) {
      this.isHeaderVisible = false;
    } else {
      this.isHeaderVisible = true;
    }
    this.lastScrollPosition = currentScrollPosition;
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

  expandFooter() {
    this.isFooterExpanded = !this.isFooterExpanded;
  }
}
