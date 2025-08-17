import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Policy } from "./core/models/polict.model";
import { Project } from "./models/projects.model";
import { MigrationService } from "./services/migration.service";
import { environment } from '../environments/environment';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent implements OnInit {
  private readonly policyDocId = 'current';
  private readonly apiBaseUrl = environment.mongodb?.apiUrl || 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private migrationService: MigrationService
  ) {}

  async ngOnInit(): Promise<void> {
    // Since we've migrated to MongoDB, we'll disable the initialization steps
    // that were specific to Firebase
    console.log('Using MongoDB for data storage');
  }

  // Methods from Firebase implementation are commented out since they're no longer used
  /*
  private async initializePolicyDataIfNeeded(): Promise<void> {
    try {
      // This would need to be reimplemented using MongoDB
    } catch (error) {
      console.error('Error checking/initializing policy data:', error);
    }
  }

  private async initializePolicyData(): Promise<void> {
    try {
      const policyData: Policy[] = await firstValueFrom(this.http.get<Policy[]>('/assets/data/policy.json'));
      // This would need to be reimplemented using MongoDB
    } catch (error) {
      console.error('Error initializing policy data:', error);
    }
  }

  private async initializeProjectsData(): Promise<void> {
    try {
      // This would need to be reimplemented using MongoDB
    } catch (error) {
      console.error('Error initializing projects data:', error);
    }
  }

  async updateProjects() {
    // This would need to be reimplemented using MongoDB
  }
  */
}

