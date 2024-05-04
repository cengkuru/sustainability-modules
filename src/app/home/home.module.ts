import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingComponent } from './landing/landing.component';
import {HomeRoutingModule} from "./home-routing.module";
import { EconomicComponent } from './economic/economic.component';
import { SocialComponent } from './social/social.component';
import { EnvironmentComponent } from './environment/environment.component';
import { InstitutionalComponent } from './institutional/institutional.component';
import { ClimateComponent } from './climate/climate.component';
import {LoginComponent} from "./login/login.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgxJsonViewerModule} from "ngx-json-viewer";



@NgModule({
  declarations: [
    LandingComponent,
    EconomicComponent,
    SocialComponent,
    EnvironmentComponent,
    InstitutionalComponent,
    ClimateComponent,
    LoginComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxJsonViewerModule,
  ]
})
export class HomeModule { }
