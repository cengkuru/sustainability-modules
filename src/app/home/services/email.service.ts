import { Injectable } from '@angular/core';
import {AngularFireFunctions} from "@angular/fire/compat/functions";

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  constructor(private functions: AngularFireFunctions) { }

  sendEmail(email: string, subject: string, message: string) {
    const callable = this.functions.httpsCallable('sendEmail');
    return callable({ email: email, subject: subject, message: message }).toPromise();
  }
}
