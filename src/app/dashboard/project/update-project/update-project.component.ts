import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
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




      this.updateProjectIdentificationForm = this.fb.group({
          name: ['', Validators.required],
          description: [''],
          startDate: [''],
          endDate: [''],
          scope: [''],
          purpose: [''],
          projectStatus: [''],
          type: [''],
          sector: [''],
          location: [''],
          longitude: [''],
          latitude: [''],
          address: [''],
          assetLifetime: [''],
          assetLifetimeStartDate: [''],
          assetLifetimeEndDate: [''],
          budgetAmount: [''],
          budgetCurrency: [''],
          fundingSources: this.fb.array([])

      });
      this.project$.subscribe(project => {
          if (project) {
              const projectData = {
                  name: project.name || '',
                  description: project.description || '',
                  startDate: project.phases.identification.startDate || '',
                  endDate: project.phases.identification.endDate || '',
                  scope: project.phases.identification.scope || '',
                  purpose: project.phases.identification.purpose || '',
                  projectStatus: project.phases.identification.projectStatus || '',
                  type: project.phases.identification.type || '',
                  sector: project.sector || '',
                  location: project.phases.identification.location.location || '',
                  longitude: project.phases.identification.location.longitude || '',
                  latitude: project.phases.identification.location.latitude || '',
                  address: project.phases.identification.location.address || '',
                  assetLifetime: project.phases.identification.assetLifetime.assetLifetime || '',
                  assetLifetimeStartDate: project.phases.identification.assetLifetime.startDate || '',
                  assetLifetimeEndDate: project.phases.identification.assetLifetime.endDate || '',
                  budgetAmount: project.phases.identification.budget.amount.value || '',
                  budgetCurrency: project.phases.identification.budget.amount.currency || ''
                  // Do not include fundingSources here yet
              };

              this.updateProjectIdentificationForm.patchValue(projectData); // Use patchValue instead of setValue

              // Clear and reinitialize fundingSources regardless of its presence in the data
              this.fundingSources.clear();
              if (project.funding && project.funding.sources && project.funding.sources.length) {
                  project.funding.sources.forEach((source: any) => {
                      this.addFundingSource(source);
                  });
              } else {
                  // Optionally, add a blank funding source or handle a scenario where no sources are available
                  // this.addFundingSource(); // Uncomment this if you need a blank item when no data is present
              }
              this.isLoading = false;
          }
      });


  }



    setActivePhase(phase: string) {
        this.activePhase = phase;
    }

    get fundingSources() {
        return this.updateProjectIdentificationForm.get('fundingSources') as FormArray;
    }

    addFundingSource(source?: any) {
        const fundingSourceForm = this.fb.group({
            name: [source ? source.name : '', Validators.required],
            amount: [source ? source.amount : '', Validators.required],
            currency: [source ? source.currency : '', Validators.required]
        });
        this.fundingSources.push(fundingSourceForm);
    }


    removeFundingSource(index: number) {
        this.fundingSources.removeAt(index);
    }



    onSubmit() {
        if (this.updateProjectIdentificationForm.valid) {
            const formData = this.updateProjectIdentificationForm.value;

            this.auth.currentUser.then(user => {
                if (user) {
                    // Extract only data values from fundingSources FormArray
                    const fundingSourcesData = this.fundingSources.controls.map(control => control.value);

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
                                purpose: formData.purpose,
                                location: {
                                    location: formData.location,
                                    longitude: formData.longitude,
                                    latitude: formData.latitude,
                                    address: formData.address
                                },
                                assetLifetime: {
                                    assetLifetime: formData.assetLifetime,
                                    startDate: formData.assetLifetimeStartDate,
                                    endDate: formData.assetLifetimeEndDate
                                },
                                budget:{
                                    amount: {
                                        value: formData.budgetAmount,
                                        currency: formData.budgetCurrency
                                    },
                                },
                                funding: {
                                    sources: fundingSourcesData  // Use cleaned data array
                                },
                                sustainability: {
                                    environmentalImpactAssessment: {
                                        summary: '',
                                        url: ''
                                    },
                                    socialImpactAssessment: {
                                        summary: '',
                                        url: ''
                                    },

                                },
                                stakeholderEngagement: {
                                    consultations: [],
                                    surveys: [],
                                    workshops: [],
                                },
                                publicAuthority:{
                                    name: '',
                                    role: '',
                                    contact: {
                                        name: '',
                                        title: '',
                                        email: '',
                                        phone: ''
                                    }
                                },
                                relatedProjects: [],

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
