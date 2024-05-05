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
import {ToastrModule} from "ngx-toastr";
import {IsLoadingComponent} from "../shared/is-loading/is-loading.component";

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
    DashboardRoutingModule,
    RouterModule,
    IsLoadingComponent
  ]
})
export class DashboardModule { }
