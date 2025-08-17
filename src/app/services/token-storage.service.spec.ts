import { TestBed } from '@angular/core/testing';
import { TokenStorageService } from './token-storage.service';

describe('TokenStorageService', () => {
  let service: TokenStorageService;
  let store: { [key: string]: string } = {};

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenStorageService);
    
    // Mock localStorage
    store = {};
    const mockLocalStorage = {
      getItem: (key: string): string | null => {
        return key in store ? store[key] : null;
      },
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      }
    };

    spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
    spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
    spyOn(localStorage, 'removeItem').and.callFake(mockLocalStorage.removeItem);
    spyOn(localStorage, 'clear').and.callFake(mockLocalStorage.clear);
  });

  afterEach(() => {
    store = {};
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Token Expiry Handling', () => {
    it('should detect expired token', () => {
      // Create an expired token (exp was 1 hour ago)
      const expiredPayload = {
        exp: Math.floor((Date.now() - 3600000) / 1000), // 1 hour ago
        email: 'test@example.com'
      };
      const expiredToken = createMockJWT(expiredPayload);
      service.setToken(expiredToken);

      expect(service.isTokenExpired()).toBe(true);
    });

    it('should detect valid token', () => {
      // Create a valid token (exp is 2 hours from now)
      const validPayload = {
        exp: Math.floor((Date.now() + 7200000) / 1000), // 2 hours from now
        email: 'test@example.com'
      };
      const validToken = createMockJWT(validPayload);
      service.setToken(validToken);

      expect(service.isTokenExpired()).toBe(false);
    });

    it('should detect token expiring within buffer time', () => {
      // Create a token expiring in 3 minutes (within 5 minute buffer)
      const soonToExpirePayload = {
        exp: Math.floor((Date.now() + 180000) / 1000), // 3 minutes from now
        email: 'test@example.com'
      };
      const soonToExpireToken = createMockJWT(soonToExpirePayload);
      service.setToken(soonToExpireToken);

      expect(service.isTokenExpired()).toBe(true); // Should be treated as expired due to buffer
    });

    it('should return true for malformed token', () => {
      service.setToken('invalid-token-format');
      expect(service.isTokenExpired()).toBe(true);
    });

    it('should return true when no token exists', () => {
      expect(service.isTokenExpired()).toBe(true);
    });

    it('should handle token with invalid JSON payload', () => {
      const invalidToken = 'header.{invalid-json}.signature';
      service.setToken(invalidToken);
      
      // Should log error and return true
      spyOn(console, 'error');
      expect(service.isTokenExpired()).toBe(true);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('isLoggedIn with Token Expiry', () => {
    it('should return false when token is expired', () => {
      const expiredPayload = {
        exp: Math.floor((Date.now() - 3600000) / 1000),
        email: 'test@example.com'
      };
      const expiredToken = createMockJWT(expiredPayload);
      service.setToken(expiredToken);

      expect(service.isLoggedIn()).toBe(false);
    });

    it('should return true when token is valid', () => {
      const validPayload = {
        exp: Math.floor((Date.now() + 7200000) / 1000),
        email: 'test@example.com'
      };
      const validToken = createMockJWT(validPayload);
      service.setToken(validToken);

      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false when no token exists', () => {
      expect(service.isLoggedIn()).toBe(false);
    });
  });

  describe('Token Management', () => {
    it('should store and retrieve token', () => {
      const token = 'test-token';
      service.setToken(token);
      expect(service.getToken()).toBe(token);
    });

    it('should remove token', () => {
      service.setToken('test-token');
      service.removeToken();
      expect(service.getToken()).toBeNull();
    });
  });

  describe('User Management', () => {
    it('should store and retrieve user', () => {
      const user = { id: '1', email: 'test@example.com', name: 'Test User' };
      service.setUser(user);
      expect(service.getUser()).toEqual(user);
    });

    it('should handle invalid JSON when retrieving user', () => {
      store['current_user'] = 'invalid-json';
      spyOn(console, 'error');
      
      expect(service.getUser()).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('should update currentUser subject when setting user', (done) => {
      const user = { id: '1', email: 'test@example.com' };
      
      service.getCurrentUser().subscribe(currentUser => {
        if (currentUser) {
          expect(currentUser).toEqual(user);
          done();
        }
      });

      service.setUser(user);
    });
  });

  describe('Clear All', () => {
    it('should clear all auth data', () => {
      service.setToken('test-token');
      service.setUser({ id: '1', email: 'test@example.com' });
      service.setUserRole('admin');

      service.clearAll();

      expect(service.getToken()).toBeNull();
      expect(service.getUser()).toBeNull();
      expect(service.getUserRole()).toBeNull();
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