import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

/**
 * Firebase compatibility service to replace AngularFirestore
 * This service redirects all calls to MongoDB backend
 */
@Injectable({
  providedIn: 'root'
})
export class AngularFirestore {
  private apiUrl = environment.mongodb?.apiUrl || 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  collection(path: string, queryFn?: any) {
    return {
      valueChanges: () => {
        return this.http.get<any[]>(`${this.apiUrl}/${path}`);
      },
      snapshotChanges: () => {
        return this.http.get<any[]>(`${this.apiUrl}/${path}`).pipe(
          map(items => items.map(item => ({
            payload: {
              doc: {
                id: item._id || item.id,
                data: () => item
              }
            },
            type: 'added'
          })))
        );
      },
      get: () => {
        return this.http.get<any>(`${this.apiUrl}/${path}`).pipe(
          map(data => ({
            docs: Array.isArray(data) ? data.map(item => ({
              id: item._id || item.id,
              data: () => item,
              get: (field: string) => item[field]
            })) : [],
            forEach: (callback: any) => {
              if (Array.isArray(data)) {
                data.forEach(item => callback({
                  id: item._id || item.id,
                  data: () => item
                }));
              }
            }
          }))
        );
      },
      doc: (id: string) => ({
        set: (data: any) => this.http.post(`${this.apiUrl}/${path}/${id}`, data).toPromise(),
        update: (data: any) => this.http.put(`${this.apiUrl}/${path}/${id}`, data).toPromise(),
        delete: () => this.http.delete(`${this.apiUrl}/${path}/${id}`).toPromise(),
        valueChanges: () => this.http.get(`${this.apiUrl}/${path}/${id}`)
      })
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class AngularFireDatabase {
  private apiUrl = environment.mongodb?.apiUrl || 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  list(path: string) {
    return {
      valueChanges: () => this.http.get<any[]>(`${this.apiUrl}/${path}`),
      push: (data: any) => this.http.post(`${this.apiUrl}/${path}`, data).toPromise()
    };
  }

  object(path: string) {
    return {
      valueChanges: () => this.http.get(`${this.apiUrl}/${path}`),
      update: (data: any) => this.http.put(`${this.apiUrl}/${path}`, data).toPromise()
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class AngularFireAuth {
  constructor() {}

  get currentUser() {
    // Return a promise that resolves to a mock user or gets from localStorage
    const user = localStorage.getItem('current_user');
    return Promise.resolve(user ? JSON.parse(user) : null);
  }

  // Provide a user observable similar to AngularFireAuth v7
  private _user$ = new BehaviorSubject<any>(null);
  public get user(): Observable<any> {
    const stored = localStorage.getItem('current_user');
    const parsed = stored ? JSON.parse(stored) : null;
    this._user$.next(parsed);
    return this._user$.asObservable();
  }

  signInWithEmailAndPassword(email: string, password: string) {
    // This should be replaced with your actual auth logic
    const signedIn = { uid: '123', email };
    localStorage.setItem('current_user', JSON.stringify(signedIn));
    this._user$.next(signedIn);
    return Promise.resolve({ user: signedIn });
  }

  signOut() {
    localStorage.removeItem('current_user');
    this._user$.next(null);
    return Promise.resolve();
  }
}

@Injectable({
  providedIn: 'root'
})
export class AngularFireFunctions {
  constructor(private http: HttpClient) {}

  httpsCallable(name: string) {
    return (data: any) => {
      const apiUrl = environment.mongodb?.apiUrl || 'http://localhost:3000/api';
      return this.http.post(`${apiUrl}/functions/${name}`, data);
    };
  }
}

// Export a firebase compat namespace
export const firebase = {
  firestore: {
    DocumentData: class DocumentData {}
  }
};

// Re-export for compatibility
export { AngularFireAuth as AngularFireAuthCompat };
export { AngularFireDatabase as AngularFireDatabaseCompat };
export { AngularFireFunctions as AngularFireFunctionsCompat };