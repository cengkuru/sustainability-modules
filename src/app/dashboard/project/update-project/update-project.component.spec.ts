import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { UpdateProjectComponent } from './update-project.component';
import { ProjectService } from '../../../services/project.service';
import { AuthService } from '../../../services/auth.service';

describe('UpdateProjectComponent', () => {
  let component: UpdateProjectComponent;
  let fixture: ComponentFixture<UpdateProjectComponent>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockProject = {
    data: {
      _id: 'test-id-123',
      title: 'Existing Project',
      description: 'Existing project description',
      type: 'rehabilitation',
      sector: 'energy',
      status: 'preparation',
      budget: {
        amount: 500000,
        currency: 'EUR'
      }
    }
  };

  beforeEach(async () => {
    mockProjectService = jasmine.createSpyObj('ProjectService', ['getProjectById', 'updateProject']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('test-id-123')
        }
      }
    };

    await TestBed.configureTestingModule({
      declarations: [ UpdateProjectComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [
        { provide: ProjectService, useValue: mockProjectService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateProjectComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    mockProjectService.getProjectById.and.returnValue(of(mockProject));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should get project ID from route params', () => {
    mockProjectService.getProjectById.and.returnValue(of(mockProject));
    fixture.detectChanges();
    expect(component.projectId).toBe('test-id-123');
  });

  it('should redirect if no project ID is provided', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);
    fixture.detectChanges();
    
    expect(mockToastr.error).toHaveBeenCalledWith('No project ID provided');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard/project/projects']);
  });

  it('should load project data on init', () => {
    mockProjectService.getProjectById.and.returnValue(of(mockProject));
    fixture.detectChanges();

    expect(mockProjectService.getProjectById).toHaveBeenCalledWith('test-id-123');
    expect(component.projectForm.get('title')?.value).toBe('Existing Project');
    expect(component.projectForm.get('description')?.value).toBe('Existing project description');
    expect(component.projectForm.get('type')?.value).toBe('rehabilitation');
    expect(component.projectForm.get('sector')?.value).toBe('energy');
    expect(component.projectForm.get('status')?.value).toBe('preparation');
    expect(component.projectForm.get('budget.amount')?.value).toBe(500000);
    expect(component.projectForm.get('budget.currency')?.value).toBe('EUR');
  });

  it('should update page title with project name', () => {
    mockProjectService.getProjectById.and.returnValue(of(mockProject));
    fixture.detectChanges();

    expect(component.pageTitle).toBe('Update Project: Existing Project');
  });

  it('should handle project loading error', () => {
    mockProjectService.getProjectById.and.returnValue(throwError(() => new Error('Load error')));
    fixture.detectChanges();

    expect(mockToastr.error).toHaveBeenCalledWith('Failed to load project');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard/project/projects']);
    expect(component.isLoading).toBeFalsy();
  });

  it('should handle missing project data', () => {
    mockProjectService.getProjectById.and.returnValue(of({ data: null }));
    fixture.detectChanges();

    expect(component.isLoading).toBeFalsy();
  });

  it('should validate form fields', () => {
    mockProjectService.getProjectById.and.returnValue(of(mockProject));
    fixture.detectChanges();

    // Test title validation
    component.projectForm.get('title')?.setValue('ab');
    expect(component.projectForm.get('title')?.hasError('minlength')).toBeTruthy();

    component.projectForm.get('title')?.setValue('Valid Title');
    expect(component.projectForm.get('title')?.hasError('minlength')).toBeFalsy();

    // Test description validation
    component.projectForm.get('description')?.setValue('short');
    expect(component.projectForm.get('description')?.hasError('minlength')).toBeTruthy();

    component.projectForm.get('description')?.setValue('Valid description text');
    expect(component.projectForm.get('description')?.hasError('minlength')).toBeFalsy();
  });

  it('should show error when submitting invalid form', () => {
    mockProjectService.getProjectById.and.returnValue(of(mockProject));
    fixture.detectChanges();

    component.projectForm.patchValue({
      title: '',
      description: ''
    });

    component.onSubmit();

    expect(mockToastr.error).toHaveBeenCalledWith('Please fill in all required fields correctly.');
    expect(mockProjectService.updateProject).not.toHaveBeenCalled();
  });

  it('should call updateProject service with valid form', () => {
    mockProjectService.getProjectById.and.returnValue(of(mockProject));
    fixture.detectChanges();

    const updatedData = {
      title: 'Updated Project Title',
      description: 'Updated project description that is long enough',
      type: 'expansion',
      sector: 'water',
      status: 'implementation',
      budget: {
        amount: 750000,
        currency: 'USD'
      }
    };

    component.projectForm.patchValue(updatedData);
    mockProjectService.updateProject.and.returnValue(of({ success: true }));

    component.onSubmit();

    expect(mockProjectService.updateProject).toHaveBeenCalledWith('test-id-123', updatedData);
  });

  it('should handle successful update', () => {
    mockProjectService.getProjectById.and.returnValue(of(mockProject));
    fixture.detectChanges();

    component.projectForm.patchValue({
      title: 'Updated Project',
      description: 'Updated description text'
    });

    mockProjectService.updateProject.and.returnValue(of({ success: true }));

    component.onSubmit();

    expect(mockToastr.success).toHaveBeenCalledWith('Project updated successfully!');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard/project/projects']);
    expect(component.isSaving).toBeFalsy();
  });

  it('should handle update service error response', () => {
    mockProjectService.getProjectById.and.returnValue(of(mockProject));
    fixture.detectChanges();

    component.projectForm.patchValue({
      title: 'Updated Project',
      description: 'Updated description text'
    });

    mockProjectService.updateProject.and.returnValue(of({ success: false, message: 'Update failed' }));

    component.onSubmit();

    expect(mockToastr.error).toHaveBeenCalledWith('Update failed');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(component.isSaving).toBeFalsy();
  });

  it('should handle update network error', () => {
    mockProjectService.getProjectById.and.returnValue(of(mockProject));
    fixture.detectChanges();

    component.projectForm.patchValue({
      title: 'Updated Project',
      description: 'Updated description text'
    });

    const errorResponse = { error: { message: 'Network error' } };
    mockProjectService.updateProject.and.returnValue(throwError(() => errorResponse));

    component.onSubmit();

    expect(mockToastr.error).toHaveBeenCalledWith('Failed to update project: Network error');
    expect(component.isSaving).toBeFalsy();
  });

  it('should set loading states correctly', () => {
    mockProjectService.getProjectById.and.returnValue(of(mockProject));
    
    expect(component.isLoading).toBeTruthy();
    fixture.detectChanges();
    expect(component.isLoading).toBeFalsy();

    component.projectForm.patchValue({
      title: 'Updated Project',
      description: 'Updated description text'
    });
    mockProjectService.updateProject.and.returnValue(of({ success: true }));

    component.onSubmit();
    expect(component.isSaving).toBeFalsy(); // After completion
  });

  it('should navigate to projects list on cancel', () => {
    mockProjectService.getProjectById.and.returnValue(of(mockProject));
    fixture.detectChanges();

    component.cancel();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard/project/projects']);
  });

  it('should handle project with alternative field names', () => {
    const altProject = {
      data: {
        _id: 'test-id',
        name: 'Project Name', // using 'name' instead of 'title'
        description: 'Description',
        type: 'construction',
        sector: 'transport',
        status: 'identification',
        budget: {
          amount: 100000, // nested amount without additional nesting
          currency: 'USD'
        }
      }
    };

    mockProjectService.getProjectById.and.returnValue(of(altProject));
    fixture.detectChanges();

    expect(component.projectForm.get('title')?.value).toBe('Project Name');
    expect(component.projectForm.get('budget.amount')?.value).toBe(100000);
    expect(component.pageTitle).toBe('Update Project: Project Name');
  });

  it('should handle project with missing optional fields', () => {
    const minimalProject = {
      data: {
        _id: 'test-id',
        title: 'Minimal Project'
      }
    };

    mockProjectService.getProjectById.and.returnValue(of(minimalProject));
    fixture.detectChanges();

    expect(component.projectForm.get('title')?.value).toBe('Minimal Project');
    expect(component.projectForm.get('description')?.value).toBe('');
    expect(component.projectForm.get('type')?.value).toBe('construction');
    expect(component.projectForm.get('sector')?.value).toBe('');
    expect(component.projectForm.get('status')?.value).toBe('identification');
    expect(component.projectForm.get('budget.amount')?.value).toBe(0);
    expect(component.projectForm.get('budget.currency')?.value).toBe('USD');
  });
});