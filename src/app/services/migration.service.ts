import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Service for handling data migration from legacy storage to MongoDB
 */
@Injectable({
    providedIn: 'root'
})
export class MigrationService {
    private apiBaseUrl = environment.mongodb?.apiUrl || 'http://localhost:3000/api';

    constructor(
        private http: HttpClient
    ) {}

    /**
     * Migration functionality disabled while transitioning to MongoDB
     */
    migrateProjects(): Observable<number> {
        console.log("Migration service called - no migration needed in MongoDB mode");
        return of(0);
    }

    /**
     * Update all projects - no longer using Firestore implementation
     */
    async updateAllProjects(): Promise<void> {
        console.log("Update all projects called - no action needed in MongoDB mode");
        return Promise.resolve();
    }
}
