import { Component } from '@angular/core';
import { CommonModule } from "@angular/common";
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";

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
  styleUrls: ['./index.component.scss']
})
export class IndexComponent {
  pageTitle = 'The National Infrastructure Disclosure Platform';
  isProfileDropdownOpen = false;
  isMobileMenuOpen = false;
  isLoggedIn = false; // Simulating the login status. You should replace this with actual authentication status.

  currentYear = new Date().getFullYear();
  owner = 'CoST Infrastructure Transparency Initiative';
  appName = 'CoST Data Portal: Prototype';

  navLinks = [
    { path: 'home', label: 'Home', icon: 'bi-house-fill' },
    { path: 'projects', label: 'Projects', icon: 'bi-kanban-fill' },
    { path: 'data-analytics', label: 'Analysis', icon: 'bi-graph-up-arrow' },
    { path: 'feedback', label: 'Feedback', icon: 'bi-chat-left-text-fill' },
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
    // Redirect to the login page
    this.router.navigate(['/public/login']);
  }
}
