import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

interface ContactInfo {
  title: string;
  email: string;
  phone: string;
  address: string;
}

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

@Component({
    selector: 'app-feedback',
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],
    templateUrl: './feedback.component.html',
    styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {
  feedbackForm!: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError: string | null = null;

  contacts: ContactInfo[] = [
    {
      title: 'CoST – the Infrastructure Transparency Initiative',
      email: 'CoST@infrastructuretransparency.org',
      phone: '+44 (0)20 8057 3052',
      address: '167-169 Great Portland Street, 5th Floor, London, W1W 5PF, UK'
    }
  ];

  socialLinks: SocialLink[] = [
    { platform: 'Twitter', url: '#', icon: 'bi-twitter' },
    { platform: 'LinkedIn', url: '#', icon: 'bi-linkedin' },
    { platform: 'Facebook', url: '#', icon: 'bi-facebook' }
  ];

  supportHours = {
    days: 'Monday to Friday',
    hours: '9:00 AM - 5:00 PM GMT'
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.feedbackForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  async onSubmit() {
    if (this.feedbackForm.invalid) {
      Object.keys(this.feedbackForm.controls).forEach(key => {
        const control = this.feedbackForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success
      this.submitSuccess = true;
      this.feedbackForm.reset();
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        this.submitSuccess = false;
      }, 5000);
    } catch (error) {
      this.submitError = 'Failed to send message. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  getFieldError(fieldName: string): string {
    const control = this.feedbackForm.get(fieldName);
    if (control?.invalid && control?.touched) {
      if (control.errors?.['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (control.errors?.['email']) {
        return 'Please enter a valid email address';
      }
      if (control.errors?.['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is too short`;
      }
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.feedbackForm.get(fieldName);
    return !!control?.invalid && !!control?.touched;
  }
}
