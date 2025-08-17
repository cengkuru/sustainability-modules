import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface User {
  _id?: string;
  uid: string;
  email: string;
  name: string;
  roles: string[];
  agency?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  preferences?: any;
  status: 'active' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  roles: string[];
  agency?: string;
}

export interface UpdateUserDto {
  name?: string;
  roles?: string[];
  agency?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateProfileDto {
  name?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  preferences?: any;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.functions?.baseUrl || 'https://us-central1-climatefinance-2dcc3.cloudfunctions.net';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getUsers(): Observable<User[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<{success: boolean; users: User[]; count: number}>(`${this.apiUrl}/users`, { headers }).pipe(
      map(response => response.users || []),
      catchError(this.handleError)
    );
  }

  getUserById(id: string): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.get<{success: boolean; user: User}>(`${this.apiUrl}/getUserProfile?userId=${id}`, { headers }).pipe(
      map(response => response.user),
      catchError(this.handleError)
    );
  }

  createUser(userData: CreateUserDto): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.post<{success: boolean; user: User}>(`${this.apiUrl}/users`, userData, { headers }).pipe(
      map(response => response.user),
      catchError(this.handleError)
    );
  }

  updateUser(id: string, updates: UpdateUserDto): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.put<{success: boolean; user: User}>(`${this.apiUrl}/updateUser?userId=${id}`, updates, { headers }).pipe(
      map(response => response.user),
      catchError(this.handleError)
    );
  }

  deleteUser(id: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<{success: boolean; message: string}>(`${this.apiUrl}/deleteUser?userId=${id}`, { headers }).pipe(
      map(() => void 0),
      catchError(this.handleError)
    );
  }

  updateOwnProfile(updates: UpdateProfileDto): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.put<{success: boolean; user: User}>(`${this.apiUrl}/updateOwnProfile`, updates, { headers }).pipe(
      map(response => response.user),
      catchError(this.handleError)
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{success: boolean; message: string}> {
    const headers = this.getAuthHeaders();
    return this.http.post<{success: boolean; message: string}>(
      `${this.apiUrl}/changePassword`, 
      { currentPassword, newPassword }, 
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
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
    
    console.error('UserService Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}