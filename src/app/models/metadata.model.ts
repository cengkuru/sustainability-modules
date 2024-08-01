import {ChangeLog} from "./changelog.model";

export interface Metadata {
    dateUpdated: string;
    language: string;
    lastModifiedBy: string;
    changeLog: ChangeLog[];
    version: string;
    datePublished: string;
    dateCreated: string;
}
