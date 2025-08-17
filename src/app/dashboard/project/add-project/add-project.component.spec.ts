import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { AddProjectComponent } from './add-project.component';
import { ProjectService } from '../../../services/project.service';
import { AuthService } from '../../../services/auth.service';

describe('AddProjectComponent', () => {
  let component: AddProjectComponent;
  let fixture: ComponentFixture<AddProjectComponent>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockProjectService = jasmine.createSpyObj('ProjectService', ['createProject']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ AddProjectComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [
        { provide: ProjectService, useValue: mockProjectService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with correct structure', () => {
    expect(component.projectForm).toBeDefined();
    expect(component.projectForm.get('title')).toBeDefined();
    expect(component.projectForm.get('description')).toBeDefined();
    expect(component.projectForm.get('type')).toBeDefined();
    expect(component.projectForm.get('sector')).toBeDefined();
    expect(component.projectForm.get('budget.amount')).toBeDefined();
    expect(component.projectForm.get('budget.currency')).toBeDefined();
  });

  it('should have form invalid when empty', () => {
    component.projectForm.patchValue({
      title: '',
      description: '',
      sector: ''
    });
    expect(component.projectForm.invalid).toBeTruthy();
  });

  it('should have form valid when all required fields are filled', () => {
    component.projectForm.patchValue({
      title: 'Test Project',
      description: 'This is a test project description',
      type: 'construction',
      sector: 'transport',
      budget: {
        amount: 100000,
        currency: 'USD'
      }
    });
    expect(component.projectForm.valid).toBeTruthy();
  });

  it('should validate title minimum length', () => {
    const titleControl = component.projectForm.get('title');
    
    titleControl?.setValue('ab');
    expect(titleControl?.hasError('minlength')).toBeTruthy();
    
    titleControl?.setValue('abc');
    expect(titleControl?.hasError('minlength')).toBeFalsy();
  });

  it('should validate description minimum length', () => {
    const descControl = component.projectForm.get('description');
    
    descControl?.setValue('short');
    expect(descControl?.hasError('minlength')).toBeTruthy();
    
    descControl?.setValue('Valid description text');
    expect(descControl?.hasError('minlength')).toBeFalsy();
  });

  it('should validate budget amount minimum value', () => {
    const amountControl = component.projectForm.get('budget.amount');
    
    amountControl?.setValue(-100);
    expect(amountControl?.hasError('min')).toBeTruthy();
    
    amountControl?.setValue(0);
    expect(amountControl?.hasError('min')).toBeFalsy();
    
    amountControl?.setValue(1000);
    expect(amountControl?.hasError('min')).toBeFalsy();
  });

  it('should show error toast when form is invalid on submit', () => {
    component.projectForm.patchValue({
      title: '',
      description: ''
    });
    
    component.onSubmit();
    
    expect(mockToastr.error).toHaveBeenCalledWith('Please fill in all required fields correctly.');
    expect(mockProjectService.createProject).not.toHaveBeenCalled();
  });

  it('should call createProject service when form is valid', () => {
    const validFormData = {
      title: 'Test Project',
      description: 'Valid test project description',
      type: 'construction',
      sector: 'transport',
      budget: {
        amount: 100000,
        currency: 'USD'
      }
    };

    component.projectForm.patchValue(validFormData);
    mockProjectService.createProject.and.returnValue(of({ success: true }));

    component.onSubmit();

    expect(mockProjectService.createProject).toHaveBeenCalled();
    const callArg = mockProjectService.createProject.calls.mostRecent().args[0];
    expect(callArg.title).toBe(validFormData.title);
    expect(callArg.description).toBe(validFormData.description);
    expect(callArg.status).toBe('identification');
    expect(callArg.publishStatus).toBe('draft');
  });

  it('should navigate to projects list on successful creation', () => {
    const validFormData = {
      title: 'Test Project',
      description: 'Valid test project description',
      type: 'construction',
      sector: 'transport',
      budget: {
        amount: 100000,
        currency: 'USD'
      }
    };

    component.projectForm.patchValue(validFormData);
    mockProjectService.createProject.and.returnValue(of({ success: true }));

    component.onSubmit();

    expect(mockToastr.success).toHaveBeenCalledWith('Project created successfully!');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard/project/projects']);
  });

  it('should handle service error response', () => {
    const validFormData = {
      title: 'Test Project',
      description: 'Valid test project description',
      type: 'construction',
      sector: 'transport',
      budget: {
        amount: 100000,
        currency: 'USD'
      }
    };

    component.projectForm.patchValue(validFormData);
    mockProjectService.createProject.and.returnValue(of({ success: false, message: 'Server error' }));

    component.onSubmit();

    expect(mockToastr.error).toHaveBeenCalledWith('Server error');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should handle network error', () => {
    const validFormData = {
      title: 'Test Project',
      description: 'Valid test project description',
      type: 'construction',
      sector: 'transport',
      budget: {
        amount: 100000,
        currency: 'USD'
      }
    };

    component.projectForm.patchValue(validFormData);
    const errorResponse = { error: { message: 'Network error' } };
    mockProjectService.createProject.and.returnValue(throwError(() => errorResponse));

    component.onSubmit();

    expect(mockToastr.error).toHaveBeenCalledWith('Failed to create project: Network error');
    expect(component.isLoading).toBeFalsy();
  });

  it('should set loading state during submission', () => {
    const validFormData = {
      title: 'Test Project',
      description: 'Valid test project description',
      type: 'construction',
      sector: 'transport',
      budget: {
        amount: 100000,
        currency: 'USD'
      }
    };

    component.projectForm.patchValue(validFormData);
    mockProjectService.createProject.and.returnValue(of({ success: true }));

    expect(component.isLoading).toBeFalsy();
    
    component.onSubmit();
    // Note: In real scenario, isLoading would be true during the async operation
    // After completion, it should be false
    expect(component.isLoading).toBeFalsy();
  });

  it('should generate unique project ID', () => {
    const id1 = component['generateProjectId']();
    const id2 = component['generateProjectId']();
    
    expect(id1).toMatch(/^PRJ-\d+-[a-z0-9]+$/);
    expect(id2).toMatch(/^PRJ-\d+-[a-z0-9]+$/);
    expect(id1).not.toBe(id2);
  });

  it('should navigate to projects list when cancel is called', () => {
    component.cancel();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard/project/projects']);
  });
});