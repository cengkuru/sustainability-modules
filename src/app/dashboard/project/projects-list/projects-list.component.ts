import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-projects-list',
    templateUrl: './projects-list.component.html',
    styleUrls: ['./projects-list.component.scss']
})
export class ProjectsListComponent implements OnInit {
    pageTitle = 'Projects List';
    projects: any[] = [];  // Array to hold the projects
    isLoading = false;  // Added to track loading state

    constructor(private db: AngularFireDatabase, private toastr: ToastrService) {}

    ngOnInit(): void {
        this.isLoading = true;  // Set loading to true when data fetch begins
        this.db.list('/projects').snapshotChanges().pipe(
            map(changes =>
                changes.map(c => {
                    const data = c.payload.val();
                    return { key: c.payload.key, ...(data instanceof Object ? data : {}) };
                })
            )
        ).subscribe(data => {
            this.projects = data;
            this.isLoading = false;  // Set loading to false when data fetch is complete
        }, error => {
            this.isLoading = false;  // Ensure loading is set to false on error
            this.toastr.error('Failed to load projects: ' + error.message);
        });
    }

    togglePublishStatus(project: any): void {
        this.isLoading = true;  // Set loading to true when updating status
        const path = `/projects/${project.key}`;
        const status = !project.publishStatus;
        this.db.object(path).update({ publishStatus: status })
            .then(() => {
                this.toastr.success('Publish status updated!');
                this.isLoading = false;  // Set loading to false when update is complete
            })
            .catch(err => {
                this.toastr.error('Error updating status: ' + err.message);
                this.isLoading = false;  // Ensure loading is set to false on error
            });
    }


    deleteProject(projectKey: string) {
        if (confirm('Are you sure you want to delete this project?')) {
            this.db.object(`/projects/${projectKey}`).remove()
                .then(() => {
                    this.toastr.success('Project deleted successfully!');
                })
                .catch(error => {
                    this.toastr.error('Error deleting project: ' + error.message);
                });
        }
    }


}
