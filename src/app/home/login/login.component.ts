import { Component } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from "@angular/router";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../services/auth.service";

@Component({
    selector: 'app-login',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule
    ],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm!: FormGroup;
  errorMessage: string | null = null;
  isLoading: boolean = false;
  returnUrl: string = '/dashboard';
  showPassword: boolean = false;
  rememberMe: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.initializeForm();
    // Get return url from route parameters or default to '/dashboard'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  private initializeForm(): void {
    // Check for remembered session
    const rememberedSession = this.getRememberedSession();
    const rememberedEmail = rememberedSession?.email || '';
    
    if (rememberedSession && this.isSessionValid(rememberedSession)) {
      // Auto-login if valid session exists
      this.attemptAutoLogin(rememberedSession);
    }

    this.loginForm = this.fb.group({
      email: [rememberedEmail, [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      rememberMe: [!!rememberedEmail]
    });
  }

  private getRememberedSession(): any {
    const sessionData = localStorage.getItem('remembered_session');
    if (sessionData) {
      try {
        return JSON.parse(atob(sessionData));
      } catch {
        localStorage.removeItem('remembered_session');
        return null;
      }
    }
    return null;
  }

  private isSessionValid(session: any): boolean {
    if (!session || !session.expiry) return false;
    return new Date().getTime() < session.expiry;
  }

  private attemptAutoLogin(session: any): void {
    if (session.token) {
      // Verify token is still valid
      this.authService.validateToken(session.token).subscribe({
        next: (user) => {
          if (user) {
            this.router.navigateByUrl(this.returnUrl);
          }
        },
        error: () => {
          // Token invalid, clear session
          localStorage.removeItem('remembered_session');
        }
      });
    }
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.markFormFieldsAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const { email, password, rememberMe } = this.loginForm.value;
    
    this.authService.login(email, password).subscribe({
      next: (user) => {
        // Handle remember me
        if (rememberMe) {
          const sessionData = {
            email: email,
            token: this.authService.getToken(),
            expiry: new Date().getTime() + (30 * 24 * 60 * 60 * 1000) // 30 days
          };
          localStorage.setItem('remembered_session', btoa(JSON.stringify(sessionData)));
        } else {
          localStorage.removeItem('remembered_session');
        }
        
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (error) => {
        this.handleLoginError(error);
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private markFormFieldsAsTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      if (control?.invalid) {
        control.markAsTouched();
      }
    });
  }

  private handleLoginError(error: any): void {
    if (error.status === 401) {
      this.errorMessage = 'Invalid email or password. Please try again.';
    } else if (error.status === 404) {
      this.errorMessage = 'No account found with this email. Please check your email or sign up.';
    } else {
      this.errorMessage = 'An error occurred during sign in. Please try again.';
    }
  }

  // Form field validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!field?.invalid && !!field?.touched;
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email'] || field.errors['pattern']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return 'Password must be at least 6 characters long';
      }
    }
    return '';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onEnterKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.loginForm.valid) {
      this.login();
    }
  }
}
