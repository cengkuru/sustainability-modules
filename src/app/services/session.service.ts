import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

export interface SessionConfig {
  sessionTimeout: number; // in minutes
  warningTime: number; // minutes before timeout to show warning
  autoExtend: boolean; // auto-extend session on activity
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly SESSION_TIMEOUT_KEY = 'session_timeout';
  private readonly LAST_ACTIVITY_KEY = 'last_activity';
  private readonly SESSION_CONFIG_KEY = 'session_config';
  
  private sessionTimer: any;
  private warningTimer: any;
  private activityMonitor: any;
  
  private sessionWarningSubject = new BehaviorSubject<boolean>(false);
  public sessionWarning$ = this.sessionWarningSubject.asObservable();
  
  private timeRemainingSubject = new BehaviorSubject<number>(0);
  public timeRemaining$ = this.timeRemainingSubject.asObservable();
  
  private defaultConfig: SessionConfig = {
    sessionTimeout: 30, // 30 minutes default
    warningTime: 5, // 5 minutes before timeout
    autoExtend: true
  };
  
  private currentConfig: SessionConfig;
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentConfig = this.loadConfig();
    this.initializeSession();
    this.setupActivityMonitoring();
  }
  
  private loadConfig(): SessionConfig {
    const stored = localStorage.getItem(this.SESSION_CONFIG_KEY);
    if (stored) {
      try {
        return { ...this.defaultConfig, ...JSON.parse(stored) };
      } catch {
        return this.defaultConfig;
      }
    }
    return this.defaultConfig;
  }
  
  private initializeSession(): void {
    // Check if user is logged in
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.startSession();
      } else {
        this.clearSession();
      }
    });
  }
  
  private setupActivityMonitoring(): void {
    if (this.currentConfig.autoExtend) {
      // Monitor user activity
      const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
      events.forEach(event => {
        document.addEventListener(event, () => this.updateActivity(), { passive: true });
      });
    }
  }
  
  private updateActivity(): void {
    const now = Date.now();
    const lastActivity = this.getLastActivity();
    
    // Only update if more than 1 minute has passed since last update
    if (now - lastActivity > 60000) {
      localStorage.setItem(this.LAST_ACTIVITY_KEY, now.toString());
      
      // Reset timers if auto-extend is enabled and user is active
      if (this.currentConfig.autoExtend && this.authService.isLoggedIn()) {
        this.resetSessionTimers();
      }
    }
  }
  
  private getLastActivity(): number {
    const stored = localStorage.getItem(this.LAST_ACTIVITY_KEY);
    return stored ? parseInt(stored, 10) : Date.now();
  }
  
  public startSession(): void {
    this.resetSessionTimers();
    localStorage.setItem(this.LAST_ACTIVITY_KEY, Date.now().toString());
    
    // Set session timeout
    const timeoutMs = this.currentConfig.sessionTimeout * 60 * 1000;
    const warningMs = (this.currentConfig.sessionTimeout - this.currentConfig.warningTime) * 60 * 1000;
    
    // Warning timer
    this.warningTimer = setTimeout(() => {
      this.showSessionWarning();
    }, warningMs);
    
    // Session timeout timer
    this.sessionTimer = setTimeout(() => {
      this.sessionExpired();
    }, timeoutMs);
    
    // Start countdown timer for remaining time
    this.startCountdown();
  }
  
  private startCountdown(): void {
    if (this.activityMonitor) {
      clearInterval(this.activityMonitor);
    }
    
    this.activityMonitor = interval(1000).subscribe(() => {
      const lastActivity = this.getLastActivity();
      const now = Date.now();
      const elapsed = now - lastActivity;
      const timeoutMs = this.currentConfig.sessionTimeout * 60 * 1000;
      const remaining = Math.max(0, timeoutMs - elapsed);
      
      this.timeRemainingSubject.next(Math.floor(remaining / 1000));
      
      // Check if we should show warning
      const warningThreshold = this.currentConfig.warningTime * 60 * 1000;
      if (remaining <= warningThreshold && remaining > 0) {
        this.sessionWarningSubject.next(true);
      }
    });
  }
  
  private showSessionWarning(): void {
    this.sessionWarningSubject.next(true);
  }
  
  public extendSession(): void {
    this.sessionWarningSubject.next(false);
    this.resetSessionTimers();
    localStorage.setItem(this.LAST_ACTIVITY_KEY, Date.now().toString());
  }
  
  private resetSessionTimers(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
    }
    
    this.sessionWarningSubject.next(false);
    this.startSession();
  }
  
  private sessionExpired(): void {
    this.clearSession();
    this.authService.logout();
    this.router.navigate(['/public/login'], {
      queryParams: { 
        sessionExpired: true,
        returnUrl: this.router.url
      }
    });
  }
  
  private clearSession(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
    }
    if (this.activityMonitor) {
      this.activityMonitor.unsubscribe();
    }
    
    localStorage.removeItem(this.LAST_ACTIVITY_KEY);
    this.sessionWarningSubject.next(false);
    this.timeRemainingSubject.next(0);
  }
  
  public updateConfig(config: Partial<SessionConfig>): void {
    this.currentConfig = { ...this.currentConfig, ...config };
    localStorage.setItem(this.SESSION_CONFIG_KEY, JSON.stringify(this.currentConfig));
    
    // Restart session with new config
    if (this.authService.isLoggedIn()) {
      this.resetSessionTimers();
    }
  }
  
  public getConfig(): SessionConfig {
    return { ...this.currentConfig };
  }
  
  public getFormattedTimeRemaining(): string {
    const seconds = this.timeRemainingSubject.value;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${seconds} seconds`;
  }
  
  // Check if token is expired (for JWT tokens)
  public isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp;
      if (expiry) {
        return Date.now() >= expiry * 1000;
      }
    } catch {
      // Invalid token format
      return true;
    }
    return false;
  }
  
  // Validate current session
  public validateSession(): boolean {
    const token = this.authService.getToken();
    if (!token) {
      return false;
    }
    
    // For Firebase tokens, we can't decode them client-side
    // So we rely on activity-based timeout
    const lastActivity = this.getLastActivity();
    const now = Date.now();
    const elapsed = now - lastActivity;
    const timeoutMs = this.currentConfig.sessionTimeout * 60 * 1000;
    
    if (elapsed > timeoutMs) {
      this.sessionExpired();
      return false;
    }
    
    return true;
  }
}