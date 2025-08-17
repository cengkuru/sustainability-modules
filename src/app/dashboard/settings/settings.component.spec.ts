import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { SettingsComponent } from './settings.component';
import { AuthService } from '../../services/auth.service';
import { UserService, UpdateProfileDto } from '../../services/user.service';
import { SettingsService, SiteSettings } from '../../services/settings.service';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let userService: jasmine.SpyObj<UserService>;
  let settingsService: jasmine.SpyObj<SettingsService>;
  let toastrService: jasmine.SpyObj<ToastrService>;
  let httpMock: HttpTestingController;

  const mockUser = {
    _id: 'user123',
    email: 'test@example.com',
    name: 'Test User',
    phone: '+1234567890',
    bio: 'Test bio',
    roles: ['user'],
    createdAt: new Date()
  };

  const mockAdminUser = {
    ...mockUser,
    email: 'admin@example.com',
    name: 'Admin User',
    roles: ['admin']
  };

  const mockSiteSettings: SiteSettings = {
    siteTitle: 'Test Site',
    siteDescription: 'Test Description',
    maintenanceMode: false,
    maintenanceMessage: 'Under maintenance',
    enableRegistration: true,
    enablePublicProjects: true,
    contactEmail: 'contact@test.com',
    contactPhone: '+1234567890',
    contactAddress: '123 Test St',
    socialLinks: {
      facebook: 'https://facebook.com/test',
      twitter: 'https://twitter.com/test',
      linkedin: 'https://linkedin.com/test',
      youtube: 'https://youtube.com/test'
    },
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'pt']
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAdmin', 'refreshCurrentUser'], {
      currentUser$: of(mockUser)
    });
    const userServiceSpy = jasmine.createSpyObj('UserService', ['updateOwnProfile', 'changePassword']);
    const settingsServiceSpy = jasmine.createSpyObj('SettingsService', ['getFullSettings', 'updateSettings']);
    const toastrServiceSpy = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning']);

    await TestBed.configureTestingModule({
      declarations: [ SettingsComponent ],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        ToastrModule.forRoot()
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: SettingsService, useValue: settingsServiceSpy },
        { provide: ToastrService, useValue: toastrServiceSpy }
      ]
    })
    .compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    settingsService = TestBed.inject(SettingsService) as jasmine.SpyObj<SettingsService>;
    toastrService = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    httpMock = TestBed.inject(HttpTestingController);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize forms on creation', () => {
      expect(component.profileForm).toBeDefined();
      expect(component.passwordForm).toBeDefined();
      expect(component.siteSettingsForm).toBeDefined();
      expect(component.contactForm).toBeDefined();
    });

    it('should populate profile form with user data', () => {
      expect(component.profileForm.get('name')?.value).toBe(mockUser.name);
      expect(component.profileForm.get('email')?.value).toBe(mockUser.email);
      expect(component.profileForm.get('phone')?.value).toBe(mockUser.phone);
      expect(component.profileForm.get('bio')?.value).toBe(mockUser.bio);
    });

    it('should disable email field in profile form', () => {
      expect(component.profileForm.get('email')?.disabled).toBe(true);
    });

    it('should load site settings for admin users', () => {
      authService.isAdmin.and.returnValue(true);
      settingsService.getFullSettings.and.returnValue(of(mockSiteSettings));
      
      component.ngOnInit();
      
      expect(settingsService.getFullSettings).toHaveBeenCalled();
    });

    it('should not load site settings for non-admin users', () => {
      authService.isAdmin.and.returnValue(false);
      
      component.ngOnInit();
      
      expect(settingsService.getFullSettings).not.toHaveBeenCalled();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch tabs for regular users', () => {
      component.switchTab('security');
      expect(component.activeTab).toBe('security');
      
      component.switchTab('profile');
      expect(component.activeTab).toBe('profile');
    });

    it('should prevent non-admins from accessing admin tabs', () => {
      authService.isAdmin.and.returnValue(false);
      
      component.switchTab('site');
      expect(component.activeTab).toBe('profile');
      expect(toastrService.warning).toHaveBeenCalledWith('Admin access required');
      
      component.switchTab('contact');
      expect(component.activeTab).toBe('profile');
    });

    it('should allow admins to access all tabs', () => {
      authService.isAdmin.and.returnValue(true);
      component.isAdmin = true;
      
      component.switchTab('site');
      expect(component.activeTab).toBe('site');
      
      component.switchTab('contact');
      expect(component.activeTab).toBe('contact');
    });
  });

  describe('Profile Update', () => {
    it('should successfully update user profile', (done) => {
      const updates: UpdateProfileDto = {
        name: 'Updated Name',
        phone: '+9876543210',
        bio: 'Updated bio'
      };
      
      component.profileForm.patchValue(updates);
      const updatedUser = { ...mockUser, ...updates };
      
      userService.updateOwnProfile.and.returnValue(of(updatedUser));
      authService.refreshCurrentUser.and.returnValue(of(updatedUser));
      
      component.updateProfile();
      
      setTimeout(() => {
        expect(userService.updateOwnProfile).toHaveBeenCalledWith(updates);
        expect(authService.refreshCurrentUser).toHaveBeenCalled();
        expect(toastrService.success).toHaveBeenCalledWith('Profile updated successfully');
        expect(component.isLoadingProfile).toBe(false);
        done();
      }, 100);
    });

    it('should handle profile update errors', (done) => {
      const errorMessage = 'Failed to update profile';
      userService.updateOwnProfile.and.returnValue(
        throwError({ error: { message: errorMessage } })
      );
      
      component.updateProfile();
      
      setTimeout(() => {
        expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
        expect(component.isLoadingProfile).toBe(false);
        done();
      }, 100);
    });

    it('should not update profile with invalid form', () => {
      component.profileForm.patchValue({ name: '' });
      component.updateProfile();
      
      expect(userService.updateOwnProfile).not.toHaveBeenCalled();
    });
  });

  describe('Password Change', () => {
    beforeEach(() => {
      component.passwordForm.patchValue({
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
        confirmPassword: 'newPassword456'
      });
    });

    it('should successfully change password', (done) => {
      userService.changePassword.and.returnValue(
        of({ success: true, message: 'Password changed' })
      );
      
      component.updatePassword();
      
      setTimeout(() => {
        expect(userService.changePassword).toHaveBeenCalledWith('oldPassword123', 'newPassword456');
        expect(component.passwordForm.value).toEqual({
          currentPassword: null,
          newPassword: null,
          confirmPassword: null
        });
        expect(toastrService.success).toHaveBeenCalledWith('Password changed successfully');
        expect(component.isLoadingPassword).toBe(false);
        done();
      }, 100);
    });

    it('should handle password change errors', (done) => {
      const errorMessage = 'Current password is incorrect';
      userService.changePassword.and.returnValue(
        throwError({ error: { message: errorMessage } })
      );
      
      component.updatePassword();
      
      setTimeout(() => {
        expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
        expect(component.isLoadingPassword).toBe(false);
        done();
      }, 100);
    });

    it('should validate password match', () => {
      component.passwordForm.patchValue({
        newPassword: 'password1',
        confirmPassword: 'password2'
      });
      
      expect(component.passwordForm.hasError('mismatch')).toBe(true);
      
      component.passwordForm.patchValue({
        confirmPassword: 'password1'
      });
      
      expect(component.passwordForm.hasError('mismatch')).toBe(false);
    });

    it('should not change password with invalid form', () => {
      component.passwordForm.patchValue({ currentPassword: '' });
      component.updatePassword();
      
      expect(userService.changePassword).not.toHaveBeenCalled();
    });
  });

  describe('Site Settings (Admin)', () => {
    beforeEach(() => {
      component.isAdmin = true;
      settingsService.getFullSettings.and.returnValue(of(mockSiteSettings));
    });

    it('should load and populate site settings form', () => {
      component.loadSiteSettings();
      
      expect(settingsService.getFullSettings).toHaveBeenCalled();
      expect(component.siteSettingsForm.get('siteTitle')?.value).toBe(mockSiteSettings.siteTitle);
      expect(component.siteSettingsForm.get('maintenanceMode')?.value).toBe(mockSiteSettings.maintenanceMode);
    });

    it('should successfully update site settings', (done) => {
      const updates: Partial<SiteSettings> = {
        siteTitle: 'New Title',
        maintenanceMode: true
      };
      
      component.siteSettingsForm.patchValue(updates);
      settingsService.updateSettings.and.returnValue(of({ success: true }));
      
      component.updateSiteSettings();
      
      setTimeout(() => {
        expect(settingsService.updateSettings).toHaveBeenCalledWith(jasmine.objectContaining(updates));
        expect(toastrService.success).toHaveBeenCalledWith('Site settings updated successfully');
        expect(component.isLoadingSettings).toBe(false);
        done();
      }, 100);
    });

    it('should handle site settings update errors', (done) => {
      settingsService.updateSettings.and.returnValue(
        throwError({ error: { message: 'Update failed' } })
      );
      
      component.updateSiteSettings();
      
      setTimeout(() => {
        expect(toastrService.error).toHaveBeenCalledWith('Update failed');
        expect(component.isLoadingSettings).toBe(false);
        done();
      }, 100);
    });
  });

  describe('Contact Information (Admin)', () => {
    beforeEach(() => {
      component.isAdmin = true;
      component.siteSettings = mockSiteSettings;
    });

    it('should successfully update contact information', (done) => {
      const updates = {
        contactEmail: 'new@test.com',
        contactPhone: '+1111111111',
        facebook: 'https://facebook.com/new'
      };
      
      component.contactForm.patchValue(updates);
      settingsService.updateSettings.and.returnValue(of({ success: true }));
      
      component.updateContactInfo();
      
      setTimeout(() => {
        expect(settingsService.updateSettings).toHaveBeenCalledWith(
          jasmine.objectContaining({
            contactEmail: updates.contactEmail,
            contactPhone: updates.contactPhone
          })
        );
        expect(toastrService.success).toHaveBeenCalledWith('Contact information updated successfully');
        expect(component.isLoadingContact).toBe(false);
        done();
      }, 100);
    });

    it('should validate email format in contact form', () => {
      component.contactForm.patchValue({ contactEmail: 'invalid-email' });
      expect(component.contactForm.get('contactEmail')?.valid).toBe(false);
      
      component.contactForm.patchValue({ contactEmail: 'valid@email.com' });
      expect(component.contactForm.get('contactEmail')?.valid).toBe(true);
    });
  });

  describe('Helper Methods', () => {
    it('should get user initials correctly', () => {
      component.currentUser = { name: 'John Doe' };
      expect(component.getUserInitials()).toBe('JD');
      
      component.currentUser = { name: 'Alice' };
      expect(component.getUserInitials()).toBe('AL');
      
      component.currentUser = { name: '' };
      expect(component.getUserInitials()).toBe('?');
      
      component.currentUser = null;
      expect(component.getUserInitials()).toBe('?');
    });

    it('should get user role display correctly', () => {
      component.currentUser = { roles: ['admin'] };
      expect(component.getUserRole()).toBe('Administrator');
      
      component.currentUser = { roles: ['hod'] };
      expect(component.getUserRole()).toBe('Head of Department');
      
      component.currentUser = { roles: ['user'] };
      expect(component.getUserRole()).toBe('User');
      
      component.currentUser = { roles: [] };
      expect(component.getUserRole()).toBe('User');
    });
  });

  describe('Cancel Operations', () => {
    it('should reset profile form to original values', () => {
      component.currentUser = mockUser;
      component.profileForm.patchValue({ name: 'Changed Name' });
      
      component.cancelProfileChanges();
      
      expect(component.profileForm.get('name')?.value).toBe(mockUser.name);
    });

    it('should reset password form', () => {
      component.passwordForm.patchValue({
        currentPassword: 'test',
        newPassword: 'test123',
        confirmPassword: 'test123'
      });
      
      component.cancelPasswordChanges();
      
      expect(component.passwordForm.value).toEqual({
        currentPassword: null,
        newPassword: null,
        confirmPassword: null
      });
    });

    it('should reset site settings form to original values', () => {
      component.siteSettings = mockSiteSettings;
      component.siteSettingsForm.patchValue({ siteTitle: 'Changed Title' });
      
      component.cancelSettingsChanges();
      
      expect(component.siteSettingsForm.get('siteTitle')?.value).toBe(mockSiteSettings.siteTitle);
    });

    it('should reset contact form to original values', () => {
      component.siteSettings = mockSiteSettings;
      component.contactForm.patchValue({ contactEmail: 'changed@test.com' });
      
      component.cancelContactChanges();
      
      expect(component.contactForm.get('contactEmail')?.value).toBe(mockSiteSettings.contactEmail);
    });
  });

  describe('Form Validation', () => {
    it('should validate profile form requirements', () => {
      component.profileForm.patchValue({ name: '' });
      expect(component.profileForm.valid).toBe(false);
      
      component.profileForm.patchValue({ name: 'Valid Name' });
      expect(component.profileForm.valid).toBe(true);
    });

    it('should validate password form requirements', () => {
      // Empty form should be invalid
      expect(component.passwordForm.valid).toBe(false);
      
      // Password too short
      component.passwordForm.patchValue({
        currentPassword: 'old',
        newPassword: '123',
        confirmPassword: '123'
      });
      expect(component.passwordForm.valid).toBe(false);
      
      // Valid passwords
      component.passwordForm.patchValue({
        currentPassword: 'oldPassword',
        newPassword: 'newPassword123',
        confirmPassword: 'newPassword123'
      });
      expect(component.passwordForm.valid).toBe(true);
    });

    it('should validate bio max length', () => {
      const longBio = 'a'.repeat(501);
      component.profileForm.patchValue({ bio: longBio });
      expect(component.profileForm.get('bio')?.valid).toBe(false);
      
      const validBio = 'a'.repeat(500);
      component.profileForm.patchValue({ bio: validBio });
      expect(component.profileForm.get('bio')?.valid).toBe(true);
    });
  });

  describe('Loading States', () => {
    it('should manage loading state for profile update', () => {
      expect(component.isLoadingProfile).toBe(false);
      
      userService.updateOwnProfile.and.returnValue(of(mockUser));
      authService.refreshCurrentUser.and.returnValue(of(mockUser));
      
      component.updateProfile();
      expect(component.isLoadingProfile).toBe(true);
      
      fixture.whenStable().then(() => {
        expect(component.isLoadingProfile).toBe(false);
      });
    });

    it('should prevent multiple simultaneous profile updates', () => {
      component.isLoadingProfile = true;
      component.updateProfile();
      
      expect(userService.updateOwnProfile).not.toHaveBeenCalled();
    });

    it('should prevent multiple simultaneous password changes', () => {
      component.isLoadingPassword = true;
      component.updatePassword();
      
      expect(userService.changePassword).not.toHaveBeenCalled();
    });
  });
});