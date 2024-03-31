import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectListingComponent } from './project-listing/project-listing.component';
import { ProjectDetailsComponent } from './project-details/project-details.component';
import {ProjectRoutingModule} from "./project-routing.module";



@NgModule({
  declarations: [
    ProjectListingComponent,
    ProjectDetailsComponent
  ],
  imports: [
    CommonModule,
    ProjectRoutingModule
  ]
})
export class ProjectModule { }
