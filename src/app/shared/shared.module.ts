import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { IsLoadingComponent } from "./is-loading/is-loading.component";
import {FormatSectionTitlePipe} from "../pipes/format-section-title.pipe";
import { LargeNumberFormatPipe } from './pipes/large-number-format.pipe';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    IsLoadingComponent,
    LargeNumberFormatPipe
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    IsLoadingComponent,
    LargeNumberFormatPipe
  ]
})
export class SharedModule { }
