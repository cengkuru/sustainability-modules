import {Implementation} from "./implementation.model";
import {OperationsAndMaintenance} from "./operationandmaintenance.model";
import {Decommissioning} from "./decomissioning.model";
import {Preparation} from "./preparation.model";
import {TenderManagement} from "./tender-management.model";
import {Identification} from "./identification.model";
import {Completion} from "./completion.model";


export interface Metadata {
  dateUpdated: string;
  language: string;
  lastModifiedBy: string;
  changeLog: ChangeLog[];
  version: string;
  datePublished: string;
  dateCreated: string;
}

export interface ChangeLog {
  date: string;
  changedBy: string;
  change: string;
}



export interface Project {
  metadata: Metadata;
  location: Location;
  name: string;
  stages: {
    identification: Identification;
    preparation: Preparation;
    tenderManagement: TenderManagement;
    implementation: Implementation;
    operationsAndMaintenance: OperationsAndMaintenance;
    decommissioning: Decommissioning;
    completion: Completion;
  };
  id: string;
  featured: boolean;
  status: string;
  period: { // Add project time frame
    startDate: string;
    endDate: string;
  };
  budget: { // Add overall project budget information
    amount: number;
    currency: string;
  };
  parties: Party[]; // Add information about all parties involved
  relatedProjects: RelatedProject[]; // Add links to related projects
  documents: Document[]; // Add project-level documents
}

// New interfaces for added types
export interface Party {
  id: string;
  name: string;
  roles: string[];
}

export interface RelatedProject {
  id: string;
  relationship: string;
}





