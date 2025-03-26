import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class MongoPolicyService {
  private apiUrl = environment.mongodb.apiUrl;

  constructor(private http: HttpClient) {}

  getPolicies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/policies`);
  }

  getPolicyById(policyId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/policies/${policyId}`);
  }

  createPolicy(policy: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/policies`, policy);
  }

  updatePolicy(policy: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/policies/${policy.id}`, policy);
  }

  deletePolicy(policyId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/policies/${policyId}`);
  }
} 