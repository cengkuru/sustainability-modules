import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LandingComponent} from "./landing/landing.component";
import {EconomicComponent} from "./economic/economic.component";
import {SocialComponent} from "./social/social.component";
import {EnvironmentComponent} from "./environment/environment.component";
import {InstitutionalComponent} from "./institutional/institutional.component";
import {ClimateComponent} from "./climate/climate.component";
import {LoginComponent} from "./login/login.component";

const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
  },
  {
    path: 'economic',
    component: EconomicComponent
  },
  {
    path: 'social',
    component: SocialComponent

  },
  {
    path: 'environment',
    component: EnvironmentComponent
  },
  {
    path: 'institutional',
    component: InstitutionalComponent
  },
  {
    path: 'climate',
    component: ClimateComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
