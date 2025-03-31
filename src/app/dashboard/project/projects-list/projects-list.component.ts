import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MongoProjectsListService } from '../../../services/mongodb/mongo-projects-list.service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-projects-list',
    templateUrl: './projects-list.component.html',
    styleUrls: ['./projects-list.component.scss']
})
export class ProjectsListComponent implements OnInit {
    pageTitle = 'Projects List';
    projects: any[] = [];  // Array to hold the projects
    isLoading = true;  // Added to track loading state

    constructor(
      private mongoProjectsService: MongoProjectsListService,
      private router: Router,
      private toastr: ToastrService
    ) {}

    ngOnInit(): void {
        this.loadProjects();
    }

    loadProjects(): void {
        this.isLoading = true;  // Set loading to true when data fetch begins
        this.mongoProjectsService.getProjects().subscribe({
            next: (projects) => {
                this.projects = projects;
                this.isLoading = false;  // Set loading to false when data fetch is complete
            },
            error: (error) => {
                console.error('Error fetching projects', error);
                this.toastr.error('Failed to load projects. Please try again later.');
                this.isLoading = false;  // Ensure loading is set to false on error
            }
        });
    }

    togglePublishStatus(project: any): void {
        this.isLoading = true;  // Set loading to true when updating status
        this.mongoProjectsService.togglePublishStatus(project.key, project.publishStatus)
            .subscribe({
                next: (response) => {
                    project.publishStatus = !project.publishStatus;
                    this.toastr.success(`Project ${project.publishStatus ? 'published' : 'unpublished'} successfully`);
                    this.isLoading = false;  // Set loading to false when update is complete
                },
                error: (error) => {
                    console.error('Error toggling publish status', error);
                    this.toastr.error('Failed to update publish status');
                    this.isLoading = false;  // Ensure loading is set to false on error
                }
            });
    }

    deleteProject(project: any): void {
        if (confirm(`Are you sure you want to delete "${project.title}"?`)) {
            this.mongoProjectsService.deleteProject(project.key)
                .subscribe({
                    next: () => {
                        // Remove the project from the local array
                        this.projects = this.projects.filter(p => p.key !== project.key);
                        this.toastr.success('Project deleted successfully');
                    },
                    error: (error) => {
                        console.error('Error deleting project', error);
                        this.toastr.error('Failed to delete project');
                    }
                });
        }
    }

    navigateToProjectEdit(projectId: string): void {
        this.router.navigate(['/dashboard/project/edit', projectId]);
    }

    navigateToProjectCreate(): void {
        this.router.navigate(['/dashboard/project/create']);
    }
}
