import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';

import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

import {AppComponent} from "./app.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgxJsonViewerModule} from "ngx-json-viewer";
import {FilterProjectsPipe} from "./pipes/filter-projects.pipe";

@NgModule({
  declarations: [
    AppComponent,
    FilterProjectsPipe

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    CoreModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgxJsonViewerModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
