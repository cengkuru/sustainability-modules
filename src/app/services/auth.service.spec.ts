import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService, User } from './auth.service';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;
  let localStorageSpy: jasmine.SpyObj<Storage>;
  let tokenStorageServiceSpy: jasmine.SpyObj<TokenStorageService>;

  const mockUser: User = {
    _id: 'test-id',
    email: 'test@example.com',
    name: 'Test User',
    roles: ['user'],
    createdAt: new Date()
  };

  const mockAdminUser: User = {
    _id: 'admin-id',
    email: 'michael@cengkuru.com',
    name: 'Michael Cengkuru',
    roles: ['admin'],
    createdAt: new Date()
  };

  const mockFirebaseResponse = {
    idToken: 'mock-firebase-token',
    email: 'test@example.com',
    refreshToken: 'mock-refresh-token',
    expiresIn: '3600',
    localId: 'mock-local-id'
  };

  beforeEach(() => {
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    
    // Mock localStorage
    let store: { [key: string]: string } = {};
    localStorageSpy = jasmine.createSpyObj('localStorage', ['getItem', 'setItem', 'removeItem', 'clear']);
    localStorageSpy.getItem.and.callFake((key: string) => store[key] || null);
    localStorageSpy.setItem.and.callFake((key: string, value: string) => {
      store[key] = value;
    });
    localStorageSpy.removeItem.and.callFake((key: string) => {
      delete store[key];
    });
    localStorageSpy.clear.and.callFake(() => {
      store = {};
    });

    Object.defineProperty(window, 'localStorage', {
      value: localStorageSpy,
      writable: true
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        TokenStorageService,
        { provide: Router, useValue: routerSpyObj }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
    localStorageSpy.clear();
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should load stored user on initialization', () => {
      localStorageSpy.setItem('current_user', JSON.stringify(mockUser));
      localStorageSpy.setItem('auth_token', 'mock-token');
      
      // Create new service instance to test initialization
      const newService = new AuthService(TestBed.inject(HttpClient), routerSpy, TestBed.inject(TokenStorageService));
      
      newService.currentUser$.subscribe(user => {
        expect(user).toEqual(mockUser);
      });
    });

    it('should not load user if no token stored', () => {
      localStorageSpy.setItem('current_user', JSON.stringify(mockUser));
      // No token set
      
      const newService = new AuthService(TestBed.inject(HttpClient), routerSpy, TestBed.inject(TokenStorageService));
      
      newService.currentUser$.subscribe(user => {
        expect(user).toBeNull();
      });
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', (done) => {
      const email = 'test@example.com';
      const password = 'password123';

      service.login(email, password).subscribe(user => {
        expect(user).toEqual(mockUser);
        expect(localStorageSpy.setItem).toHaveBeenCalledWith('auth_token', mockFirebaseResponse.idToken);
        expect(localStorageSpy.setItem).toHaveBeenCalledWith('current_user', JSON.stringify(mockUser));
        done();
      });

      // Mock Firebase authentication request
      const firebaseUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebase?.apiKey}`;
      const firebaseReq = httpMock.expectOne(firebaseUrl);
      expect(firebaseReq.request.method).toBe('POST');
      expect(firebaseReq.request.body).toEqual({
        email,
        password,
        returnSecureToken: true
      });
      firebaseReq.flush(mockFirebaseResponse);

      // Mock Cloud Function authExchange request
      const functionsUrl = `${environment.functions?.baseUrl || 'https://us-central1-climatefinance-2dcc3.cloudfunctions.net'}/authExchange`;
      const exchangeReq = httpMock.expectOne(functionsUrl);
      expect(exchangeReq.request.method).toBe('POST');
      expect(exchangeReq.request.headers.get('Authorization')).toBe(`Bearer ${mockFirebaseResponse.idToken}`);
      exchangeReq.flush({ success: true, user: mockUser });
    });

    it('should handle Firebase authentication failure', (done) => {
      const email = 'test@example.com';
      const password = 'wrong-password';
      const errorMessage = 'INVALID_PASSWORD';

      service.login(email, password).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
          expect(localStorageSpy.setItem).not.toHaveBeenCalled();
          done();
        }
      });

      const firebaseUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebase?.apiKey}`;
      const req = httpMock.expectOne(firebaseUrl);
      req.flush({ error: { message: errorMessage } }, { status: 400, statusText: 'Bad Request' });
    });

    it('should fallback to basic user when Cloud Function fails', (done) => {
      const email = 'test@example.com';
      const password = 'password123';

      service.login(email, password).subscribe(user => {
        expect(user.email).toBe(email);
        expect(user.name).toBe('test');
        expect(user.roles).toEqual(['user']);
        expect(localStorageSpy.setItem).toHaveBeenCalledWith('auth_token', mockFirebaseResponse.idToken);
        done();
      });

      // Mock successful Firebase authentication
      const firebaseUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebase?.apiKey}`;
      const firebaseReq = httpMock.expectOne(firebaseUrl);
      firebaseReq.flush(mockFirebaseResponse);

      // Mock failed Cloud Function request
      const functionsUrl = `${environment.functions?.baseUrl || 'https://us-central1-climatefinance-2dcc3.cloudfunctions.net'}/authExchange`;
      const exchangeReq = httpMock.expectOne(functionsUrl);
      exchangeReq.flush({ success: false, message: 'MongoDB connection failed' }, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should assign admin role for michael@cengkuru.com in fallback', (done) => {
      const email = 'michael@cengkuru.com';
      const password = 'password123';

      service.login(email, password).subscribe(user => {
        expect(user.email).toBe(email);
        expect(user.roles).toEqual(['admin']);
        done();
      });

      // Mock successful Firebase authentication
      const firebaseUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebase?.apiKey}`;
      const firebaseReq = httpMock.expectOne(firebaseUrl);
      firebaseReq.flush({ ...mockFirebaseResponse, email });

      // Mock failed Cloud Function request
      const functionsUrl = `${environment.functions?.baseUrl || 'https://us-central1-climatefinance-2dcc3.cloudfunctions.net'}/authExchange`;
      const exchangeReq = httpMock.expectOne(functionsUrl);
      exchangeReq.flush({ success: false }, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('logout', () => {
    it('should clear user data and navigate to login', () => {
      // Set initial data
      localStorageSpy.setItem('auth_token', 'mock-token');
      localStorageSpy.setItem('current_user', JSON.stringify(mockUser));
      service['currentUserSubject'].next(mockUser);

      service.logout();

      expect(localStorageSpy.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorageSpy.removeItem).toHaveBeenCalledWith('current_user');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/public/login']);
      
      service.currentUser$.subscribe(user => {
        expect(user).toBeNull();
      });
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when user is logged in', () => {
      service['currentUserSubject'].next(mockUser);
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false when user is not logged in', () => {
      service['currentUserSubject'].next(null);
      expect(service.isLoggedIn()).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin user with roles array', () => {
      service['currentUserSubject'].next(mockAdminUser);
      expect(service.isAdmin()).toBe(true);
    });

    it('should return false for regular user', () => {
      service['currentUserSubject'].next(mockUser);
      expect(service.isAdmin()).toBe(false);
    });

    it('should return true for legacy admin role', () => {
      const legacyAdmin: User = {
        ...mockUser,
        role: 'admin',
        roles: undefined
      };
      service['currentUserSubject'].next(legacyAdmin);
      expect(service.isAdmin()).toBe(true);
    });

    it('should return false when no user is logged in', () => {
      service['currentUserSubject'].next(null);
      expect(service.isAdmin()).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return stored token', () => {
      localStorageSpy.setItem('auth_token', 'mock-token');
      expect(service.getToken()).toBe('mock-token');
    });

    it('should return null when no token is stored', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('Token Expiry Handling', () => {
    it('should not attempt to validate expired token on initialization', () => {
      // Create an expired token
      const expiredToken = createMockJWT({
        exp: Math.floor((Date.now() - 3600000) / 1000), // 1 hour ago
        email: 'test@example.com'
      });
      
      localStorageSpy.setItem('auth_token', expiredToken);
      localStorageSpy.setItem('current_user', JSON.stringify(mockUser));
      
      // Create new service instance
      const tokenService = TestBed.inject(TokenStorageService);
      spyOn(tokenService, 'isTokenExpired').and.returnValue(true);
      spyOn(tokenService, 'clearAll');
      
      const newService = new AuthService(TestBed.inject(HttpClient), routerSpy, tokenService);
      
      // Should clear auth data when token is expired
      expect(tokenService.clearAll).toHaveBeenCalled();
      
      // Should not make any HTTP requests
      httpMock.expectNone(`${environment.functions?.baseUrl || 'https://us-central1-climatefinance-2dcc3.cloudfunctions.net'}/authExchange`);
    });

    it('should clear auth data when getToken detects expired token', () => {
      const tokenService = TestBed.inject(TokenStorageService);
      const expiredToken = 'expired-token';
      
      spyOn(tokenService, 'getToken').and.returnValue(expiredToken);
      spyOn(tokenService, 'isTokenExpired').and.returnValue(true);
      spyOn(tokenService, 'clearAll');
      
      const result = service.getToken();
      
      expect(result).toBeNull();
      expect(tokenService.clearAll).toHaveBeenCalled();
    });

    it('should handle 401 error in refreshCurrentUser by clearing auth', (done) => {
      const token = 'valid-token';
      localStorageSpy.setItem('auth_token', token);
      
      const tokenService = TestBed.inject(TokenStorageService);
      spyOn(tokenService, 'getToken').and.returnValue(token);
      spyOn(tokenService, 'isTokenExpired').and.returnValue(false);
      spyOn(tokenService, 'clearAll');
      
      service.refreshCurrentUser().subscribe(user => {
        expect(user).toBeNull();
        expect(tokenService.clearAll).toHaveBeenCalled();
        done();
      });

      const functionsUrl = `${environment.functions?.baseUrl || 'https://us-central1-climatefinance-2dcc3.cloudfunctions.net'}/authExchange`;
      const req = httpMock.expectOne(functionsUrl);
      req.flush({ message: 'Token expired' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should not make API call if token is expired in refreshCurrentUser', (done) => {
      const tokenService = TestBed.inject(TokenStorageService);
      spyOn(tokenService, 'getToken').and.returnValue('expired-token');
      spyOn(tokenService, 'isTokenExpired').and.returnValue(true);
      spyOn(tokenService, 'clearAll');
      
      service.refreshCurrentUser().subscribe(user => {
        expect(user).toBeNull();
        expect(tokenService.clearAll).toHaveBeenCalled();
        done();
      });

      // Should not make any HTTP requests
      httpMock.expectNone(`${environment.functions?.baseUrl || 'https://us-central1-climatefinance-2dcc3.cloudfunctions.net'}/authExchange`);
    });

    it('should handle other errors in refreshCurrentUser without clearing auth', (done) => {
      const token = 'valid-token';
      localStorageSpy.setItem('auth_token', token);
      service['currentUserSubject'].next(mockUser);
      
      const tokenService = TestBed.inject(TokenStorageService);
      spyOn(tokenService, 'getToken').and.returnValue(token);
      spyOn(tokenService, 'isTokenExpired').and.returnValue(false);
      spyOn(tokenService, 'clearAll');
      
      service.refreshCurrentUser().subscribe(user => {
        expect(user).toEqual(mockUser); // Should keep current user
        expect(tokenService.clearAll).not.toHaveBeenCalled();
        done();
      });

      const functionsUrl = `${environment.functions?.baseUrl || 'https://us-central1-climatefinance-2dcc3.cloudfunctions.net'}/authExchange`;
      const req = httpMock.expectOne(functionsUrl);
      req.flush({ message: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', () => {
      service['currentUserSubject'].next(mockUser);
      expect(service.getCurrentUser()).toEqual(mockUser);
    });

    it('should return null when no user is logged in', () => {
      service['currentUserSubject'].next(null);
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('register', () => {
    it('should successfully register a new user', (done) => {
      const name = 'New User';
      const email = 'newuser@example.com';
      const password = 'password123';
      const mockResponse = {
        token: 'new-token',
        user: { ...mockUser, name, email }
      };

      service.register(name, email, password).subscribe(user => {
        expect(user).toEqual(mockResponse.user);
        expect(localStorageSpy.setItem).toHaveBeenCalledWith('auth_token', mockResponse.token);
        expect(localStorageSpy.setItem).toHaveBeenCalledWith('current_user', JSON.stringify(mockResponse.user));
        done();
      });

      const req = httpMock.expectOne(`${environment.mongodb?.apiUrl || 'http://localhost:3000/api'}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name, email, password });
      req.flush(mockResponse);
    });

    it('should handle registration failure', (done) => {
      const name = 'New User';
      const email = 'existing@example.com';
      const password = 'password123';

      service.register(name, email, password).subscribe({
        next: (result) => {
          // The service returns the error as a result due to handleError
          expect(result).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.mongodb?.apiUrl || 'http://localhost:3000/api'}/auth/register`);
      req.flush({ message: 'Email already exists' }, { status: 409, statusText: 'Conflict' });
    });
  });
});

// Helper function to create mock JWT token
function createMockJWT(payload: any): string {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = 'mock-signature';
  return `${header}.${body}.${signature}`;
}