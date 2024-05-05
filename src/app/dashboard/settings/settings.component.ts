import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  displayNameForm: FormGroup;
  message: string = '';
  isLoading: boolean = false; // Loading indicator state
  userEmail$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null); // Corrected initialization

  constructor(private afAuth: AngularFireAuth, private fb: FormBuilder, private toastr: ToastrService) {
    this.displayNameForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userEmail$.next(user.email); // Correctly handle null values
        if (user.displayName) {
          this.displayNameForm.patchValue({ displayName: user.displayName });
        }
      } else {
        this.userEmail$.next(null); // Ensure null is assignable
      }
    });
  }

  updateDisplayName() {
    if (this.displayNameForm.valid) {
      this.isLoading = true; // Start loading
      const { displayName } = this.displayNameForm.value;
      this.afAuth.currentUser.then(user => {
        if (user) {
          user.updateProfile({ displayName }).then(() => {
            this.toastr.success('Display Name Updated Successfully!');
            this.isLoading = false; // Stop loading
          }).catch(error => {
            this.toastr.error('Error updating display name: ' + error.message);
            this.isLoading = false; // Stop loading if there is an error
          });
        }
      });
    }
  }
}
