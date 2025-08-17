import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]]
    });
  }

  sendResetEmail(): void {
    if (this.forgotPasswordForm.invalid) {
      this.markFormFieldsAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const email = this.forgotPasswordForm.get('email')?.value;
    console.log('Attempting to send password reset email to:', email);

    this.authService.sendPasswordResetEmail(email).subscribe({
      next: (response) => {
        console.log('Password reset email sent successfully:', response);
        this.successMessage = 'Password reset email sent! Please check your inbox and spam folder.';
        this.forgotPasswordForm.reset();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Password reset email failed:', error);
        this.handleError(error);
        this.isLoading = false;
      }
    });
  }

  private handleError(error: any): void {
    console.error('Error details:', error);
    
    if (error.status === 404 || error.message === 'Email not found') {
      this.errorMessage = 'No account found with this email address.';
    } else if (error.status === 429) {
      this.errorMessage = 'Too many requests. Please try again later.';
    } else if (error.error?.error?.message === 'EMAIL_NOT_FOUND') {
      this.errorMessage = 'No account found with this email address. Please check the email and try again.';
    } else if (error.error?.error?.message === 'INVALID_EMAIL') {
      this.errorMessage = 'The email address is invalid. Please check and try again.';
    } else if (error.message?.includes('Firebase API key not configured')) {
      this.errorMessage = 'Password reset service is temporarily unavailable. Please contact support.';
    } else {
      this.errorMessage = `An error occurred: ${error.error?.error?.message || error.message || 'Please try again.'}`;
    }
  }

  private markFormFieldsAsTouched(): void {
    Object.keys(this.forgotPasswordForm.controls).forEach(key => {
      const control = this.forgotPasswordForm.get(key);
      if (control?.invalid) {
        control.markAsTouched();
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.forgotPasswordForm.get(fieldName);
    return !!field?.invalid && !!field?.touched;
  }

  getFieldError(fieldName: string): string {
    const field = this.forgotPasswordForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return 'Email is required';
      }
      if (field.errors['email'] || field.errors['pattern']) {
        return 'Please enter a valid email address';
      }
    }
    return '';
  }
}