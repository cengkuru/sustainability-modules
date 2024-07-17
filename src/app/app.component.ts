import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { firstValueFrom } from 'rxjs';
import {Policy} from "./core/models/polict.model";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private readonly policyDocId = 'current';
  private readonly policyCollectionName = 'policies';

  constructor(private http: HttpClient, private firestore: AngularFirestore) {}

  async ngOnInit(): Promise<void> {
    // await this.initializePolicyDataIfNeeded();
  }

  private async initializePolicyDataIfNeeded(): Promise<void> {
    try {
      const policyDoc = await firstValueFrom(this.firestore.collection(this.policyCollectionName).doc(this.policyDocId).get());

      if (!policyDoc.exists) {
        console.log('Policy data not found. Initializing...');
        await this.initializePolicyData();
      } else {
        console.log('Policy data already exists. Skipping initialization.');
      }
    } catch (error) {
      console.error('Error checking/initializing policy data:', error);
    }
  }

  private async initializePolicyData(): Promise<void> {
    try {
      const policyData: Policy[] = await firstValueFrom(this.http.get<Policy[]>('/assets/data/policy.json'));
      const policyObject = { sections: policyData }; // Wrap the array in an object
      await this.firestore.collection(this.policyCollectionName).doc(this.policyDocId).set(policyObject);
      console.log('Policy data successfully initialized in Firestore');
    } catch (error) {
      console.error('Error initializing policy data:', error);
      // Instead of throwing, we'll just log the error
      console.error('Detailed error:', JSON.stringify(error));
    }
  }
}
