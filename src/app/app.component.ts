import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom } from 'rxjs';
import {Policy} from "./core/models/polict.model";
import {Project} from "./models/projects.model";
import {MigrationService} from "./services/migration.service";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private readonly policyDocId = 'current';
  private readonly policyCollectionName = 'policies';
  private readonly projectsCollectionName = 'projects';

  constructor(
      private http: HttpClient,
      private firestore: AngularFirestore,
      private migrationService: MigrationService
  ) {
  }

  async ngOnInit(): Promise<void> {
    // await this.initializePolicyDataIfNeeded();
    await this.initializeProjectsData();

    /*this.migrationService.migrateProjects().subscribe(
        count => console.log(`Migration completed. ${count} projects migrated.`),
        error => console.error('Error during migration:', error)
    );*/

    // await this.updateProjects();
  }

  private async initializePolicyDataIfNeeded(): Promise<void> {
    try {
      const policyDoc = await firstValueFrom(this.firestore.collection(this.policyCollectionName).doc(this.policyDocId).get());

      if (!policyDoc.exists) {
        console.log('Policy data not found. Initializing...');
        await this.initializePolicyData();
      } else {
        console.log('Policy data already exists. Skipping initialization.');
      }
    } catch (error) {
      console.error('Error checking/initializing policy data:', error);
    }
  }

  private async initializePolicyData(): Promise<void> {
    try {
      const policyData: Policy[] = await firstValueFrom(this.http.get<Policy[]>('/assets/data/policy.json'));
      const policyObject = {sections: policyData}; // Wrap the array in an object
      await this.firestore.collection(this.policyCollectionName).doc(this.policyDocId).set(policyObject);
      console.log('Policy data successfully initialized in Firestore');
    } catch (error) {
      console.error('Error initializing policy data:', error);
      console.error('Detailed error:', JSON.stringify(error));
    }
  }

  private async initializeProjectsData(): Promise<void> {
    try {
      const projectsData = await firstValueFrom(this.http.get<{ projects: Project[] }>('/assets/data/projects.json'));

      if (projectsData.projects && Array.isArray(projectsData.projects)) {
        for (const project of projectsData.projects) {
          // Check if project exists
          const projectDoc = await firstValueFrom(
            this.firestore.collection(this.projectsCollectionName).doc(project.id).get()
          );

          if (projectDoc.exists) {
            // Update existing project
            await this.firestore.collection(this.projectsCollectionName).doc(project.id).update(project);
            console.log(`Project with ID ${project.id} successfully updated in Firestore`);
          } else {
            // Insert new project
            await this.firestore.collection(this.projectsCollectionName).doc(project.id).set(project);
            console.log(`Project with ID ${project.id} successfully added to Firestore`);
          }
        }
      } else {
        console.error('Invalid projects data format');
      }
    } catch (error) {
      console.error('Error initializing projects data:', error);
      console.error('Detailed error:', JSON.stringify(error));
    }
  }

  async updateProjects() {
    await this.migrationService.updateAllProjects();
    // After updating, you might want to reload your projects
    // this.loadProjects();
  }



}

