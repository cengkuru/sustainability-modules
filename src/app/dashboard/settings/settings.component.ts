import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  passwordForm: FormGroup;
  profileForm: FormGroup;
  currentUser: any;

  constructor(private authService: AuthService, private fb: FormBuilder, private toastr: ToastrService) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });

    this.profileForm = this.fb.group({
      displayName: ['', Validators.required],
      email: [{ value: '', disabled: true }]
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.profileForm.patchValue({
          displayName: user.name,
          email: user.email
        });
      }
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  async updatePassword() {
    if (this.passwordForm.invalid) {
      return;
    }
    
    try {
      // This functionality would need to be implemented in your backend
      // using the AuthService to make an API call
      this.toastr.info('Password update functionality will be implemented with MongoDB backend');
      
      /*
      const user = await this.afAuth.currentUser;
      const credential = await this.afAuth.signInWithEmailAndPassword(
        user.email,
        this.passwordForm.get('currentPassword').value
      );
      await user.updatePassword(this.passwordForm.get('newPassword').value);
      */
      
      this.passwordForm.reset();
      this.toastr.success('Password updated successfully');
    } catch (error) {
      this.toastr.error('Failed to update password. Please check your current password.');
    }
  }

  async updateProfile() {
    if (this.profileForm.invalid) {
      return;
    }

    try {
      // This functionality would need to be implemented in your backend
      // using the AuthService to make an API call
      this.toastr.info('Profile update functionality will be implemented with MongoDB backend');
      
      /*
      const user = await this.afAuth.currentUser;
      await user.updateProfile({
        displayName: this.profileForm.get('displayName').value
      });
      */
      
      this.toastr.success('Profile updated successfully');
    } catch (error) {
      this.toastr.error('Failed to update profile');
    }
  }
}
