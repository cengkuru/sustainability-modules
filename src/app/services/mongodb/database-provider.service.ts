import { Injectable, Inject, InjectionToken } from '@angular/core';
import { ProjectService } from '../project.service';
import { MongoProjectService } from './mongo-project.service';
import { environment } from '../../../environments/environment';

// Create injection token for the project service
export const PROJECT_SERVICE_TOKEN = new InjectionToken<any>('PROJECT_SERVICE');

// Factory function to choose between Firebase and MongoDB
export function projectServiceFactory(
  firebaseService: ProjectService,
  mongoService: MongoProjectService
) {
  return environment.useMongoDb ? mongoService : firebaseService;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseProviderService {
  constructor(
    @Inject(PROJECT_SERVICE_TOKEN) private projectService: any
  ) {}

  // Proxy methods to the appropriate service
  getProjects() {
    return this.projectService.getProjects();
  }

  getProjectIds() {
    return this.projectService.getProjectIds();
  }

  getProjectById(projectId: string) {
    return this.projectService.getProjectById(projectId);
  }

  getNextProject(currentProjectId: string) {
    return this.projectService.getNextProject(currentProjectId);
  }

  getPreviousProject(currentProjectId: string) {
    return this.projectService.getPreviousProject(currentProjectId);
  }

  getAllProjectIds() {
    return this.projectService.getAllProjectIds();
  }
} 