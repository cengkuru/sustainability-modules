import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  enableRegistration: boolean;
  enablePublicProjects: boolean;
  contactEmail: string;
  contactPhone?: string;
  contactAddress?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  analyticsId?: string;
  mapboxToken?: string;
  defaultLanguage: 'en' | 'pt';
  supportedLanguages: string[];
  projectSettings?: {
    requireApproval?: boolean;
    allowAttachments?: boolean;
    maxAttachmentSize?: number;
    allowedFileTypes?: string[];
  };
  emailSettings?: {
    enableNotifications?: boolean;
    notifyOnRegistration?: boolean;
    notifyOnProjectCreate?: boolean;
    notifyOnProjectUpdate?: boolean;
    adminEmails?: string[];
  };
  apiSettings?: {
    enableApi?: boolean;
    rateLimit?: number;
    requireApiKey?: boolean;
  };
  customFields?: Map<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private functionsUrl = environment.functions?.baseUrl || 'https://us-central1-mozambique-reports.cloudfunctions.net';
  private settingsCache$ = new BehaviorSubject<SiteSettings | null>(null);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Load settings on service initialization
    this.loadSettings();
  }

  // Load settings into cache
  private loadSettings(): void {
    this.getSettings().subscribe(
      settings => this.settingsCache$.next(settings),
      error => console.error('Failed to load site settings:', error)
    );
  }

  // Get cached settings as observable
  getCachedSettings(): Observable<SiteSettings | null> {
    return this.settingsCache$.asObservable();
  }

  // Get settings from server (public endpoint)
  getSettings(): Observable<SiteSettings> {
    return this.http.get<{success: boolean, data: SiteSettings}>(`${this.functionsUrl}/getSettings`).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data as SiteSettings;
        }
        throw new Error('Failed to load settings');
      }),
      tap(settings => this.settingsCache$.next(settings)),
      catchError(error => {
        console.error('Error fetching settings:', error);
        // Return default settings on error
        const defaultSettings: SiteSettings = {
          siteTitle: 'MOZ Portal',
          siteDescription: 'Ministry of Works and Transport - Infrastructure Transparency Portal',
          maintenanceMode: false,
          maintenanceMessage: 'Site is under maintenance. Please check back later.',
          enableRegistration: true,
          enablePublicProjects: true,
          contactEmail: 'info@moz.gov',
          defaultLanguage: 'en',
          supportedLanguages: ['en', 'pt']
        };
        return of(defaultSettings);
      })
    );
  }

  // Get full settings including sensitive data (admin only)
  getFullSettings(): Observable<SiteSettings> {
    return this.authService.getIdToken().pipe(
      switchMap(token => {
        if (!token) {
          return throwError('Authentication required');
        }
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
        return this.http.get<{success: boolean, data: SiteSettings}>(`${this.functionsUrl}/getFullSettings`, { headers });
      }),
      map(response => {
        if (response.success && response.data) {
          return response.data as SiteSettings;
        }
        throw new Error('Failed to load full settings');
      }),
      catchError(error => {
        console.error('Error fetching full settings:', error);
        return throwError(error);
      })
    );
  }

  // Update settings (admin only)
  updateSettings(updates: Partial<SiteSettings>): Observable<any> {
    return this.authService.getIdToken().pipe(
      switchMap(token => {
        if (!token) {
          return throwError('Authentication required');
        }
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
        return this.http.put<any>(`${this.functionsUrl}/updateSettings`, updates, { headers });
      }),
      tap(response => {
        if (response.success && response.data) {
          this.settingsCache$.next(response.data);
        }
      }),
      catchError(error => {
        console.error('Error updating settings:', error);
        return throwError(error);
      })
    );
  }

  // Reset settings to default (admin only)
  resetSettings(): Observable<any> {
    return this.authService.getIdToken().pipe(
      switchMap(token => {
        if (!token) {
          return throwError('Authentication required');
        }
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
        return this.http.post<any>(`${this.functionsUrl}/resetSettings`, {}, { headers });
      }),
      tap(response => {
        if (response.success && response.data) {
          this.settingsCache$.next(response.data);
        }
      }),
      catchError(error => {
        console.error('Error resetting settings:', error);
        return throwError(error);
      })
    );
  }

  // Helper methods for specific settings
  isMaintenanceMode(): Observable<boolean> {
    return this.getCachedSettings().pipe(
      map(settings => settings?.maintenanceMode || false)
    );
  }

  isRegistrationEnabled(): Observable<boolean> {
    return this.getCachedSettings().pipe(
      map(settings => settings?.enableRegistration !== false)
    );
  }

  getContactInfo(): Observable<{email: string, phone?: string, address?: string}> {
    return this.getCachedSettings().pipe(
      map(settings => ({
        email: settings?.contactEmail || 'info@moz.gov',
        phone: settings?.contactPhone,
        address: settings?.contactAddress
      }))
    );
  }

  getSupportedLanguages(): Observable<string[]> {
    return this.getCachedSettings().pipe(
      map(settings => settings?.supportedLanguages || ['en', 'pt'])
    );
  }

  getDefaultLanguage(): Observable<string> {
    return this.getCachedSettings().pipe(
      map(settings => settings?.defaultLanguage || 'en')
    );
  }

  // Refresh settings from server
  refreshSettings(): Observable<SiteSettings> {
    return this.getSettings();
  }
}