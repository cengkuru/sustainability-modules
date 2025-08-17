import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { UserService, UpdateProfileDto } from '../../services/user.service';
import { SettingsService, SiteSettings } from '../../services/settings.service';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    standalone: false
})
export class SettingsComponent implements OnInit {
  // Forms
  passwordForm: FormGroup;
  profileForm: FormGroup;
  siteSettingsForm: FormGroup;
  contactForm: FormGroup;
  
  // State
  currentUser: any;
  siteSettings: SiteSettings | null = null;
  isAdmin = false;
  activeTab: 'profile' | 'security' | 'site' | 'contact' = 'profile';
  
  // Loading states
  isLoadingProfile = false;
  isLoadingPassword = false;
  isLoadingSettings = false;
  isLoadingContact = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private settingsService: SettingsService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    // Initialize password form
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });

    // Initialize profile form
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      phone: [''],
      bio: ['', Validators.maxLength(500)]
    });

    // Initialize site settings form (admin only)
    this.siteSettingsForm = this.fb.group({
      siteTitle: ['', Validators.required],
      siteDescription: ['', Validators.required],
      maintenanceMode: [false],
      maintenanceMessage: [''],
      enableRegistration: [true],
      enablePublicProjects: [true],
      defaultLanguage: ['en']
    });

    // Initialize contact form (admin only)
    this.contactForm = this.fb.group({
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: [''],
      contactAddress: [''],
      facebook: [''],
      twitter: [''],
      linkedin: [''],
      youtube: ['']
    });
  }

  ngOnInit(): void {
    // Load current user
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.isAdmin = this.authService.isAdmin();
        
        // Update profile form
        this.profileForm.patchValue({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          bio: user.bio || ''
        });

        // Load site settings if admin
        if (this.isAdmin) {
          this.loadSiteSettings();
        }
      }
    });
  }

  // Tab switching
  switchTab(tab: 'profile' | 'security' | 'site' | 'contact'): void {
    if ((tab === 'site' || tab === 'contact') && !this.isAdmin) {
      this.toastr.warning('Admin access required');
      return;
    }
    this.activeTab = tab;
  }

  // Password match validator
  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  // Update user profile
  async updateProfile() {
    if (this.profileForm.invalid || this.isLoadingProfile) {
      return;
    }
    
    this.isLoadingProfile = true;
    const updates: UpdateProfileDto = {
      name: this.profileForm.get('name')?.value,
      phone: this.profileForm.get('phone')?.value,
      bio: this.profileForm.get('bio')?.value
    };

    this.userService.updateOwnProfile(updates)
      .pipe(finalize(() => this.isLoadingProfile = false))
      .subscribe({
        next: (user) => {
          // Update local user data
          this.authService.refreshCurrentUser().subscribe();
          this.toastr.success('Profile updated successfully');
        },
        error: (error) => {
          console.error('Profile update error:', error);
          this.toastr.error(error.error?.message || 'Failed to update profile');
        }
      });
  }

  // Change password
  async updatePassword() {
    if (this.passwordForm.invalid || this.isLoadingPassword) {
      return;
    }
    
    this.isLoadingPassword = true;
    const currentPassword = this.passwordForm.get('currentPassword')?.value;
    const newPassword = this.passwordForm.get('newPassword')?.value;

    this.userService.changePassword(currentPassword, newPassword)
      .pipe(finalize(() => this.isLoadingPassword = false))
      .subscribe({
        next: (response) => {
          this.passwordForm.reset();
          this.toastr.success('Password changed successfully');
        },
        error: (error) => {
          console.error('Password change error:', error);
          this.toastr.error(error.error?.message || 'Failed to change password');
        }
      });
  }

  // Load site settings
  loadSiteSettings(): void {
    this.isLoadingSettings = true;
    this.settingsService.getFullSettings()
      .pipe(finalize(() => this.isLoadingSettings = false))
      .subscribe({
        next: (settings) => {
          this.siteSettings = settings;
          
          // Update forms with current values
          this.siteSettingsForm.patchValue({
            siteTitle: settings.siteTitle,
            siteDescription: settings.siteDescription,
            maintenanceMode: settings.maintenanceMode,
            maintenanceMessage: settings.maintenanceMessage,
            enableRegistration: settings.enableRegistration,
            enablePublicProjects: settings.enablePublicProjects,
            defaultLanguage: settings.defaultLanguage
          });

          this.contactForm.patchValue({
            contactEmail: settings.contactEmail,
            contactPhone: settings.contactPhone,
            contactAddress: settings.contactAddress,
            facebook: settings.socialLinks?.facebook,
            twitter: settings.socialLinks?.twitter,
            linkedin: settings.socialLinks?.linkedin,
            youtube: settings.socialLinks?.youtube
          });
        },
        error: (error) => {
          console.error('Failed to load settings:', error);
          this.toastr.error('Failed to load site settings');
        }
      });
  }

  // Update site settings
  updateSiteSettings(): void {
    if (this.siteSettingsForm.invalid || this.isLoadingSettings) {
      return;
    }

    this.isLoadingSettings = true;
    const updates: Partial<SiteSettings> = this.siteSettingsForm.value;

    this.settingsService.updateSettings(updates)
      .pipe(finalize(() => this.isLoadingSettings = false))
      .subscribe({
        next: () => {
          this.toastr.success('Site settings updated successfully');
          this.loadSiteSettings(); // Reload to get latest
        },
        error: (error) => {
          console.error('Settings update error:', error);
          this.toastr.error(error.error?.message || 'Failed to update settings');
        }
      });
  }

  // Update contact information
  updateContactInfo(): void {
    if (this.contactForm.invalid || this.isLoadingContact) {
      return;
    }

    this.isLoadingContact = true;
    const formValues = this.contactForm.value;
    
    const updates: Partial<SiteSettings> = {
      contactEmail: formValues.contactEmail,
      contactPhone: formValues.contactPhone,
      contactAddress: formValues.contactAddress,
      socialLinks: {
        facebook: formValues.facebook,
        twitter: formValues.twitter,
        linkedin: formValues.linkedin,
        youtube: formValues.youtube
      }
    };

    this.settingsService.updateSettings(updates)
      .pipe(finalize(() => this.isLoadingContact = false))
      .subscribe({
        next: () => {
          this.toastr.success('Contact information updated successfully');
          this.loadSiteSettings(); // Reload to get latest
        },
        error: (error) => {
          console.error('Contact update error:', error);
          this.toastr.error(error.error?.message || 'Failed to update contact information');
        }
      });
  }

  // Get user initials for avatar
  getUserInitials(): string {
    if (!this.currentUser?.name) return '?';
    const parts = this.currentUser.name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase();
    }
    return this.currentUser.name.substring(0, 2).toUpperCase();
  }

  // Get user role display
  getUserRole(): string {
    if (!this.currentUser?.roles) return 'User';
    if (this.currentUser.roles.includes('admin')) return 'Administrator';
    if (this.currentUser.roles.includes('hod')) return 'Head of Department';
    return 'User';
  }

  // Cancel form changes
  cancelProfileChanges(): void {
    if (this.currentUser) {
      this.profileForm.patchValue({
        name: this.currentUser.name,
        phone: this.currentUser.phone || '',
        bio: this.currentUser.bio || ''
      });
    }
  }

  cancelPasswordChanges(): void {
    this.passwordForm.reset();
  }

  cancelSettingsChanges(): void {
    if (this.siteSettings) {
      this.siteSettingsForm.patchValue({
        siteTitle: this.siteSettings.siteTitle,
        siteDescription: this.siteSettings.siteDescription,
        maintenanceMode: this.siteSettings.maintenanceMode,
        maintenanceMessage: this.siteSettings.maintenanceMessage,
        enableRegistration: this.siteSettings.enableRegistration,
        enablePublicProjects: this.siteSettings.enablePublicProjects,
        defaultLanguage: this.siteSettings.defaultLanguage
      });
    }
  }

  cancelContactChanges(): void {
    if (this.siteSettings) {
      this.contactForm.patchValue({
        contactEmail: this.siteSettings.contactEmail,
        contactPhone: this.siteSettings.contactPhone,
        contactAddress: this.siteSettings.contactAddress,
        facebook: this.siteSettings.socialLinks?.facebook,
        twitter: this.siteSettings.socialLinks?.twitter,
        linkedin: this.siteSettings.socialLinks?.linkedin,
        youtube: this.siteSettings.socialLinks?.youtube
      });
    }
  }
}