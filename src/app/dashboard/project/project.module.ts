import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ProjectsListComponent} from "./projects-list/projects-list.component";
import {ProjectsEditComponent} from "./projects-edit/projects-edit.component";
import {ProjectsDetailsComponent} from "./projects-details/projects-details.component";
import {IndexProjectComponent} from "./index-project/index-project.component";
import {RouterOutlet} from "@angular/router";
import {ProjectRoutingModule} from "./project-routing.module";
import {SharedModule} from "../shared/shared.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AddProjectComponent} from "./add-project/add-project.component";
import {UpdateProjectComponent} from "./update-project/update-project.component";



@NgModule({
  declarations: [
      ProjectsListComponent,
      ProjectsEditComponent,
      ProjectsDetailsComponent,
      IndexProjectComponent,
      AddProjectComponent,
      UpdateProjectComponent
  ],
    imports: [
        CommonModule,
        RouterOutlet,
        ProjectRoutingModule,
        SharedModule,
        ReactiveFormsModule,
        FormsModule
    ]
})
export class ProjectModule { }
