import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface Agency {
  _id?: string;
  name: string;
  code: string;
  description?: string;
  status: 'active' | 'inactive';
  address?: {
    streetAddress?: string;
    locality?: string;
    region?: string;
    postalCode?: string;
    countryName?: string;
  };
  contactInfo?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AgencyService {
  private functionsUrl = environment.functions?.baseUrl || 'https://us-central1-climatefinance-2dcc3.cloudfunctions.net';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Get all agencies (public endpoint)
  getAgencies(): Observable<Agency[]> {
    const headers = this.getHeaders();
    return this.http.get<{success: boolean, agencies: Agency[]}>(`${this.functionsUrl}/getAgencies`, { headers }).pipe(
      map(response => {
        if (response.success && response.agencies) {
          return response.agencies as Agency[];
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching agencies:', error);
        return of([]);
      })
    );
  }

  // Get single agency by ID
  getAgency(id: string): Observable<Agency | null> {
    const headers = this.getHeaders();
    return this.http.get<{success: boolean, agency: Agency}>(`${this.functionsUrl}/getAgency?agencyId=${id}`, { headers }).pipe(
      map(response => {
        if (response.success && response.agency) {
          return response.agency as Agency;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error fetching agency:', error);
        return of(null);
      })
    );
  }

  // Admin methods
  createAgency(agency: Partial<Agency>): Observable<Agency> {
    const headers = this.getAuthHeaders();
    return this.http.post<{success: boolean, agency: Agency}>(`${this.functionsUrl}/createAgency`, agency, { headers }).pipe(
      map(response => {
        if (response.success && response.agency) {
          return response.agency;
        }
        throw new Error('Failed to create agency');
      }),
      catchError(this.handleError)
    );
  }

  updateAgency(id: string, updates: Partial<Agency>): Observable<Agency> {
    const headers = this.getAuthHeaders();
    return this.http.put<{success: boolean, agency: Agency}>(`${this.functionsUrl}/updateAgency?agencyId=${id}`, updates, { headers }).pipe(
      map(response => {
        if (response.success && response.agency) {
          return response.agency;
        }
        throw new Error('Failed to update agency');
      }),
      catchError(this.handleError)
    );
  }

  deleteAgency(id: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<{success: boolean, message: string}>(`${this.functionsUrl}/deleteAgency?agencyId=${id}`, { headers }).pipe(
      map(() => void 0),
      catchError(this.handleError)
    );
  }

  // Get agency users
  getAgencyUsers(agencyId: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<{success: boolean, users: any[]}>(`${this.functionsUrl}/getAgencyUsers?agencyId=${agencyId}`, { headers }).pipe(
      map(response => response.users || []),
      catchError(this.handleError)
    );
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (token) {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status === 0) {
      errorMessage = 'Network error - please check your connection and try again';
    }
    
    console.error('AgencyService Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}