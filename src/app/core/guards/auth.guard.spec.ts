import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../../services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    const authServiceSpyObj = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'isAdmin']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpyObj },
        { provide: Router, useValue: routerSpyObj }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    route = {} as ActivatedRouteSnapshot;
    state = { url: '/dashboard' } as RouterStateSnapshot;
  });

  describe('canActivate', () => {
    it('should allow access for logged in users', () => {
      authServiceSpy.isLoggedIn.and.returnValue(true);
      route.data = {};

      const result = guard.canActivate(route, state);

      expect(result).toBe(true);
      expect(authServiceSpy.isLoggedIn).toHaveBeenCalled();
      expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
    });

    it('should redirect to login for non-authenticated users', () => {
      authServiceSpy.isLoggedIn.and.returnValue(false);
      const mockUrlTree = {} as UrlTree;
      routerSpy.createUrlTree.and.returnValue(mockUrlTree);

      const result = guard.canActivate(route, state);

      expect(result).toBe(mockUrlTree);
      expect(authServiceSpy.isLoggedIn).toHaveBeenCalled();
      expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/public/login'], {
        queryParams: { returnUrl: '/dashboard' }
      });
    });

    it('should allow admin access for admin users', () => {
      authServiceSpy.isLoggedIn.and.returnValue(true);
      authServiceSpy.isAdmin.and.returnValue(true);
      route.data = { requiresAdmin: true };

      const result = guard.canActivate(route, state);

      expect(result).toBe(true);
      expect(authServiceSpy.isLoggedIn).toHaveBeenCalled();
      expect(authServiceSpy.isAdmin).toHaveBeenCalled();
      expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
    });

    it('should redirect non-admin users from admin routes', () => {
      authServiceSpy.isLoggedIn.and.returnValue(true);
      authServiceSpy.isAdmin.and.returnValue(false);
      route.data = { requiresAdmin: true };
      const mockUrlTree = {} as UrlTree;
      routerSpy.createUrlTree.and.returnValue(mockUrlTree);

      const result = guard.canActivate(route, state);

      expect(result).toBe(mockUrlTree);
      expect(authServiceSpy.isLoggedIn).toHaveBeenCalled();
      expect(authServiceSpy.isAdmin).toHaveBeenCalled();
      expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/public']);
    });

    it('should preserve return URL when redirecting to login', () => {
      authServiceSpy.isLoggedIn.and.returnValue(false);
      state = { url: '/dashboard/projects/123' } as RouterStateSnapshot;
      const mockUrlTree = {} as UrlTree;
      routerSpy.createUrlTree.and.returnValue(mockUrlTree);

      const result = guard.canActivate(route, state);

      expect(result).toBe(mockUrlTree);
      expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/public/login'], {
        queryParams: { returnUrl: '/dashboard/projects/123' }
      });
    });

    it('should not check admin role if not required', () => {
      authServiceSpy.isLoggedIn.and.returnValue(true);
      route.data = {};

      const result = guard.canActivate(route, state);

      expect(result).toBe(true);
      expect(authServiceSpy.isAdmin).not.toHaveBeenCalled();
    });

    it('should handle undefined route data', () => {
      authServiceSpy.isLoggedIn.and.returnValue(true);
      route.data = undefined as any;

      const result = guard.canActivate(route, state);

      expect(result).toBe(true);
      expect(authServiceSpy.isAdmin).not.toHaveBeenCalled();
    });
  });
});