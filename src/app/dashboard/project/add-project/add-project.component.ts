import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectService } from '../../../services/project.service';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-add-project',
    templateUrl: './add-project.component.html',
    styleUrls: ['./add-project.component.scss'],
    standalone: false
})
export class AddProjectComponent implements OnInit {
  projectForm!: FormGroup;
  pageTitle = 'Create New Project';
  isLoading = false;

  constructor(
      private fb: FormBuilder,
      private projectService: ProjectService,
      private authService: AuthService,
      private toastr: ToastrService,
      private router: Router
  ) {}

  ngOnInit(): void {
    this.projectForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      type: ['construction', Validators.required],
      sector: ['', Validators.required],
      budget: this.fb.group({
        amount: [0, [Validators.required, Validators.min(0)]],
        currency: ['USD', Validators.required]
      })
    });
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      this.toastr.error('Please fill in all required fields correctly.');
      return;
    }

    this.isLoading = true;
    const projectData = {
      ...this.projectForm.value,
      id: this.generateProjectId(),
      status: 'identification',
      publishStatus: 'draft'
    };

    this.projectService.createProject(projectData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.toastr.success('Project created successfully!');
          this.router.navigate(['/dashboard/project/projects']);
        } else {
          this.toastr.error(response.message || 'Failed to create project');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.toastr.error('Failed to create project: ' + (error.error?.message || error.message));
      }
    });
  }

  private generateProjectId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `PRJ-${timestamp}-${random}`;
  }

  cancel(): void {
    this.router.navigate(['/dashboard/project/projects']);
  }
}
