import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, switchMap } from "rxjs/operators";
import { FlattenedProject } from "../models/flattened-project.model";
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    private functionsUrl = environment.functions?.baseUrl || 'https://us-central1-mozambique-reports.cloudfunctions.net';

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}


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

    private flattenProjectOwner(projectOwner: any): string {
        if (typeof projectOwner === 'string') {
            return projectOwner;
        } else if (typeof projectOwner === 'object' && projectOwner !== null) {
            return JSON.stringify(projectOwner);
        }
        return '';
    }

    getProjects(): Observable<FlattenedProject[]> {
        return this.authService.getIdToken().pipe(
            switchMap(token => {
                const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
                return this.http.get<{success: boolean, data: any[]}>(`${this.functionsUrl}/getProjects`, { headers });
            }),
            map(response => {
                if (response.success && response.data) {
                    return response.data.map((project: any) => this.flattenProject(project));
                }
                return [];
            }),
            catchError(error => {
                console.error('Error fetching projects:', error);
                return of([]);
            })
        );
    }

    getProjectIds(): Observable<string[]> {
        return this.getProjects().pipe(
            map(projects => projects.map(p => p.id))
        );
    }

    getProjectById(projectId: string): Observable<any> {
        return this.authService.getIdToken().pipe(
            switchMap(token => {
                const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
                return this.http.get<{success: boolean, data: any}>(`${this.functionsUrl}/getProject?id=${projectId}`, { headers });
            }),
            map(response => {
                if (response.success && response.data) {
                    return response.data;
                }
                return null;
            }),
            catchError(error => {
                console.error('Error fetching project:', error);
                return of(null);
            })
        );
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

    // New method to get all project IDs
    getAllProjectIds(): Observable<string[]> {
        return this.getProjectIds();
    }

    // Admin methods
    createProject(project: any): Observable<any> {
        return this.authService.getIdToken().pipe(
            switchMap(token => {
                if (!token) {
                    return throwError(() => new Error('Authentication required'));
                }
                const headers = new HttpHeaders({ 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                });
                return this.http.post<any>(`${this.functionsUrl}/createProject`, project, { headers });
            }),
            catchError(error => {
                console.error('Error creating project:', error);
                return throwError(() => error);
            })
        );
    }

    updateProject(projectId: string, updates: any): Observable<any> {
        return this.authService.getIdToken().pipe(
            switchMap(token => {
                if (!token) {
                    return throwError(() => new Error('Authentication required'));
                }
                const headers = new HttpHeaders({ 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                });
                return this.http.put<any>(`${this.functionsUrl}/updateProject?id=${projectId}`, updates, { headers });
            }),
            catchError(error => {
                console.error('Error updating project:', error);
                return throwError(() => error);
            })
        );
    }

    deleteProject(projectId: string): Observable<any> {
        return this.authService.getIdToken().pipe(
            switchMap(token => {
                if (!token) {
                    return throwError(() => new Error('Authentication required'));
                }
                const headers = new HttpHeaders({ 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                });
                return this.http.delete<any>(`${this.functionsUrl}/deleteProject?id=${projectId}`, { headers });
            }),
            catchError(error => {
                console.error('Error deleting project:', error);
                return throwError(() => error);
            })
        );
    }

    publishProject(projectId: string): Observable<any> {
        return this.authService.getIdToken().pipe(
            switchMap(token => {
                if (!token) {
                    return throwError('Authentication required');
                }
                const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
                return this.http.post<any>(`${this.functionsUrl}/publishProject?id=${projectId}`, {}, { headers });
            }),
            catchError(error => {
                console.error('Error publishing project:', error);
                return throwError(error);
            })
        );
    }

    unpublishProject(projectId: string): Observable<any> {
        return this.authService.getIdToken().pipe(
            switchMap(token => {
                if (!token) {
                    return throwError('Authentication required');
                }
                const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
                return this.http.post<any>(`${this.functionsUrl}/unpublishProject?id=${projectId}`, {}, { headers });
            }),
            catchError(error => {
                console.error('Error unpublishing project:', error);
                return throwError(error);
            })
        );
    }



}
