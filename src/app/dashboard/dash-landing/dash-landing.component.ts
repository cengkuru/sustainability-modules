import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { catchError, forkJoin, of } from 'rxjs';

interface Project {
  _id: string;
  name: string;
  status: string;
  type: string;
  updatedAt: Date;
}

interface SystemMetrics {
  totalProjects: number;
  totalUsers: number;
  totalAuthorities: number;
  activeProjects: number;
  reviewProjects: number;
  completedProjects: number;
}

@Component({
  selector: 'app-dash-landing',
  templateUrl: './dash-landing.component.html',
  styleUrl: './dash-landing.component.scss'
})
export class DashLandingComponent implements OnInit {
  metrics: SystemMetrics = {
    totalProjects: 0,
    totalUsers: 0,
    totalAuthorities: 0,
    activeProjects: 0,
    reviewProjects: 0,
    completedProjects: 0
  };
  recentProjects: Project[] = [];
  isAdmin = false;

  private apiBaseUrl = environment.mongodb?.apiUrl || 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.fetchDashboardData();
  }

  private fetchDashboardData(): void {
    // Get public metrics first (works for all users)
    const publicMetricsRequest = this.http.get<Partial<SystemMetrics>>(`${this.apiBaseUrl}/system/public-metrics`)
      .pipe(catchError(error => {
        console.error('Error fetching public metrics:', error);
        return of({
          totalProjects: 0,
          activeProjects: 0,
          reviewProjects: 0,
          completedProjects: 0
        });
      }));

    const recentProjectsRequest = this.http.get<Project[]>(`${this.apiBaseUrl}/system/projects/recent`)
      .pipe(catchError(error => {
        console.error('Error fetching recent projects:', error);
        return of([]);
      }));

    // Combine requests for public data
    forkJoin({
      publicMetrics: publicMetricsRequest,
      recentProjects: recentProjectsRequest
    }).subscribe(results => {
      // Update metrics with public data
      if (results.publicMetrics) {
        this.metrics = {
          ...this.metrics,
          ...results.publicMetrics
        };
      }

      // Update recent projects
      this.recentProjects = results.recentProjects;

      // If user is admin, fetch additional admin-only metrics
      if (this.isAdmin) {
        this.fetchAdminMetrics();
      }
    });
  }

  private fetchAdminMetrics(): void {
    this.http.get<SystemMetrics>(`${this.apiBaseUrl}/system/metrics`)
      .pipe(catchError(error => {
        console.error('Error fetching admin metrics:', error);
        return of({
          totalUsers: 0,
          totalAuthorities: 0,
          totalProjects: this.metrics.totalProjects,
          activeProjects: this.metrics.activeProjects,
          reviewProjects: this.metrics.reviewProjects,
          completedProjects: this.metrics.completedProjects
        });
      }))
      .subscribe(adminMetrics => {
        this.metrics = {
          ...this.metrics,
          ...adminMetrics
        };
      });
  }

  navigateToNewUser(): void {
    this.router.navigate(['/admin/users/new']);
  }

  navigateToNewAuthority(): void {
    this.router.navigate(['/admin/authorities/new']);
  }
}
