import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Policy } from "../../models/policy.model";
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PolicyService {
    private functionsUrl = environment.functions?.baseUrl || 'https://us-central1-mozambique-reports.cloudfunctions.net';

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}

    // Get all policies (public endpoint with filtering)
    getPolicies(filters?: any): Observable<Policy[]> {
        return this.authService.getIdToken().pipe(
            switchMap(token => {
                const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
                const params = filters ? { params: filters } : {};
                return this.http.get<{success: boolean, data: any[]}>(`${this.functionsUrl}/getPolicies`, { headers, ...params });
            }),
            map(response => {
                if (response.success && response.data) {
                    return response.data as Policy[];
                }
                return [];
            }),
            catchError(error => {
                console.error('Error fetching policies:', error);
                return of([]);
            })
        );
    }

    // Get single policy by ID
    getPolicy(id?: string): Observable<Policy> {
        // If no ID provided, get the first published policy
        if (!id) {
            return this.getPolicies({ status: 'published', limit: 1 }).pipe(
                map(policies => {
                    if (policies && policies.length > 0) {
                        return policies[0];
                    } else {
                        throw new Error('No published policy found');
                    }
                })
            );
        }

        return this.authService.getIdToken().pipe(
            switchMap(token => {
                const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
                return this.http.get<{success: boolean, data: any}>(`${this.functionsUrl}/getPolicy?id=${id}`, { headers });
            }),
            map(response => {
                if (response.success && response.data) {
                    return response.data as Policy;
                }
                throw new Error('Policy not found');
            }),
            catchError(error => {
                console.error('Error fetching policy:', error);
                throw error;
            })
        );
    }

    // Admin methods
    createPolicy(policy: Policy): Observable<any> {
        return this.authService.getIdToken().pipe(
            switchMap(token => {
                if (!token) {
                    return throwError('Authentication required');
                }
                const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
                return this.http.post<any>(`${this.functionsUrl}/createPolicy`, policy, { headers });
            }),
            catchError(error => {
                console.error('Error creating policy:', error);
                return throwError(error);
            })
        );
    }

    updatePolicy(id: string, updates: Partial<Policy>): Observable<any> {
        return this.authService.getIdToken().pipe(
            switchMap(token => {
                if (!token) {
                    return throwError('Authentication required');
                }
                const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
                return this.http.put<any>(`${this.functionsUrl}/updatePolicy?id=${id}`, updates, { headers });
            }),
            catchError(error => {
                console.error('Error updating policy:', error);
                return throwError(error);
            })
        );
    }

    deletePolicy(id: string): Observable<any> {
        return this.authService.getIdToken().pipe(
            switchMap(token => {
                if (!token) {
                    return throwError('Authentication required');
                }
                const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
                return this.http.delete<any>(`${this.functionsUrl}/deletePolicy?id=${id}`, { headers });
            }),
            catchError(error => {
                console.error('Error deleting policy:', error);
                return throwError(error);
            })
        );
    }

    publishPolicy(id: string): Observable<any> {
        return this.authService.getIdToken().pipe(
            switchMap(token => {
                if (!token) {
                    return throwError('Authentication required');
                }
                const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
                return this.http.post<any>(`${this.functionsUrl}/publishPolicy?id=${id}`, {}, { headers });
            }),
            catchError(error => {
                console.error('Error publishing policy:', error);
                return throwError(error);
            })
        );
    }

    archivePolicy(id: string): Observable<any> {
        return this.authService.getIdToken().pipe(
            switchMap(token => {
                if (!token) {
                    return throwError('Authentication required');
                }
                const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
                return this.http.post<any>(`${this.functionsUrl}/archivePolicy?id=${id}`, {}, { headers });
            }),
            catchError(error => {
                console.error('Error archiving policy:', error);
                return throwError(error);
            })
        );
    }
}
