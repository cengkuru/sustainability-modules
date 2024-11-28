import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLang = new BehaviorSubject<string>('en');
  currentLang$ = this.currentLang.asObservable();

  constructor(private translate: TranslateService) {
    // Initialize
    translate.setDefaultLang('en');
    
    // Try to get language from localStorage
    const savedLang = localStorage.getItem('preferred_language');
    if (savedLang) {
      this.changeLanguage(savedLang);
    } else {
      // If no saved language, use browser language or default to English
      const browserLang = translate.getBrowserLang();
      this.changeLanguage(browserLang?.match(/en|es/) ? browserLang : 'en');
    }
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    this.currentLang.next(lang);
    localStorage.setItem('preferred_language', lang);
  }

  getCurrentLang(): string {
    return this.currentLang.getValue();
  }
}