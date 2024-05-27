import { Component } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule  // Import ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']  // Corrected to styleUrls
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;
  errorMessage: string | null = null;
  isLoading: boolean = false;

  constructor(
      public auth: AngularFireAuth,
      private router: Router,
      private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  login() {
    this.submitted = true;
    this.isLoading = true;  // Start loading
    if (this.loginForm.invalid) {
      this.isLoading = false;  // Stop loading if form is invalid
      return;
    }

    const { email, password } = this.loginForm.value;
    this.auth.signInWithEmailAndPassword(email, password)
        .then(() => {
          this.router.navigate(['/dashboard']);
          this.isLoading = false;  // Stop loading on success
        })
        .catch(error => {
          this.errorMessage = error.code === 'auth/wrong-password' ? 'Incorrect password, please try again.' : 'Login failed, please try again.';
          this.isLoading = false;  // Stop loading on failure
        });
  }
}
