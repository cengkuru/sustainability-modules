import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface UserWithDetails extends User {
  lastLogin?: Date;
  status: 'active' | 'inactive' | 'suspended';
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  users: UserWithDetails[] = [];
  isLoading = true;
  error: string | null = null;
  private apiBaseUrl = environment.mongodb?.apiUrl || 'http://localhost:3000/api';
  
  constructor(
    private http: HttpClient, 
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.isLoading = true;
    this.error = null;
    
    this.http.get<UserWithDetails[]>(`${this.apiBaseUrl}/admin/users`)
      .subscribe({
        next: (users) => {
          this.users = users;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Failed to load users. Please try again.';
          this.isLoading = false;
        }
      });
  }

  onRoleChange(userId: string, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const role = selectElement.value as 'user' | 'admin';
    this.updateUserRole(userId, role);
  }

  onStatusChange(userId: string, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const status = selectElement.value as 'active' | 'inactive' | 'suspended';
    this.updateUserStatus(userId, status);
  }

  updateUserRole(userId: string, role: 'user' | 'admin'): void {
    this.http.patch(`${this.apiBaseUrl}/admin/users/${userId}/role`, { role })
      .subscribe({
        next: () => {
          this.users = this.users.map(user => {
            if (user._id === userId) {
              return { ...user, role };
            }
            return user;
          });
        },
        error: (err) => {
          this.error = 'Failed to update user role. Please try again.';
        }
      });
  }

  updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended'): void {
    this.http.patch(`${this.apiBaseUrl}/admin/users/${userId}/status`, { status })
      .subscribe({
        next: () => {
          this.users = this.users.map(user => {
            if (user._id === userId) {
              return { ...user, status };
            }
            return user;
          });
        },
        error: (err) => {
          this.error = 'Failed to update user status. Please try again.';
        }
      });
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.http.delete(`${this.apiBaseUrl}/admin/users/${userId}`)
        .subscribe({
          next: () => {
            this.users = this.users.filter(user => user._id !== userId);
          },
          error: (err) => {
            this.error = 'Failed to delete user. Please try again.';
          }
        });
    }
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }
} 