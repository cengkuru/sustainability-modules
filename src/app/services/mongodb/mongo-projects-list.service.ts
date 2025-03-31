import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MongoProjectsListService {
  private apiBaseUrl = environment.mongodb?.apiUrl || 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  /**
   * Get all projects from the MongoDB API
   */
  getProjects(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiBaseUrl}/projects/user`, { headers })
      .pipe(
        map(projects => projects.map(project => ({
          ...project,
          key: project._id // Add a key property based on MongoDB _id
        }))),
        catchError(this.handleError<any[]>('getProjects', []))
      );
  }

  /**
   * Toggle a project's publish status
   */
  togglePublishStatus(projectId: string, currentStatus: boolean): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch<any>(
      `${this.apiBaseUrl}/projects/${projectId}/publish`, 
      {}, 
      { headers }
    ).pipe(
      catchError(this.handleError<any>('togglePublishStatus'))
    );
  }

  /**
   * Delete a project
   */
  deleteProject(projectId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete<any>(
      `${this.apiBaseUrl}/projects/${projectId}`, 
      { headers }
    ).pipe(
      catchError(this.handleError<any>('deleteProject'))
    );
  }

  createProject(project: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(
      `${this.apiBaseUrl}/projects`, 
      project,
      { headers }
    ).pipe(
      catchError(this.handleError<any>('createProject'))
    );
  }

  updateProject(projectId: string, projectData: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put<any>(
      `${this.apiBaseUrl}/projects/${projectId}`, 
      projectData,
      { headers }
    ).pipe(
      catchError(this.handleError<any>('updateProject'))
    );
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Handle Http operation that failed
   * Let the app continue
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      // Let the app keep running by returning an empty result
      return of(result as T);
    };
  }
} 