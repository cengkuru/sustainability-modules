import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Correct import
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import {IsLoadingComponent} from "./is-loading/is-loading.component";

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    IsLoadingComponent,
  ],
  imports: [
    CommonModule,
    RouterModule // Use RouterModule here
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    IsLoadingComponent
  ]
})
export class SharedModule { }
