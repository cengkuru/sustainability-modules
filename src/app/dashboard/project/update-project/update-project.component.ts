import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from '../../../services/project.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-update-project',
    templateUrl: './update-project.component.html',
    styleUrls: ['./update-project.component.scss'],
    standalone: false
})
export class UpdateProjectComponent implements OnInit {
  projectId!: string;
  projectForm!: FormGroup;
  isLoading = true;
  isSaving = false;
  pageTitle = 'Update Project';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    
    // Initialize form with empty values
    this.initializeForm();
    
    // Load project data
    if (this.projectId) {
      this.loadProject();
    } else {
      this.toastr.error('No project ID provided');
      this.router.navigate(['/dashboard/project/projects']);
    }
  }

  private initializeForm(): void {
    this.projectForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      type: ['construction', Validators.required],
      sector: ['', Validators.required],
      status: ['identification', Validators.required],
      budget: this.fb.group({
        amount: [0, [Validators.required, Validators.min(0)]],
        currency: ['USD', Validators.required]
      })
    });
  }

  private loadProject(): void {
    this.isLoading = true;
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (response) => {
        if (response && response.data) {
          const project = response.data;
          this.projectForm.patchValue({
            title: project.title || project.name || '',
            description: project.description || '',
            type: project.type || 'construction',
            sector: project.sector || '',
            status: project.status || 'identification',
            budget: {
              amount: project.budget?.amount?.amount || project.budget?.amount || 0,
              currency: project.budget?.amount?.currency || project.budget?.currency || 'USD'
            }
          });
          this.pageTitle = `Update Project: ${project.title || project.name || 'Untitled'}`;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.toastr.error('Failed to load project');
        console.error('Error loading project:', error);
        this.router.navigate(['/dashboard/project/projects']);
      }
    });
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      this.toastr.error('Please fill in all required fields correctly.');
      return;
    }

    this.isSaving = true;
    const updates = this.projectForm.value;

    this.projectService.updateProject(this.projectId, updates).subscribe({
      next: (response) => {
        this.isSaving = false;
        if (response.success) {
          this.toastr.success('Project updated successfully!');
          this.router.navigate(['/dashboard/project/projects']);
        } else {
          this.toastr.error(response.message || 'Failed to update project');
        }
      },
      error: (error) => {
        this.isSaving = false;
        this.toastr.error('Failed to update project: ' + (error.error?.message || error.message));
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard/project/projects']);
  }
}