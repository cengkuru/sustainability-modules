import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {Router} from "@angular/router";

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit {
  userName$!: Observable<string | null>;
  userEmail$!: Observable<string | null>;
  showDropdown: boolean = false;

  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  ngOnInit(): void {
    this.userName$ = this.afAuth.authState.pipe(
      map(user => {
        console.log('Firebase User:', user); // Console log the firebase user object
        return user ? user.displayName || 'No Name' : null;
      })
    );

    this.userEmail$ = this.afAuth.authState.pipe(
      map(user => user ? user.email : 'No Email')
    );
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  logout(): void {
    this.afAuth.signOut().then(() => {
      console.log('User logged out successfully');
      this.router.navigate(['/login']);  // Redirect to login or home page after logout
    }).catch(error => {
      console.error('Logout error:', error);
    });
  }
}
