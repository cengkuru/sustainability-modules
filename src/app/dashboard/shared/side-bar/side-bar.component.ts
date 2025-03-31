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
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive]
})
export class SideBarComponent implements OnInit {
  userName$!: Observable<string>;
  userEmail$!: Observable<string>;
  isAdmin$!: Observable<boolean>;
  showDropdown: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.userName$ = this.authService.currentUser$.pipe(
      map(user => user?.name || 'User')
    );

    this.userEmail$ = this.authService.currentUser$.pipe(
      map(user => user?.email || '')
    );

    this.isAdmin$ = this.authService.currentUser$.pipe(
      map(user => user?.role === 'admin')
    );
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  logout(): void {
    this.authService.logout();
  }

  getUserInitial(name: string | null): string {
    return name?.charAt(0).toUpperCase() || 'U';
  }
}
