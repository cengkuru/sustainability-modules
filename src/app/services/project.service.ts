import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from "rxjs/operators";
import {FlattenedProject} from "../home/models/flattened-project.model";

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    constructor(private firestore: AngularFirestore) {}

    getProjects(): Observable<any[]> {
        return this.firestore.collection('projects', ref => ref.orderBy('id')).snapshotChanges().pipe(
            map(actions => actions.map(a => {
                const data = a.payload.doc.data() as { [key: string]: any };
                const id = a.payload.doc.id;
                return { id, ...data };
            }))
        );
    }

    getProjectIds(): Observable<string[]> {
        return this.firestore.collection('projects').snapshotChanges().pipe(
            map(actions => actions.map(a => a.payload.doc.id))
        );
    }

    getProjectById(projectId: string): Observable<any> {
        return this.firestore.collection('projects', ref => ref.where('id', '==', projectId)).snapshotChanges().pipe(
            map(actions => {
                if (actions.length > 0) {
                    const data = actions[0].payload.doc.data() as { [key: string]: any };
                    const id = actions[0].payload.doc.id;
                    return { id, ...data };
                }
                return null;
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

    flattenProject(project: any): FlattenedProject {
        return {
            id: project.id,
            name: project.name,
            featured: project.featured,
            location: project.location?.name,
            coordinates: project.location?.coordinates,
            sector: project.stages?.identification?.basicData?.sectorSubsector,
            projectOwner: project.stages?.identification?.basicData?.projectOwner,
            projectReferenceNumber: project.stages?.identification?.basicData?.projectReferenceNumber,
            purpose: project.stages?.identification?.basicData?.purpose,
            description: project.stages?.identification?.basicData?.projectDescription,
            status: project.stages?.completion?.basicData?.projectStatus,
            completionDate: project.stages?.completion?.basicData?.completionDate,
            completionCost: project.stages?.completion?.basicData?.completionCost,

            identificationClimateObjective: project.stages?.identification?.climateFinanceData?.climateObjective,
            identificationAmountOfInvestment: project.stages?.identification?.climateFinanceData?.amountOfInvestment,

            preparationProjectBudget: project.stages?.preparation?.basicData?.projectBudget,
            preparationProjectBudgetApprovalDate: project.stages?.preparation?.basicData?.projectBudgetApprovalDate,
            preparationNumberOfBeneficiaries: project.stages?.preparation?.socialSustainabilityData?.numberOfBeneficiaries,
            preparationFundingSources: project.stages?.preparation?.basicData?.fundingSources,

            tenderContractType: project.stages?.tenderManagement?.basicData?.contractType,
            tenderProcurementMethod: project.stages?.tenderManagement?.basicData?.procurementMethod,
            tenderContractStatus: project.stages?.tenderManagement?.basicData?.contractStatus,
            tenderContractDuration: project.stages?.tenderManagement?.basicData?.contractDuration,
            tenderContractStartDate: project.stages?.tenderManagement?.basicData?.contractStartDate,
            tenderNumberOfFirmsTendering: project.stages?.tenderManagement?.basicData?.numberOfFirmsTendering,
            tenderCostEstimate: project.stages?.tenderManagement?.basicData?.costEstimate,
            tenderContractPrice: project.stages?.tenderManagement?.basicData?.contractPrice,

            implementationVariationToContractPrice: project.stages?.implementation?.basicData?.variationToContractPrice,
            implementationVariationToContractDuration: project.stages?.implementation?.basicData?.variationToContractDuration,
            implementationEscalationOfContractPrice: project.stages?.implementation?.basicData?.escalationOfContractPrice,
            implementationJobsGenerated: project.stages?.implementation?.socialSustainabilityData?.jobsGenerated,

            completionScopeAtCompletion: project.stages?.completion?.basicData?.scopeAtCompletion,
            completionProjectStatus: project.stages?.completion?.basicData?.projectStatus,

            maintenanceTypeOfWorks: project.stages?.operationsAndMaintenance?.basicData?.typeOfMaintenanceWorks,
            maintenanceScope: project.stages?.operationsAndMaintenance?.basicData?.maintenanceScope,
            maintenanceBudget: project.stages?.operationsAndMaintenance?.economicAndFinancialSustainabilityData?.budgetForMaintenance,

            decommissioningTypeOfWorks: project.stages?.decommissioning?.basicData?.typeOfMaintenanceWorks,
            decommissioningWorksDescription: project.stages?.decommissioning?.basicData?.worksDescription,
            decommissioningPeriod: project.stages?.decommissioning?.climateFinanceData?.decommissionPeriod,
            decommissioningCosts: project.stages?.decommissioning?.climateFinanceData?.decommissionCosts,

            dateCreated: project.metadata?.dateCreated,
            dateUpdated: project.metadata?.dateUpdated,
            version: project.metadata?.version
        };
    }


}
