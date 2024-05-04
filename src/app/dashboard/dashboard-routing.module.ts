// dashboard-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from "../core/guards/auth.guard";
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashLandingComponent } from './dash-landing/dash-landing.component';
import {SettingsComponent} from "./settings/settings.component";

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DashLandingComponent, pathMatch: 'full' },
      { path: 'settings', component: SettingsComponent },

    ]
  },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
