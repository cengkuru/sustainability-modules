import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {Policy} from "../models/polict.model";

@Injectable({
    providedIn: 'root'
})
export class PolicyService {
    private readonly collectionName = 'policies';

    constructor(private firestore: AngularFirestore) {}

    getPolicy(): Observable<Policy> {
        return this.firestore.collection(this.collectionName).doc<Policy>('current').valueChanges()
            .pipe(
                map(policy => {
                    if (policy) {
                        return policy;
                    } else {
                        throw new Error('Policy not found');
                    }
                })
            );
    }

    updatePolicy(policy: Policy): Promise<void> {
        return this.firestore.collection(this.collectionName).doc('current').set(policy);
    }

    // New method to initialize Firestore with policy data
    initializePolicyData(policyData: Policy): Promise<void> {
        return this.firestore.collection(this.collectionName).doc('current').set(policyData)
            .then(() => {
                console.log('Policy data successfully initialized in Firestore');
            })
            .catch((error) => {
                console.error('Error initializing policy data:', error);
                throw error;
            });
    }

    // Additional methods for creating, deleting, or managing multiple policies could be added here
}
