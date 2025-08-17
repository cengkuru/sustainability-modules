import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService, User, CreateUserDto, UpdateUserDto } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const mockToken = 'mock-firebase-token';
  const apiUrl = 'https://us-central1-moz-transparency-portal.cloudfunctions.net';

  const mockUser: User = {
    _id: '123',
    uid: 'firebase-uid',
    email: 'test@example.com',
    name: 'Test User',
    roles: ['user'],
    agency: 'Test Agency',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    // Mock localStorage
    spyOn(localStorage, 'getItem').and.returnValue(mockToken);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUsers', () => {
    it('should fetch all users with authorization header', (done) => {
      const mockUsers: User[] = [mockUser, { ...mockUser, _id: '456', name: 'Another User' }];

      service.getUsers().subscribe({
        next: (users) => {
          expect(users).toEqual(mockUsers);
          expect(localStorage.getItem).toHaveBeenCalledWith('auth_token');
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/users`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush(mockUsers);
    });

    it('should handle error when fetching users fails', (done) => {
      const errorMessage = 'Failed to fetch users';

      service.getUsers().subscribe({
        error: (error) => {
          expect(error.message).toBe(errorMessage);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/users`);
      req.flush({ message: errorMessage }, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getUserById', () => {
    it('should fetch a single user by id', (done) => {
      const userId = '123';

      service.getUserById(userId).subscribe({
        next: (user) => {
          expect(user).toEqual(mockUser);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/users/${userId}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush(mockUser);
    });

    it('should handle error when user not found', (done) => {
      const userId = 'nonexistent';

      service.getUserById(userId).subscribe({
        error: (error) => {
          expect(error.message).toBe('User not found');
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/users/${userId}`);
      req.flush({ message: 'User not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createUser', () => {
    it('should create a new user', (done) => {
      const newUserData: CreateUserDto = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        roles: ['user'],
        agency: 'New Agency'
      };

      const createdUser: User = {
        ...mockUser,
        ...newUserData,
        _id: '789',
        uid: 'new-firebase-uid'
      };

      service.createUser(newUserData).subscribe({
        next: (user) => {
          expect(user).toEqual(createdUser);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/users`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newUserData);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush(createdUser);
    });

    it('should handle validation errors when creating user', (done) => {
      const invalidUserData: CreateUserDto = {
        email: 'invalid-email',
        password: '123',
        name: '',
        roles: []
      };

      service.createUser(invalidUserData).subscribe({
        error: (error) => {
          expect(error.message).toBe('Invalid user data');
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/users`);
      req.flush({ message: 'Invalid user data' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', (done) => {
      const userId = '123';
      const updates: UpdateUserDto = {
        name: 'Updated Name',
        roles: ['admin'],
        status: 'inactive'
      };

      const updatedUser: User = {
        ...mockUser,
        ...updates
      };

      service.updateUser(userId, updates).subscribe({
        next: (user) => {
          expect(user).toEqual(updatedUser);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/users/${userId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updates);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush(updatedUser);
    });

    it('should handle partial updates', (done) => {
      const userId = '123';
      const updates: UpdateUserDto = {
        status: 'inactive'
      };

      const updatedUser: User = {
        ...mockUser,
        status: 'inactive'
      };

      service.updateUser(userId, updates).subscribe({
        next: (user) => {
          expect(user.status).toBe('inactive');
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/users/${userId}`);
      req.flush(updatedUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', (done) => {
      const userId = '123';

      service.deleteUser(userId).subscribe({
        next: () => {
          expect(true).toBe(true);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/users/${userId}`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush(null);
    });

    it('should handle error when deleting non-existent user', (done) => {
      const userId = 'nonexistent';

      service.deleteUser(userId).subscribe({
        error: (error) => {
          expect(error.message).toBe('User not found');
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/users/${userId}`);
      req.flush({ message: 'User not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('error handling', () => {
    it('should handle network errors', (done) => {
      service.getUsers().subscribe({
        error: (error) => {
          expect(error.message).toBe('Network error occurred');
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/users`);
      req.error(new ErrorEvent('Network error', {
        message: 'Network error occurred'
      }));
    });

    it('should handle missing auth token', (done) => {
      // Override the localStorage mock to return null
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);

      service.getUsers().subscribe({
        error: (error) => {
          expect(error.message).toBe('No authentication token found');
          done();
        }
      });
    });
  });
});