import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { VisualizationRoutingModule } from "./visualization-routing.module";
import {NgxEchartsModule} from "ngx-echarts";

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
    VisualizationRoutingModule
  ]
})
export class VisualizationModule { }

