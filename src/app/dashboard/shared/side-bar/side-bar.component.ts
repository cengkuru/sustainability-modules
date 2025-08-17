import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-side-bar',
    templateUrl: './side-bar.component.html',
    styleUrls: ['./side-bar.component.scss'],
    imports: [CommonModule, RouterLink, RouterLinkActive]
})
export class SideBarComponent implements OnInit {
  userName$!: Observable<string>;
  userEmail$!: Observable<string>;
  isAdmin$!: Observable<boolean>;
  showDropdown: boolean = false;
  showLogoutConfirm: boolean = false;
  isLoggingOut: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.userName$ = this.authService.currentUser$.pipe(
      map(user => user?.name || 'User')
    );

    this.userEmail$ = this.authService.currentUser$.pipe(
      map(user => user?.email || '')
    );

    this.isAdmin$ = this.authService.currentUser$.pipe(
      map(user => {
        // Check both roles array and legacy role field
        if (user?.roles && Array.isArray(user.roles)) {
          return user.roles.includes('admin');
        }
        return user?.role === 'admin';
      })
    );
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  logout(): void {
    this.showLogoutConfirm = true;
  }

  confirmLogout(): void {
    this.isLoggingOut = true;
    // Add slight delay for better UX
    setTimeout(() => {
      this.authService.logout();
      this.showLogoutConfirm = false;
      this.isLoggingOut = false;
    }, 500);
  }

  cancelLogout(): void {
    this.showLogoutConfirm = false;
  }

  getUserInitial(name: string | null): string {
    return name?.charAt(0).toUpperCase() || 'U';
  }
}
