import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { IsLoadingComponent } from "./is-loading/is-loading.component";
import {FormatSectionTitlePipe} from "../pipes/format-section-title.pipe";

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    IsLoadingComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    IsLoadingComponent
  ]
})
export class SharedModule { }
