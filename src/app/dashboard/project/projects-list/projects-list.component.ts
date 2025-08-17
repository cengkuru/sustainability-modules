import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../../../services/project.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-projects-list',
    templateUrl: './projects-list.component.html',
    styleUrls: ['./projects-list.component.scss'],
    standalone: false
})
export class ProjectsListComponent implements OnInit {
    pageTitle = 'Projects';
    projects: any[] = [];
    isLoading = true;
    currentUserRole = '';

    constructor(
      private projectService: ProjectService,
      private authService: AuthService,
      private router: Router,
      private toastr: ToastrService
    ) {}

    ngOnInit(): void {
        this.getCurrentUserRole();
        this.loadProjects();
    }

    private getCurrentUserRole(): void {
        // Get user role from auth service if available
        const user = this.authService.getCurrentUser();
        if (user && user.roles && user.roles.length > 0) {
            this.currentUserRole = user.roles[0]; // Use first role
        }
    }

    loadProjects(): void {
        this.isLoading = true;
        this.projectService.getProjects().subscribe({
            next: (response) => {
                this.projects = response.map((project: any) => ({
                    ...project,
                    key: project._id || project.id,
                    title: project.title || project.name || 'Untitled',
                    publishStatus: project.publishStatus === 'published'
                }));
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error fetching projects', error);
                this.toastr.error('Failed to load projects');
                this.isLoading = false;
            }
        });
    }

    togglePublishStatus(project: any): void {
        if (this.currentUserRole !== 'admin') {
            this.toastr.error('Only administrators can publish/unpublish projects');
            return;
        }

        const action = project.publishStatus ? 'unpublish' : 'publish';
        const serviceCall = project.publishStatus 
            ? this.projectService.unpublishProject(project.key)
            : this.projectService.publishProject(project.key);

        this.isLoading = true;
        serviceCall.subscribe({
            next: (response) => {
                if (response.success) {
                    project.publishStatus = !project.publishStatus;
                    this.toastr.success(`Project ${project.publishStatus ? 'published' : 'unpublished'} successfully`);
                } else {
                    this.toastr.error(response.message || `Failed to ${action} project`);
                }
                this.isLoading = false;
            },
            error: (error) => {
                console.error(`Error ${action}ing project`, error);
                this.toastr.error(`Failed to ${action} project`);
                this.isLoading = false;
            }
        });
    }

    deleteProject(project: any): void {
        if (confirm(`Are you sure you want to delete "${project.title}"? This action cannot be undone.`)) {
            this.isLoading = true;
            this.projectService.deleteProject(project.key).subscribe({
                next: (response) => {
                    if (response.success) {
                        this.projects = this.projects.filter(p => p.key !== project.key);
                        this.toastr.success('Project deleted successfully');
                    } else {
                        this.toastr.error(response.message || 'Failed to delete project');
                    }
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error deleting project', error);
                    this.toastr.error('Failed to delete project');
                    this.isLoading = false;
                }
            });
        }
    }

    navigateToProjectEdit(projectId: string): void {
        this.router.navigate(['/dashboard/project/update', projectId]);
    }

    navigateToProjectCreate(): void {
        this.router.navigate(['/dashboard/project/add']);
    }

    canEdit(): boolean {
        return this.currentUserRole === 'admin' || this.currentUserRole === 'hod';
    }

    canPublish(): boolean {
        return this.currentUserRole === 'admin';
    }
}
