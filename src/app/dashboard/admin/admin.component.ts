import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserService, User, CreateUserDto } from '../../services/user.service';
import { AgencyService, Agency } from '../../services/agency.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-admin',
    imports: [
        CommonModule,
        FormsModule,
        RouterModule
    ],
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  // User management
  users: User[] = [];
  isLoading = true;
  error: string | null = null;
  showCreateUserModal = false;
  newUser: CreateUserDto = {
    email: '',
    password: '',
    name: '',
    roles: ['user'],
    agency: ''
  };
  
  // Agency management
  agencies: Agency[] = [];
  showCreateAgencyModal = false;
  showAgencySection = true;
  newAgency: Partial<Agency> = {
    name: '',
    code: '',
    description: '',
    status: 'active'
  };
  isLoadingAgencies = false;
  agencyError: string | null = null;
  
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private agencyService: AgencyService
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
    this.fetchAgencies();
  }

  fetchUsers(): void {
    this.isLoading = true;
    this.error = null;
    
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load users. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onRoleChange(userId: string, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const role = selectElement.value;
    const user = this.users.find(u => u._id === userId);
    if (user) {
      const newRoles = role === 'admin' ? ['admin'] : 
                       role === 'hod' ? ['hod'] : ['user'];
      this.updateUserRoles(userId, newRoles);
    }
  }

  onStatusChange(userId: string, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const status = selectElement.value as 'active' | 'inactive';
    this.updateUserStatus(userId, status);
  }

  updateUserRoles(userId: string, roles: string[]): void {
    this.userService.updateUser(userId, { roles }).subscribe({
      next: (updatedUser) => {
        this.users = this.users.map(user => 
          user._id === userId ? updatedUser : user
        );
      },
      error: (err) => {
        this.error = err.message || 'Failed to update user role. Please try again.';
        this.fetchUsers();
      }
    });
  }

  updateUserStatus(userId: string, status: 'active' | 'inactive'): void {
    this.userService.updateUser(userId, { status }).subscribe({
      next: (updatedUser) => {
        this.users = this.users.map(user => 
          user._id === userId ? updatedUser : user
        );
      },
      error: (err) => {
        this.error = err.message || 'Failed to update user status. Please try again.';
        this.fetchUsers();
      }
    });
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.users = this.users.filter(user => user._id !== userId);
        },
        error: (err) => {
          this.error = err.message || 'Failed to delete user. Please try again.';
        }
      });
    }
  }

  createUser(): void {
    if (!this.newUser.email || !this.newUser.password || !this.newUser.name) {
      this.error = 'Please fill in all required fields';
      return;
    }
    
    // For non-admin users, ensure agency is selected
    if (this.newUser.roles[0] !== 'admin' && !this.newUser.agency) {
      this.error = 'Please select an agency for non-admin users';
      return;
    }

    this.userService.createUser(this.newUser).subscribe({
      next: (user) => {
        this.users.push(user);
        this.showCreateUserModal = false;
        this.resetNewUserForm();
        this.error = null;
      },
      error: (err) => {
        this.error = err.message || 'Failed to create user. Please try again.';
      }
    });
  }

  resetNewUserForm(): void {
    this.newUser = {
      email: '',
      password: '',
      name: '',
      roles: ['user'],
      agency: ''
    };
  }

  getUserRole(user: User): string {
    if (user.roles.includes('admin')) return 'admin';
    if (user.roles.includes('hod')) return 'hod';
    return 'user';
  }

  // Agency management methods
  fetchAgencies(): void {
    this.isLoadingAgencies = true;
    this.agencyError = null;
    
    this.agencyService.getAgencies().subscribe({
      next: (agencies) => {
        this.agencies = agencies;
        this.isLoadingAgencies = false;
      },
      error: (err) => {
        this.agencyError = err.message || 'Failed to load agencies. Please try again.';
        this.isLoadingAgencies = false;
      }
    });
  }

  createAgency(): void {
    if (!this.newAgency.name || !this.newAgency.code) {
      this.agencyError = 'Agency name and code are required';
      return;
    }

    this.agencyService.createAgency(this.newAgency).subscribe({
      next: (agency) => {
        this.agencies.push(agency);
        this.showCreateAgencyModal = false;
        this.resetNewAgencyForm();
        this.agencyError = null;
      },
      error: (err) => {
        this.agencyError = err.message || 'Failed to create agency. Please try again.';
      }
    });
  }

  updateAgencyStatus(agencyId: string, status: 'active' | 'inactive'): void {
    this.agencyService.updateAgency(agencyId, { status }).subscribe({
      next: (updatedAgency) => {
        this.agencies = this.agencies.map(agency => 
          agency._id === agencyId ? updatedAgency : agency
        );
      },
      error: (err) => {
        this.agencyError = err.message || 'Failed to update agency status. Please try again.';
        this.fetchAgencies();
      }
    });
  }

  deleteAgency(agencyId: string): void {
    if (confirm('Are you sure you want to delete this agency? This action cannot be undone.')) {
      this.agencyService.deleteAgency(agencyId).subscribe({
        next: () => {
          this.agencies = this.agencies.filter(agency => agency._id !== agencyId);
        },
        error: (err) => {
          this.agencyError = err.message || 'Failed to delete agency. Please try again.';
        }
      });
    }
  }

  resetNewAgencyForm(): void {
    this.newAgency = {
      name: '',
      code: '',
      description: '',
      status: 'active'
    };
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }
} 