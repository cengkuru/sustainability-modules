import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { FlattenedProject } from "../../models/flattened-project.model";

@Injectable({
  providedIn: 'root'
})
export class MongoProjectService {
  private apiUrl = environment.mongodb.apiUrl;

  constructor(private http: HttpClient) {}

  // Reusing the same flattening logic from project.service.ts
  flattenProject(project: any): FlattenedProject {
    return {
      id: project.id || '',
      name: project.name || '',
      featured: project.featured || false,
      location: project.location?.name || '',
      coordinates: JSON.stringify({
        lat: project.location?.coordinates?.lat || 0,
        lng: project.location?.coordinates?.lng || 0
      }),
      sector: project.stages?.identification?.basicData?.sectorSubsector || '',
      projectOwner: project.stages?.identification?.basicData?.projectOwner || '',
      projectReferenceNumber: project.stages?.identification?.basicData?.projectReferenceNumber || '',
      purpose: project.stages?.identification?.basicData?.purpose || '',
      description: project.stages?.identification?.basicData?.projectDescription || '',
      status: project.stages?.completion?.basicData?.projectStatus || '',
      completionDate: project.stages?.completion?.basicData?.completionDate || '',
      completionCost: project.stages?.completion?.basicData?.completionCost || '',

      identificationClimateObjective: project.stages?.identification?.climateFinanceData?.climateObjective || '',
      identificationAmountOfInvestment: project.stages?.identification?.climateFinanceData?.amountOfInvestment || '',

      preparationProjectBudget: project.stages?.preparation?.basicData?.projectBudget || '',
      preparationProjectBudgetApprovalDate: project.stages?.preparation?.basicData?.projectBudgetApprovalDate || '',
      preparationNumberOfBeneficiaries: project.stages?.preparation?.socialSustainabilityData?.numberOfBeneficiaries || 0,
      preparationFundingSources: project.stages?.preparation?.basicData?.fundingSources || '',

      tenderContractType: project.stages?.tenderManagement?.basicData?.contractType || '',
      tenderProcurementMethod: project.stages?.tenderManagement?.basicData?.procurementMethod || '',
      tenderContractStatus: project.stages?.tenderManagement?.basicData?.contractStatus || '',
      tenderContractDuration: project.stages?.tenderManagement?.basicData?.contractDuration || '',
      tenderContractStartDate: project.stages?.tenderManagement?.basicData?.contractStartDate || '',
      tenderNumberOfFirmsTendering: project.stages?.tenderManagement?.basicData?.numberOfFirmsTendering || 0,
      tenderCostEstimate: project.stages?.tenderManagement?.basicData?.costEstimate || '',
      tenderContractPrice: project.stages?.tenderManagement?.basicData?.contractPrice || '',

      implementationVariationToContractPrice: project.stages?.implementation?.basicData?.variationToContractPrice || '',
      implementationVariationToContractDuration: project.stages?.implementation?.basicData?.variationToContractDuration || '',
      implementationEscalationOfContractPrice: project.stages?.implementation?.basicData?.escalationOfContractPrice || '',
      implementationJobsGenerated: project.stages?.implementation?.socialSustainabilityData?.jobsGenerated || 0,

      completionScopeAtCompletion: project.stages?.completion?.basicData?.scopeAtCompletion || '',
      completionProjectStatus: project.stages?.completion?.basicData?.projectStatus || '',

      maintenanceTypeOfWorks: project.stages?.operationsAndMaintenance?.basicData?.typeOfMaintenanceWorks || '',
      maintenanceScope: project.stages?.operationsAndMaintenance?.basicData?.maintenanceScope || '',
      maintenanceBudget: project.stages?.operationsAndMaintenance?.economicAndFinancialSustainabilityData?.budgetForMaintenance || '',

      decommissioningTypeOfWorks: project.stages?.decommissioning?.basicData?.typeOfMaintenanceWorks || '',
      decommissioningWorksDescription: project.stages?.decommissioning?.basicData?.worksDescription || '',
      decommissioningPeriod: project.stages?.decommissioning?.climateFinanceData?.decommissionPeriod || '',
      decommissioningCosts: project.stages?.decommissioning?.climateFinanceData?.decommissionCosts || '',

      dateCreated: project.metadata?.dateCreated || '',
      dateUpdated: project.metadata?.dateUpdated || '',
      version: project.metadata?.version || ''
    };
  }

  getProjects(): Observable<FlattenedProject[]> {
    return this.http.get<any[]>(`${this.apiUrl}/projects`).pipe(
      map(projects => projects.map(project => this.flattenProject(project)))
    );
  }

  getProjectIds(): Observable<string[]> {
    return this.http.get<any[]>(`${this.apiUrl}/projects`).pipe(
      map(projects => projects.map(project => project.id))
    );
  }

  getProjectById(projectId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/projects/${projectId}`);
  }

  getNextProject(currentProjectId: string): Observable<any> {
    return this.getProjects().pipe(
      map(projects => {
        const currentIndex = projects.findIndex(p => p.id === currentProjectId);
        return (currentIndex < projects.length - 1) ? projects[currentIndex + 1] : null;
      })
    );
  }

  getPreviousProject(currentProjectId: string): Observable<any> {
    return this.getProjects().pipe(
      map(projects => {
        const currentIndex = projects.findIndex(p => p.id === currentProjectId);
        return (currentIndex > 0) ? projects[currentIndex - 1] : null;
      })
    );
  }

  getAllProjectIds(): Observable<string[]> {
    return this.http.get<any[]>(`${this.apiUrl}/projects`).pipe(
      map(projects => projects.map(project => project.id))
    );
  }

  createProject(project: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/projects`, project);
  }

  updateProject(project: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/projects/${project.id}`, project);
  }

  deleteProject(projectId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/projects/${projectId}`);
  }
} 