import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { TokenStorageService } from './token-storage.service';

export interface User {
  _id: string;
  email: string;
  name: string;
  role?: 'user' | 'admin'; // For backward compatibility
  roles?: string[]; // Array of roles from the backend
  phone?: string;
  bio?: string;
  avatar?: string;
  preferences?: any;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private apiBaseUrl = environment.mongodb?.apiUrl || 'http://localhost:3000/api';
  private functionsBaseUrl = environment.functions?.baseUrl;
  
  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenStorage: TokenStorageService
  ) { 
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const token = this.tokenStorage.getToken();
    const storedUser = this.tokenStorage.getUser();
    
    // Check if we have a valid token and user
    if (storedUser && token && !this.tokenStorage.isTokenExpired()) {
      this.currentUserSubject.next(storedUser as User);
      // Don't validate on load to avoid 401 errors with expired tokens
      // Token will be validated when making actual API calls
    } else if (token && this.tokenStorage.isTokenExpired()) {
      // Clear expired token and user data
      console.log('Token expired, clearing stored auth data');
      this.tokenStorage.clearAll();
      this.currentUserSubject.next(null);
    }
  }

  login(email: string, password: string): Observable<User> {
    // Always use Firebase authentication
    const key = environment.firebase?.apiKey;
    if (!key) {
      console.error('Firebase API key not configured');
      return of(null as any);
    }

    // Firebase signInWithPassword -> Cloud Function authExchange
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${key}`;
    return this.http.post<any>(url, { 
      email, 
      password, 
      returnSecureToken: true 
    }).pipe(
      map(res => res.idToken as string),
      tap((idToken) => {
        console.log('Firebase authentication successful');
        this.tokenStorage.setToken(idToken);
      }),
      switchMap((idToken) => {
        // Exchange Firebase token for MongoDB user profile
        const headers = new HttpHeaders({ 
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        });
        
        const functionsUrl = this.functionsBaseUrl || 'https://us-central1-climatefinance-2dcc3.cloudfunctions.net';
        return this.http.post<{success: boolean; user: User}>(
          `${functionsUrl}/authExchange`, 
          {}, 
          { headers }
        ).pipe(
          tap(response => {
            console.log('Auth exchange successful:', response);
            this.tokenStorage.setUser(response.user);
            this.currentUserSubject.next(response.user);
          }),
          map(response => response.user),
          catchError(error => {
            console.error('Auth exchange failed:', error);
            // If auth exchange fails, still allow login but with limited user info
            const basicUser: User = {
              _id: 'firebase-user',
              email: email,
              name: email.split('@')[0],
              roles: email === 'michael@cengkuru.com' ? ['admin'] : ['user'],
              createdAt: new Date()
            };
            this.tokenStorage.setUser(basicUser);
            this.currentUserSubject.next(basicUser);
            return of(basicUser);
          })
        );
      }),
      catchError(error => {
        console.error('Firebase authentication failed:', error);
        if (error.error?.error?.message) {
          console.error('Error details:', error.error.error.message);
        }
        return this.handleError<any>('login')(error);
      })
    );
  }

  register(name: string, email: string, password: string): Observable<User> {
    return this.http.post<{token: string, user: User}>(`${this.apiBaseUrl}/auth/register`, { name, email, password })
      .pipe(
        tap(response => {
          this.tokenStorage.setToken(response.token);
          this.tokenStorage.setUser(response.user);
          this.currentUserSubject.next(response.user);
        }),
        map(response => response.user),
        catchError(this.handleError<any>('register'))
      );
  }

  logout(): void {
    this.tokenStorage.clearAll();
    this.currentUserSubject.next(null);
    this.router.navigate(['/public/login']);
  }

  isLoggedIn(): boolean {
    return this.tokenStorage.isLoggedIn();
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    
    // Check both role and roles fields for backward compatibility
    if (user.role === 'admin') return true;
    if (user.roles && user.roles.includes('admin')) return true;
    
    return false;
  }

  getToken(): string | null {
    const token = this.tokenStorage.getToken();
    // Return null if token is expired
    if (token && this.tokenStorage.isTokenExpired()) {
      console.log('Token expired, clearing auth data');
      this.tokenStorage.clearAll();
      this.currentUserSubject.next(null);
      return null;
    }
    return token;
  }

  getIdToken(): Observable<string | null> {
    const token = this.getToken();
    return of(token);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  refreshCurrentUser(): Observable<User | null> {
    const token = this.tokenStorage.getToken();
    if (!token || this.tokenStorage.isTokenExpired()) {
      console.log('Token missing or expired, clearing auth');
      this.tokenStorage.clearAll();
      this.currentUserSubject.next(null);
      return of(null);
    }

    const headers = new HttpHeaders({ 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    const functionsUrl = this.functionsBaseUrl || 'https://us-central1-climatefinance-2dcc3.cloudfunctions.net';
    return this.http.post<{success: boolean; user: User}>(
      `${functionsUrl}/authExchange`, 
      {}, 
      { headers }
    ).pipe(
      map(response => {
        if (response.success && response.user) {
          this.tokenStorage.setUser(response.user);
          this.currentUserSubject.next(response.user);
          return response.user;
        }
        return null;
      }),
      catchError((error) => {
        // If we get a 401, clear auth and return null
        if (error.status === 401) {
          console.log('Token refresh failed with 401, clearing auth');
          this.tokenStorage.clearAll();
          this.currentUserSubject.next(null);
          return of(null);
        }
        // For other errors, keep current user data
        return of(this.currentUserSubject.value);
      })
    );
  }

  private validateAndRefreshUser(token: string): void {
    // Check if token is expired before making the request
    if (this.tokenStorage.isTokenExpired()) {
      console.log('Token expired, not attempting to refresh');
      this.tokenStorage.clearAll();
      this.currentUserSubject.next(null);
      return;
    }

    // Validate token and refresh user data in background
    const headers = new HttpHeaders({ 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    const functionsUrl = this.functionsBaseUrl || 'https://us-central1-climatefinance-2dcc3.cloudfunctions.net';
    this.http.post<{success: boolean; user: User}>(
      `${functionsUrl}/authExchange`, 
      {}, 
      { headers }
    ).subscribe({
      next: (response) => {
        if (response.success && response.user) {
          this.tokenStorage.setUser(response.user);
          this.currentUserSubject.next(response.user);
        }
      },
      error: (error) => {
        console.warn('Failed to refresh user data:', error);
        // If we get a 401, the token is likely expired
        if (error.status === 401) {
          console.log('Token validation failed, clearing auth data');
          this.tokenStorage.clearAll();
          this.currentUserSubject.next(null);
        }
      }
    });
  }

  validateToken(token: string): Observable<User | null> {
    // Validate token with backend
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<User>(`${this.apiBaseUrl}/auth/validate`, { headers }).pipe(
      tap(user => {
        if (user) {
          this.tokenStorage.setToken(token);
          this.tokenStorage.setUser(user);
          this.currentUserSubject.next(user);
        }
      }),
      catchError(() => {
        // Token invalid
        return of(null);
      })
    );
  }

  sendPasswordResetEmail(email: string): Observable<any> {
    // Use our custom Cloud Function for password reset
    const functionsUrl = this.functionsBaseUrl || 'https://us-central1-climatefinance-2dcc3.cloudfunctions.net';
    const url = `${functionsUrl}/sendPasswordReset`;
    
    console.log('Sending password reset request to Cloud Function for email:', email);
    
    return this.http.post(url, { email }).pipe(
      tap(response => {
        console.log('Password reset response:', response);
      }),
      catchError(error => {
        console.error('Password reset email failed:', error);
        console.error('Error details:', error.error);
        
        if (error.error?.error === 'EMAIL_NOT_FOUND') {
          return throwError(() => ({ 
            status: 404, 
            message: 'Email not found',
            error: error.error 
          }));
        }
        
        if (error.error?.error === 'INVALID_EMAIL') {
          return throwError(() => ({ 
            status: 400, 
            message: 'Invalid email format',
            error: error.error 
          }));
        }
        
        return throwError(() => error);
      })
    );
  }

  resetPassword(oobCode: string, newPassword: string): Observable<any> {
    // Use our custom Cloud Function for verifying reset token
    const functionsUrl = this.functionsBaseUrl || 'https://us-central1-climatefinance-2dcc3.cloudfunctions.net';
    const url = `${functionsUrl}/verifyResetToken`;
    
    return this.http.post(url, {
      token: oobCode,
      newPassword: newPassword
    }).pipe(
      catchError(error => {
        console.error('Password reset failed:', error);
        if (error.error?.error === 'INVALID_TOKEN' || error.error?.error === 'EXPIRED_TOKEN') {
          return throwError(() => ({ status: 400, message: 'Invalid or expired reset token' }));
        }
        return throwError(() => error);
      })
    );
  }

  private handleError<T>(operation = 'operation') {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(error as T);
    };
  }
} 