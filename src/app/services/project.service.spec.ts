import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProjectService } from './project.service';
import { AuthService } from './auth.service';
import { of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  
  const functionsUrl = environment.functions?.baseUrl || 'https://us-central1-mozambique-reports.cloudfunctions.net';
  const mockToken = 'mock-firebase-token-123';

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['getIdToken']);
    
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ProjectService,
        { provide: AuthService, useValue: mockAuthService }
      ]
    });
    
    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProjects', () => {
    it('should fetch projects with authentication', () => {
      const mockProjects = [
        { id: '1', title: 'Project 1' },
        { id: '2', title: 'Project 2' }
      ];
      const mockResponse = { success: true, data: mockProjects };
      
      mockAuthService.getIdToken.and.returnValue(of(mockToken));
      
      service.getProjects().subscribe(projects => {
        expect(projects).toEqual(mockProjects);
      });
      
      const req = httpMock.expectOne(`${functionsUrl}/getProjects`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush(mockResponse);
    });

    it('should handle empty projects response', () => {
      mockAuthService.getIdToken.and.returnValue(of(mockToken));
      
      service.getProjects().subscribe(projects => {
        expect(projects).toEqual([]);
      });
      
      const req = httpMock.expectOne(`${functionsUrl}/getProjects`);
      req.flush({ success: true, data: null });
    });

    it('should handle projects fetch error', () => {
      mockAuthService.getIdToken.and.returnValue(of(mockToken));
      
      service.getProjects().subscribe(projects => {
        expect(projects).toEqual([]);
      });
      
      const req = httpMock.expectOne(`${functionsUrl}/getProjects`);
      req.error(new ErrorEvent('Network error'));
    });

    it('should work without authentication token', () => {
      mockAuthService.getIdToken.and.returnValue(of(null));
      
      service.getProjects().subscribe();
      
      const req = httpMock.expectOne(`${functionsUrl}/getProjects`);
      expect(req.request.headers.has('Authorization')).toBeFalsy();
      req.flush({ success: true, data: [] });
    });
  });

  describe('getProjectById', () => {
    it('should fetch single project by ID', () => {
      const mockProject = { id: 'test-id', title: 'Test Project' };
      const mockResponse = { success: true, data: mockProject };
      
      mockAuthService.getIdToken.and.returnValue(of(mockToken));
      
      service.getProjectById('test-id').subscribe(project => {
        expect(project).toEqual(mockProject);
      });
      
      const req = httpMock.expectOne(`${functionsUrl}/getProject?id=test-id`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush(mockResponse);
    });

    it('should handle project not found', () => {
      mockAuthService.getIdToken.and.returnValue(of(mockToken));
      
      service.getProjectById('invalid-id').subscribe(project => {
        expect(project).toBeNull();
      });
      
      const req = httpMock.expectOne(`${functionsUrl}/getProject?id=invalid-id`);
      req.flush({ success: false, data: null });
    });
  });

  describe('createProject', () => {
    it('should create project with authentication', () => {
      const newProject = {
        title: 'New Project',
        description: 'Description',
        type: 'construction'
      };
      const mockResponse = { success: true, data: { ...newProject, id: 'new-id' } };
      
      mockAuthService.getIdToken.and.returnValue(of(mockToken));
      
      service.createProject(newProject).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
      
      const req = httpMock.expectOne(`${functionsUrl}/createProject`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      expect(req.request.body).toEqual(newProject);
      req.flush(mockResponse);
    });

    it('should handle authentication required error', (done) => {
      mockAuthService.getIdToken.and.returnValue(of(null));
      
      service.createProject({}).subscribe({
        error: (error) => {
          expect(error.message).toBe('Authentication required');
          done();
        }
      });
    });

    it('should handle create project error', (done) => {
      const errorMessage = 'Create failed';
      mockAuthService.getIdToken.and.returnValue(of(mockToken));
      
      service.createProject({}).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        }
      });
      
      const req = httpMock.expectOne(`${functionsUrl}/createProject`);
      req.flush({ message: errorMessage }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updateProject', () => {
    it('should update project with authentication', () => {
      const projectId = 'proj-123';
      const updates = { title: 'Updated Title' };
      const mockResponse = { success: true, data: { id: projectId, ...updates } };
      
      mockAuthService.getIdToken.and.returnValue(of(mockToken));
      
      service.updateProject(projectId, updates).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
      
      const req = httpMock.expectOne(`${functionsUrl}/updateProject?id=${projectId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      expect(req.request.body).toEqual(updates);
      req.flush(mockResponse);
    });

    it('should handle update without authentication', (done) => {
      mockAuthService.getIdToken.and.returnValue(of(null));
      
      service.updateProject('id', {}).subscribe({
        error: (error) => {
          expect(error.message).toBe('Authentication required');
          done();
        }
      });
    });
  });

  describe('deleteProject', () => {
    it('should delete project with authentication', () => {
      const projectId = 'proj-123';
      const mockResponse = { success: true, message: 'Project deleted' };
      
      mockAuthService.getIdToken.and.returnValue(of(mockToken));
      
      service.deleteProject(projectId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
      
      const req = httpMock.expectOne(`${functionsUrl}/deleteProject?id=${projectId}`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush(mockResponse);
    });

    it('should handle delete error', (done) => {
      mockAuthService.getIdToken.and.returnValue(of(mockToken));
      
      service.deleteProject('invalid-id').subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        }
      });
      
      const req = httpMock.expectOne(`${functionsUrl}/deleteProject?id=invalid-id`);
      req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('publishProject', () => {
    it('should publish project with authentication', () => {
      const projectId = 'proj-123';
      const mockResponse = { success: true, message: 'Project published' };
      
      mockAuthService.getIdToken.and.returnValue(of(mockToken));
      
      service.publishProject(projectId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
      
      const req = httpMock.expectOne(`${functionsUrl}/publishProject?id=${projectId}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req.request.body).toEqual({});
      req.flush(mockResponse);
    });
  });

  describe('unpublishProject', () => {
    it('should unpublish project with authentication', () => {
      const projectId = 'proj-123';
      const mockResponse = { success: true, message: 'Project unpublished' };
      
      mockAuthService.getIdToken.and.returnValue(of(mockToken));
      
      service.unpublishProject(projectId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
      
      const req = httpMock.expectOne(`${functionsUrl}/unpublishProject?id=${projectId}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req.request.body).toEqual({});
      req.flush(mockResponse);
    });
  });

  describe('flattenProject', () => {
    it('should flatten complex project structure', () => {
      const complexProject = {
        id: 'test-id',
        name: 'Test Project',
        featured: true,
        location: {
          name: 'Test Location',
          coordinates: { lat: 10, lng: 20 }
        },
        stages: {
          identification: {
            basicData: {
              sectorSubsector: 'transport',
              projectOwner: 'Owner Name',
              projectReferenceNumber: 'REF-123',
              purpose: 'Test purpose',
              projectDescription: 'Test description'
            },
            climateFinanceData: {
              climateObjective: 'Mitigation',
              amountOfInvestment: '1000000'
            }
          },
          preparation: {
            basicData: {
              projectBudget: '2000000',
              projectBudgetApprovalDate: '2024-01-01',
              fundingSources: 'Government'
            },
            socialSustainabilityData: {
              numberOfBeneficiaries: 5000
            }
          },
          completion: {
            basicData: {
              projectStatus: 'completed',
              completionDate: '2024-12-31',
              completionCost: '1800000',
              scopeAtCompletion: 'Full scope'
            }
          }
        },
        metadata: {
          dateCreated: '2024-01-01',
          dateUpdated: '2024-06-01',
          version: '1.0'
        }
      };

      const flattened = service.flattenProject(complexProject);
      
      expect(flattened.id).toBe('test-id');
      expect(flattened.name).toBe('Test Project');
      expect(flattened.featured).toBe(true);
      expect(flattened.location).toBe('Test Location');
      expect(JSON.parse(flattened.coordinates)).toEqual({ lat: 10, lng: 20 });
      expect(flattened.sector).toBe('transport');
      expect(flattened.projectOwner).toBe('Owner Name');
      expect(flattened.purpose).toBe('Test purpose');
      expect(flattened.description).toBe('Test description');
      expect(flattened.status).toBe('completed');
      expect(flattened.completionDate).toBe('2024-12-31');
      expect(flattened.identificationClimateObjective).toBe('Mitigation');
      expect(flattened.preparationNumberOfBeneficiaries).toBe(5000);
      expect(flattened.version).toBe('1.0');
    });

    it('should handle missing fields gracefully', () => {
      const minimalProject = {
        id: 'min-id',
        name: 'Minimal Project'
      };

      const flattened = service.flattenProject(minimalProject);
      
      expect(flattened.id).toBe('min-id');
      expect(flattened.name).toBe('Minimal Project');
      expect(flattened.featured).toBe(false);
      expect(flattened.location).toBe('');
      expect(flattened.sector).toBe('');
      expect(flattened.preparationNumberOfBeneficiaries).toBe(0);
    });
  });

  describe('getNextProject', () => {
    it('should get next project in list', () => {
      const mockProjects = [
        { id: '1', title: 'Project 1' },
        { id: '2', title: 'Project 2' },
        { id: '3', title: 'Project 3' }
      ];
      
      mockAuthService.getIdToken.and.returnValue(of(mockToken));
      
      service.getNextProject('1').subscribe(project => {
        expect(project.id).toBe('2');
      });
      
      const req = httpMock.expectOne(`${functionsUrl}/getProjects`);
      req.flush({ success: true, data: mockProjects });
    });

    it('should return null for last project', () => {
      const mockProjects = [
        { id: '1', title: 'Project 1' },
        { id: '2', title: 'Project 2' }
      ];
      
      mockAuthService.getIdToken.and.returnValue(of(mockToken));
      
      service.getNextProject('2').subscribe(project => {
        expect(project).toBeNull();
      });
      
      const req = httpMock.expectOne(`${functionsUrl}/getProjects`);
      req.flush({ success: true, data: mockProjects });
    });
  });

  describe('getPreviousProject', () => {
    it('should get previous project in list', () => {
      const mockProjects = [
        { id: '1', title: 'Project 1' },
        { id: '2', title: 'Project 2' },
        { id: '3', title: 'Project 3' }
      ];
      
      mockAuthService.getIdToken.and.returnValue(of(mockToken));
      
      service.getPreviousProject('2').subscribe(project => {
        expect(project.id).toBe('1');
      });
      
      const req = httpMock.expectOne(`${functionsUrl}/getProjects`);
      req.flush({ success: true, data: mockProjects });
    });

    it('should return null for first project', () => {
      const mockProjects = [
        { id: '1', title: 'Project 1' },
        { id: '2', title: 'Project 2' }
      ];
      
      mockAuthService.getIdToken.and.returnValue(of(mockToken));
      
      service.getPreviousProject('1').subscribe(project => {
        expect(project).toBeNull();
      });
      
      const req = httpMock.expectOne(`${functionsUrl}/getProjects`);
      req.flush({ success: true, data: mockProjects });
    });
  });
});