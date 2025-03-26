import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from "@angular/router";
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { filter } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslateModule
  ],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0 })),
      ]),
    ]),
    trigger('staggerList', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(10px)' }),
          stagger('50ms', animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' })))
        ], { optional: true }),
      ])
    ]),
  ],
})
export class IndexComponent implements OnInit {
  currentLang: string;
  isLanguageDropdownOpen = false;
  pageTitle = 'The National Infrastructure Disclosure Platform';
  isProfileDropdownOpen = false;
  isMobileMenuOpen = false;
  isLoggedIn = false;
  isFooterExpanded = false;
  isHeaderVisible = true;
  lastScrollPosition = 0;

  // Design system values from style guide
  colors = {
    background: 'var(--neutral-50)',
    text: {
      primary: 'var(--neutral-700)',
      secondary: 'var(--neutral-500)'
    },
    border: 'var(--neutral-200)',
    accent: 'var(--accent-color-base)'
  };

  // Typography tokens based on style guide
  typography = {
    heading: 'text-2xl font-light text-neutral-700 tracking-tight',
    subheading: 'text-lg font-light text-neutral-700',
    body: 'text-base font-light text-neutral-700',
    caption: 'text-sm font-light text-neutral-500'
  };

  // Update language options with icons
  languageOptions = [
    { code: 'en', label: 'English', icon: 'bi bi-globe2' },
    { code: 'es', label: 'Español', icon: 'bi bi-globe' }
  ];

  // Close dropdown when clicking outside
  @HostListener('document:click')
  onDocumentClick() {
    if (this.isLanguageDropdownOpen) {
      this.isLanguageDropdownOpen = false;
    }
  }

  currentYear = new Date().getFullYear();
  owner = 'CoST Infrastructure Transparency Initiative';
  appName = 'CoST Data Portal: Prototype';

  navLinks = [
    { path: 'home', label: 'NAV.HOME', icon: 'bi bi-house' },
    { path: 'projects', label: 'NAV.PROJECTS', icon: 'bi bi-file-text' },
    { path: 'data-analytics', label: 'NAV.ANALYTICS', icon: 'bi bi-bar-chart' },
    { path: 'downloads', label: 'NAV.DOWNLOADS', icon: 'bi bi-download' },
    { path: 'feedback', label: 'NAV.FEEDBACK', icon: 'bi bi-star' },
    { path: 'api-documentation', label: 'NAV.API_DOCUMENTATION', icon: 'bi bi-code-square' }
  ];

  footerLinks = [
    { path: 'publication-policy', label: 'FOOTER.PUBLICATION_POLICY', icon: 'bi bi-file-text' }
  ];

  creativeCommonsLicense = {
    name: 'FOOTER.CC_LICENSE',
    icon: 'bi bi-file-text',
    link: 'https://creativecommons.org/licenses/by/4.0/'
  };

  constructor(
    public router: Router,
    private translateService: TranslateService
  ) {
    this.currentLang = this.translateService.currentLang;
  }

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

    // Subscribe to language changes
    this.translateService.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
    });
  }

  // Improved toggle with stopPropagation
  toggleLanguageDropdown(event: Event) {
    event.stopPropagation();
    this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
  }

  // Updated change language method
  changeLanguage(lang: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.translateService.use(lang);
    this.currentLang = lang;
    this.isLanguageDropdownOpen = false;
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

  // Add trackBy function
  trackByLangCode(index: number, lang: { code: string }): string {
    return lang.code;
  }
}