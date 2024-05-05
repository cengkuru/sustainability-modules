// dashboard.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DashboardRoutingModule } from './dashboard-routing.module';

import { DashboardComponent } from './dashboard/dashboard.component';
import { DashLandingComponent } from './dash-landing/dash-landing.component';
import {SharedModule} from "./shared/shared.module";
import {SettingsComponent} from "./settings/settings.component";
import {RouterModule} from "@angular/router";
import {ProjectModule} from "./project/project.module";

@NgModule({
  declarations: [
    DashboardComponent,
    DashLandingComponent,
    SettingsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    ProjectModule,
    DashboardRoutingModule,
    RouterModule,
  ]
})
export class DashboardModule { }
