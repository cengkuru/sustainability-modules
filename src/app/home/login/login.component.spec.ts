import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRoute: ActivatedRoute;

  const mockUser = {
    _id: 'test-id',
    email: 'test@example.com',
    name: 'Test User',
    roles: ['user'],
    createdAt: new Date()
  };

  beforeEach(async () => {
    const authServiceSpyObj = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterTestingModule,
        LoginComponent
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpyObj },
        { provide: Router, useValue: routerSpyObj },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {}
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRoute = TestBed.inject(ActivatedRoute);
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize the login form', () => {
      expect(component.loginForm).toBeDefined();
      expect(component.loginForm.get('email')).toBeDefined();
      expect(component.loginForm.get('password')).toBeDefined();
    });

    it('should set default return URL to /dashboard', () => {
      expect(component.returnUrl).toBe('/dashboard');
    });

    it('should set return URL from query params', () => {
      activatedRoute.snapshot.queryParams = { returnUrl: '/dashboard/projects' };
      component = new LoginComponent(authServiceSpy, routerSpy, activatedRoute, component['fb']);
      expect(component.returnUrl).toBe('/dashboard/projects');
    });

    it('should initialize with no error message', () => {
      expect(component.errorMessage).toBeNull();
    });

    it('should initialize with loading false', () => {
      expect(component.isLoading).toBe(false);
    });
  });

  describe('form validation', () => {
    it('should mark form as invalid when empty', () => {
      expect(component.loginForm.valid).toBe(false);
    });

    it('should mark email as invalid when empty', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('');
      expect(emailControl?.valid).toBe(false);
      expect(emailControl?.errors?.['required']).toBe(true);
    });

    it('should mark email as invalid with incorrect format', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('notanemail');
      expect(emailControl?.valid).toBe(false);
      expect(emailControl?.errors?.['email']).toBe(true);
    });

    it('should accept valid email format', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('test@example.com');
      expect(emailControl?.valid).toBe(true);
    });

    it('should mark password as invalid when empty', () => {
      const passwordControl = component.loginForm.get('password');
      passwordControl?.setValue('');
      expect(passwordControl?.valid).toBe(false);
      expect(passwordControl?.errors?.['required']).toBe(true);
    });

    it('should mark password as invalid when less than 6 characters', () => {
      const passwordControl = component.loginForm.get('password');
      passwordControl?.setValue('12345');
      expect(passwordControl?.valid).toBe(false);
      expect(passwordControl?.errors?.['minlength']).toBeTruthy();
    });

    it('should accept valid password', () => {
      const passwordControl = component.loginForm.get('password');
      passwordControl?.setValue('password123');
      expect(passwordControl?.valid).toBe(true);
    });

    it('should mark form as valid with correct inputs', () => {
      component.loginForm.setValue({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(component.loginForm.valid).toBe(true);
    });
  });

  describe('login', () => {
    beforeEach(() => {
      component.loginForm.setValue({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should not call auth service if form is invalid', () => {
      component.loginForm.setValue({
        email: 'invalid',
        password: '123'
      });

      component.login();

      expect(authServiceSpy.login).not.toHaveBeenCalled();
    });

    it('should call auth service with form values when valid', () => {
      authServiceSpy.login.and.returnValue(of(mockUser));

      component.login();

      expect(authServiceSpy.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should navigate to return URL on successful login', () => {
      authServiceSpy.login.and.returnValue(of(mockUser));
      component.returnUrl = '/dashboard/projects';

      component.login();

      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/dashboard/projects');
    });

    it('should set loading state during login', () => {
      authServiceSpy.login.and.returnValue(of(mockUser));

      expect(component.isLoading).toBe(false);
      component.login();
      // Loading should be set to false after successful login
      expect(component.isLoading).toBe(false);
    });

    it('should handle 401 error with specific message', () => {
      const error = { status: 401 };
      authServiceSpy.login.and.returnValue(throwError(() => error));

      component.login();

      expect(component.errorMessage).toBe('Invalid email or password. Please try again.');
      expect(component.isLoading).toBe(false);
    });

    it('should handle 404 error with specific message', () => {
      const error = { status: 404 };
      authServiceSpy.login.and.returnValue(throwError(() => error));

      component.login();

      expect(component.errorMessage).toBe('No account found with this email. Please check your email or sign up.');
      expect(component.isLoading).toBe(false);
    });

    it('should handle generic error with default message', () => {
      const error = { status: 500 };
      authServiceSpy.login.and.returnValue(throwError(() => error));

      component.login();

      expect(component.errorMessage).toBe('An error occurred during sign in. Please try again.');
      expect(component.isLoading).toBe(false);
    });

    it('should clear error message on successful login', () => {
      component.errorMessage = 'Previous error';
      authServiceSpy.login.and.returnValue(of(mockUser));

      component.login();

      expect(component.errorMessage).toBeNull();
    });
  });

  describe('form helpers', () => {
    it('should check if field is invalid', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('');
      emailControl?.markAsTouched();

      expect(component.isFieldInvalid('email')).toBe(true);
    });

    it('should return false for valid touched field', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('test@example.com');
      emailControl?.markAsTouched();

      expect(component.isFieldInvalid('email')).toBe(false);
    });

    it('should return false for invalid untouched field', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('');

      expect(component.isFieldInvalid('email')).toBe(false);
    });

    it('should get field error message for required', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('');
      emailControl?.markAsTouched();

      expect(component.getFieldError('email')).toBe('Email is required');
    });

    it('should get field error message for invalid email', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('notanemail');
      emailControl?.markAsTouched();

      expect(component.getFieldError('email')).toBe('Please enter a valid email');
    });

    it('should get field error message for password required', () => {
      const passwordControl = component.loginForm.get('password');
      passwordControl?.setValue('');
      passwordControl?.markAsTouched();

      expect(component.getFieldError('password')).toBe('Password is required');
    });

    it('should get field error message for password minlength', () => {
      const passwordControl = component.loginForm.get('password');
      passwordControl?.setValue('123');
      passwordControl?.markAsTouched();

      expect(component.getFieldError('password')).toBe('Password must be at least 6 characters');
    });

    it('should return empty string for valid field', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('test@example.com');
      emailControl?.markAsTouched();

      expect(component.getFieldError('email')).toBe('');
    });
  });

  describe('markFormFieldsAsTouched', () => {
    it('should mark all form fields as touched', () => {
      const emailControl = component.loginForm.get('email');
      const passwordControl = component.loginForm.get('password');

      expect(emailControl?.touched).toBe(false);
      expect(passwordControl?.touched).toBe(false);

      component['markFormFieldsAsTouched']();

      expect(emailControl?.touched).toBe(true);
      expect(passwordControl?.touched).toBe(true);
    });

    it('should only mark invalid fields as touched', () => {
      const emailControl = component.loginForm.get('email');
      const passwordControl = component.loginForm.get('password');
      
      emailControl?.setValue('test@example.com'); // Valid
      passwordControl?.setValue(''); // Invalid

      component['markFormFieldsAsTouched']();

      expect(emailControl?.touched).toBe(false);
      expect(passwordControl?.touched).toBe(true);
    });
  });
});