import { Component } from '@angular/core';
import { CommonModule } from "@angular/common";
import {Router, RouterLink, RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
  ],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent {
  isProfileDropdownOpen = false;
  isMobileMenuOpen = false;
  isLoggedIn = false; // Simulating the login status. You should replace this with actual authentication status.

  currentYear = new Date().getFullYear();
  owner = 'CoST Infrastructure Transparency Initiative';
  appName = 'CoST Data Portal: Prototype';

  constructor(private router: Router) { }

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
