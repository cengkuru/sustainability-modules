import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ToastrService } from 'ngx-toastr';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.scss']
})
export class AddProjectComponent implements OnInit {
  projectForm!: FormGroup;
  pageTitle = 'Add Project';
  currentUser: any;

  constructor(
      private fb: FormBuilder,
      private db: AngularFireDatabase,
      private toastr: ToastrService,
      private auth: AngularFireAuth
  ) {}

  ngOnInit(): void {
    this.projectForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      startDate: ['', Validators.required],
      location: [''],
      budget: ['', Validators.pattern(/^\d+$/)],
      currency: ['USD', Validators.required],
      oc4id_id: [this.generateOc4id()],
      publishStatus: [false],
      createdBy: ['']
    });

    this.auth.user.pipe(
        map(user => {
          if (user) {
            this.currentUser = { uid: user.uid, email: user.email };
            this.projectForm.patchValue({ createdBy: this.currentUser });
          }
        })
    ).subscribe();
  }

  onSubmit() {
    if (this.projectForm.valid) {
      const newProjectRef = this.db.list('/projects').push(this.projectForm.value);
      newProjectRef.then(
          () => {
            this.toastr.success('Project added successfully!');
            this.projectForm.reset({ oc4id_id: this.generateOc4id(), publishStatus: false, createdBy: this.currentUser });
          },
          error => {
            this.toastr.error('Failed to add project: ' + error.message);
          }
      );
    } else {
      this.toastr.error('Please fill in all required fields correctly.');
    }
  }

  private generateOc4id(): string {
    const year = new Date().getFullYear();
    const randomLetters = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `oc4ids-${year}-${randomLetters}`;
  }
}
