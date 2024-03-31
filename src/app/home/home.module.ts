import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingComponent } from './landing/landing.component';
import {HomeRoutingModule} from "./home-routing.module";
import { EconomicComponent } from './economic/economic.component';
import { SocialComponent } from './social/social.component';
import { EnvironmentComponent } from './environment/environment.component';
import { InstitutionalComponent } from './institutional/institutional.component';
import { ClimateComponent } from './climate/climate.component';



@NgModule({
  declarations: [
    LandingComponent,
    EconomicComponent,
    SocialComponent,
    EnvironmentComponent,
    InstitutionalComponent,
    ClimateComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule
  ]
})
export class HomeModule { }
