import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from "./home-routing.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxJsonViewerModule } from "ngx-json-viewer";
import {IntersectionObserverDirective} from "../directives/intersection-observer.directive";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxJsonViewerModule,
    IntersectionObserverDirective,
  ]
})
export class HomeModule { }
