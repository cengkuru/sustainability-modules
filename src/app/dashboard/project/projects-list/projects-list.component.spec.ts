import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { ProjectsListComponent } from './projects-list.component';
import { ProjectService } from '../../../services/project.service';
import { AuthService } from '../../../services/auth.service';

describe('ProjectsListComponent', () => {
  let component: ProjectsListComponent;
  let fixture: ComponentFixture<ProjectsListComponent>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockProjects = [
    {
      _id: 'proj-1',
      id: 'proj-1',
      title: 'Project One',
      description: 'Description for project one',
      type: 'construction',
      sector: 'transport',
      status: 'identification',
      publishStatus: 'draft',
      budget: { amount: 100000, currency: 'USD' }
    },
    {
      _id: 'proj-2',
      id: 'proj-2',
      name: 'Project Two', // using 'name' instead of 'title'
      description: 'Description for project two',
      type: 'rehabilitation',
      sector: 'energy',
      status: 'implementation',
      publishStatus: 'published',
      budget: { amount: 500000, currency: 'EUR' }
    }
  ];

  beforeEach(async () => {
    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'getProjects', 
      'deleteProject', 
      'publishProject', 
      'unpublishProject'
    ]);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ ProjectsListComponent ],
      providers: [
        { provide: ProjectService, useValue: mockProjectService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    mockAuthService.getCurrentUser.and.returnValue(null);
    mockProjectService.getProjects.and.returnValue(of([]));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load projects on init', () => {
    mockAuthService.getCurrentUser.and.returnValue({ roles: ['admin'] });
    mockProjectService.getProjects.and.returnValue(of(mockProjects));
    
    fixture.detectChanges();
    
    expect(mockProjectService.getProjects).toHaveBeenCalled();
    expect(component.projects.length).toBe(2);
    expect(component.projects[0].title).toBe('Project One');
    expect(component.projects[1].title).toBe('Project Two'); // Should use 'name' field
    expect(component.isLoading).toBeFalsy();
  });

  it('should map project fields correctly', () => {
    mockAuthService.getCurrentUser.and.returnValue({ roles: ['admin'] });
    mockProjectService.getProjects.and.returnValue(of(mockProjects));
    
    fixture.detectChanges();
    
    // Check first project
    expect(component.projects[0].key).toBe('proj-1');
    expect(component.projects[0].publishStatus).toBeFalsy(); // 'draft' maps to false
    
    // Check second project (uses 'name' field)
    expect(component.projects[1].key).toBe('proj-2');
    expect(component.projects[1].title).toBe('Project Two');
    expect(component.projects[1].publishStatus).toBeTruthy(); // 'published' maps to true
  });

  it('should handle empty projects list', () => {
    mockAuthService.getCurrentUser.and.returnValue({ roles: ['user'] });
    mockProjectService.getProjects.and.returnValue(of([]));
    
    fixture.detectChanges();
    
    expect(component.projects.length).toBe(0);
    expect(component.isLoading).toBeFalsy();
  });

  it('should handle project loading error', () => {
    mockAuthService.getCurrentUser.and.returnValue({ roles: ['admin'] });
    mockProjectService.getProjects.and.returnValue(throwError(() => new Error('Load error')));
    
    fixture.detectChanges();
    
    expect(mockToastr.error).toHaveBeenCalledWith('Failed to load projects');
    expect(component.projects.length).toBe(0);
    expect(component.isLoading).toBeFalsy();
  });

  it('should get current user role on init', () => {
    const mockUser = { roles: ['hod'], email: 'test@example.com' };
    mockAuthService.getCurrentUser.and.returnValue(mockUser);
    mockProjectService.getProjects.and.returnValue(of([]));
    
    fixture.detectChanges();
    
    expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
    expect(component.currentUserRole).toBe('hod');
  });

  it('should handle user with no roles', () => {
    mockAuthService.getCurrentUser.and.returnValue({ email: 'test@example.com' });
    mockProjectService.getProjects.and.returnValue(of([]));
    
    fixture.detectChanges();
    
    expect(component.currentUserRole).toBe('');
  });

  it('should delete project after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    mockAuthService.getCurrentUser.and.returnValue({ roles: ['admin'] });
    mockProjectService.getProjects.and.returnValue(of(mockProjects));
    mockProjectService.deleteProject.and.returnValue(of({ success: true }));
    
    fixture.detectChanges();
    
    component.deleteProject(component.projects[0]);
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete "Project One"? This action cannot be undone.');
    expect(mockProjectService.deleteProject).toHaveBeenCalledWith('proj-1');
    expect(component.projects.length).toBe(1);
    expect(mockToastr.success).toHaveBeenCalledWith('Project deleted successfully');
  });

  it('should not delete project when cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    mockAuthService.getCurrentUser.and.returnValue({ roles: ['admin'] });
    mockProjectService.getProjects.and.returnValue(of(mockProjects));
    
    fixture.detectChanges();
    
    component.deleteProject(component.projects[0]);
    
    expect(mockProjectService.deleteProject).not.toHaveBeenCalled();
    expect(component.projects.length).toBe(2);
  });

  it('should handle delete error', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    mockAuthService.getCurrentUser.and.returnValue({ roles: ['admin'] });
    mockProjectService.getProjects.and.returnValue(of(mockProjects));
    mockProjectService.deleteProject.and.returnValue(throwError(() => new Error('Delete error')));
    
    fixture.detectChanges();
    
    component.deleteProject(component.projects[0]);
    
    expect(mockToastr.error).toHaveBeenCalledWith('Failed to delete project');
    expect(component.projects.length).toBe(2); // Project not removed on error
  });

  it('should publish unpublished project (admin only)', () => {
    mockAuthService.getCurrentUser.and.returnValue({ roles: ['admin'] });
    mockProjectService.getProjects.and.returnValue(of(mockProjects));
    mockProjectService.publishProject.and.returnValue(of({ success: true }));
    
    fixture.detectChanges();
    
    const unpublishedProject = component.projects[0];
    expect(unpublishedProject.publishStatus).toBeFalsy();
    
    component.togglePublishStatus(unpublishedProject);
    
    expect(mockProjectService.publishProject).toHaveBeenCalledWith('proj-1');
    expect(unpublishedProject.publishStatus).toBeTruthy();
    expect(mockToastr.success).toHaveBeenCalledWith('Project published successfully');
  });

  it('should unpublish published project (admin only)', () => {
    mockAuthService.getCurrentUser.and.returnValue({ roles: ['admin'] });
    mockProjectService.getProjects.and.returnValue(of(mockProjects));
    mockProjectService.unpublishProject.and.returnValue(of({ success: true }));
    
    fixture.detectChanges();
    
    const publishedProject = component.projects[1];
    expect(publishedProject.publishStatus).toBeTruthy();
    
    component.togglePublishStatus(publishedProject);
    
    expect(mockProjectService.unpublishProject).toHaveBeenCalledWith('proj-2');
    expect(publishedProject.publishStatus).toBeFalsy();
    expect(mockToastr.success).toHaveBeenCalledWith('Project unpublished successfully');
  });

  it('should prevent non-admin from publishing', () => {
    mockAuthService.getCurrentUser.and.returnValue({ roles: ['hod'] });
    mockProjectService.getProjects.and.returnValue(of(mockProjects));
    
    fixture.detectChanges();
    component.currentUserRole = 'hod';
    
    component.togglePublishStatus(component.projects[0]);
    
    expect(mockToastr.error).toHaveBeenCalledWith('Only administrators can publish/unpublish projects');
    expect(mockProjectService.publishProject).not.toHaveBeenCalled();
    expect(mockProjectService.unpublishProject).not.toHaveBeenCalled();
  });

  it('should handle publish/unpublish error', () => {
    mockAuthService.getCurrentUser.and.returnValue({ roles: ['admin'] });
    mockProjectService.getProjects.and.returnValue(of(mockProjects));
    mockProjectService.publishProject.and.returnValue(
      of({ success: false, message: 'Publish failed' })
    );
    
    fixture.detectChanges();
    
    const project = component.projects[0];
    const originalStatus = project.publishStatus;
    
    component.togglePublishStatus(project);
    
    expect(mockToastr.error).toHaveBeenCalledWith('Publish failed');
    expect(project.publishStatus).toBe(originalStatus); // Status unchanged on error
  });

  it('should navigate to create project page', () => {
    mockAuthService.getCurrentUser.and.returnValue({ roles: ['admin'] });
    mockProjectService.getProjects.and.returnValue(of([]));
    
    fixture.detectChanges();
    
    component.navigateToProjectCreate();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard/project/add']);
  });

  it('should navigate to edit project page', () => {
    mockAuthService.getCurrentUser.and.returnValue({ roles: ['admin'] });
    mockProjectService.getProjects.and.returnValue(of(mockProjects));
    
    fixture.detectChanges();
    
    component.navigateToProjectEdit('proj-1');
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard/project/update', 'proj-1']);
  });

  it('should check edit permissions correctly', () => {
    mockProjectService.getProjects.and.returnValue(of([]));
    
    // Admin can edit
    mockAuthService.getCurrentUser.and.returnValue({ roles: ['admin'] });
    fixture.detectChanges();
    component.currentUserRole = 'admin';
    expect(component.canEdit()).toBeTruthy();
    
    // HOD can edit
    component.currentUserRole = 'hod';
    expect(component.canEdit()).toBeTruthy();
    
    // Regular user cannot edit
    component.currentUserRole = 'user';
    expect(component.canEdit()).toBeFalsy();
  });

  it('should check publish permissions correctly', () => {
    mockProjectService.getProjects.and.returnValue(of([]));
    
    // Only admin can publish
    mockAuthService.getCurrentUser.and.returnValue({ roles: ['admin'] });
    fixture.detectChanges();
    component.currentUserRole = 'admin';
    expect(component.canPublish()).toBeTruthy();
    
    // HOD cannot publish
    component.currentUserRole = 'hod';
    expect(component.canPublish()).toBeFalsy();
    
    // Regular user cannot publish
    component.currentUserRole = 'user';
    expect(component.canPublish()).toBeFalsy();
  });
});