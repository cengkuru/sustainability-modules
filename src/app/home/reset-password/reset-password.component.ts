import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  resetToken = '';
  
  showPassword = false;
  showConfirmPassword = false;
  
  // Password validation flags
  hasMinLength = false;
  hasUpperCase = false;
  hasLowerCase = false;
  hasNumber = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator()
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Get reset token from URL query params
    this.route.queryParams.subscribe(params => {
      this.resetToken = params['token'] || '';
      if (!this.resetToken) {
        this.errorMessage = 'Invalid or missing reset token. Please request a new password reset.';
      }
    });

    // Watch password field for validation feedback
    this.resetPasswordForm.get('password')?.valueChanges.subscribe(value => {
      this.updatePasswordValidation(value);
    });
  }

  resetPassword(): void {
    if (this.resetPasswordForm.invalid || !this.resetToken) {
      this.markFormFieldsAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const newPassword = this.resetPasswordForm.get('password')?.value;

    this.authService.resetPassword(this.resetToken, newPassword).subscribe({
      next: () => {
        this.successMessage = 'Password reset successful! Redirecting to login...';
        this.resetPasswordForm.reset();
        setTimeout(() => {
          this.router.navigate(['/public/login']);
        }, 2000);
      },
      error: (error) => {
        this.handleError(error);
        this.isLoading = false;
      }
    });
  }

  private passwordStrengthValidator(): any {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);

      const passwordValid = hasUpperCase && hasLowerCase && hasNumber;

      if (!passwordValid) {
        return { passwordStrength: true };
      }
      return null;
    };
  }

  private passwordMatchValidator(group: AbstractControl): {[key: string]: any} | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    // Clear error if passwords match
    if (group.get('confirmPassword')?.errors?.['passwordMismatch']) {
      group.get('confirmPassword')?.setErrors(null);
    }
    
    return null;
  }

  private updatePasswordValidation(password: string): void {
    this.hasMinLength = password?.length >= 8;
    this.hasUpperCase = /[A-Z]/.test(password);
    this.hasLowerCase = /[a-z]/.test(password);
    this.hasNumber = /[0-9]/.test(password);
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  private handleError(error: any): void {
    if (error.status === 400) {
      this.errorMessage = 'Invalid or expired reset token. Please request a new password reset.';
    } else if (error.status === 404) {
      this.errorMessage = 'Reset token not found. Please request a new password reset.';
    } else {
      this.errorMessage = 'An error occurred. Please try again.';
    }
  }

  private markFormFieldsAsTouched(): void {
    Object.keys(this.resetPasswordForm.controls).forEach(key => {
      const control = this.resetPasswordForm.get(key);
      if (control?.invalid) {
        control.markAsTouched();
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.resetPasswordForm.get(fieldName);
    return !!field?.invalid && !!field?.touched;
  }

  getFieldError(fieldName: string): string {
    const field = this.resetPasswordForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName === 'confirmPassword' ? 'Password confirmation' : 'Password'} is required`;
      }
      if (field.errors['minlength']) {
        return 'Password must be at least 8 characters';
      }
      if (field.errors['passwordStrength']) {
        return 'Password must contain uppercase, lowercase, and numbers';
      }
      if (field.errors['passwordMismatch']) {
        return 'Passwords do not match';
      }
    }
    return '';
  }
}