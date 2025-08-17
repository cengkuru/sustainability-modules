import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';
  private readonly USER_ROLE_KEY = 'user_role';
  
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$: Observable<any> = this.currentUserSubject.asObservable();

  constructor() {
    // Initialize with stored user data
    const storedUser = this.getUser();
    if (storedUser) {
      this.currentUserSubject.next(storedUser);
    }
  }

  // Token management
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // User management
  getUser(): any {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        return null;
      }
    }
    return null;
  }

  setUser(user: any): void {
    if (user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      this.currentUserSubject.next(user);
    }
  }

  removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  // Role management
  getUserRole(): string | null {
    return localStorage.getItem(this.USER_ROLE_KEY);
  }

  setUserRole(role: string): void {
    localStorage.setItem(this.USER_ROLE_KEY, role);
  }

  removeUserRole(): void {
    localStorage.removeItem(this.USER_ROLE_KEY);
  }

  // Clear all auth data
  clearAll(): void {
    this.removeToken();
    this.removeUser();
    this.removeUserRole();
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      // Firebase ID tokens are JWTs, decode the payload
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      
      const payload = JSON.parse(atob(parts[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      
      // Add a 5 minute buffer to account for clock skew
      const buffer = 5 * 60 * 1000;
      return currentTime >= (expiryTime - buffer);
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true; // Treat as expired if we can't parse
    }
  }

  // Get current user observable
  getCurrentUser(): Observable<any> {
    return this.currentUser$;
  }

  // Update current user
  updateCurrentUser(user: any): void {
    this.setUser(user);
  }
}