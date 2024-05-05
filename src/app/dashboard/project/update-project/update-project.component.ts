import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {AngularFireAuth} from "@angular/fire/compat/auth";

@Component({
  selector: 'app-update-project',
  templateUrl: './update-project.component.html',
  styleUrls: ['./update-project.component.scss']
})
export class UpdateProjectComponent implements OnInit {
  project$!: Observable<any>;
  projectId!: any;
  isLoading: boolean = true;
  phases: string[] = ['identification', 'preparation', 'implementation', 'completion', 'maintenance', 'decommissioning','cancelled'];
  activePhase: string | undefined;
  updateProjectIdentificationForm!: FormGroup;
    currentUser: any;


    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private db: AngularFireDatabase,
        private toastr: ToastrService,
        private auth: AngularFireAuth
    ) {}

  ngOnInit(): void {
      this.projectId = this.route.snapshot.paramMap.get('id');
      this.project$ = this.db.object(`/projects/${this.projectId}`).valueChanges();

      this.project$.subscribe(project => {
          if (project) {
              this.updateProjectIdentificationForm.setValue({
                  name: project.name || '',
                  description: project.description || '',
                  startDate: project.phases.identification.startDate || '',
                  endDate: project.phases.identification.endDate || '',
                  scope: project.phases.identification.scope || '',
                  purpose: project.phases.identification.purpose || '',
                  projectStatus: project.phases.identification.projectStatus || '',
                  type: project.phases.identification.type || '',
                  sector: project.sector || ''
              });
              this.isLoading = false;
          }
      });


      this.updateProjectIdentificationForm = this.fb.group({
          name: ['', Validators.required],
          description: [''],
          startDate: [''],
          endDate: [''],
          scope: [''],
          purpose: [''],
          projectStatus: [''],
          type: [''],
          sector: ['']
      });
  }



    setActivePhase(phase: string) {
        this.activePhase = phase;
    }


    updateProject(project: any) {
        this.isLoading = true;
        const path = `/projects/${this.projectId}`;
        this.db.object(path).update(project)
            .then(() => {
                this.isLoading = false;
                alert('Project updated successfully!');
            })
            .catch(err => {
                this.isLoading = false;
                alert('Error updating project: ' + err.message);
            });
    }


    onSubmit() {
        if (this.updateProjectIdentificationForm.valid) {
            const formData = this.updateProjectIdentificationForm.value;

            this.auth.currentUser.then(user => {
                if (user) {
                    const projectData = {
                        name: formData.name,
                        description: formData.description,
                        sector: formData.sector,
                        phases: {
                            identification: {
                                scope: formData.scope,
                                type: formData.type,
                                projectStatus: 'identification',
                                startDate: formData.startDate,
                                endDate: formData.endDate,
                                purpose: formData.purpose
                            }
                        },
                        lastUpdated: new Date().toISOString(),
                        updatedBy: user.email  // Using the email of the logged-in user
                    };

                    this.db.object(`/projects/${this.projectId}`).update(projectData)
                        .then(() => {
                            this.toastr.success('Project updated successfully!');
                            // Optionally navigate or perform further actions
                        })
                        .catch(error => {
                            this.toastr.error('Error updating project: ' + error.message);
                        });
                } else {
                    this.toastr.error('No user logged in.');
                }
            });
        } else {
            this.toastr.error('Please ensure all required fields are filled out correctly.');
        }
    }




}
