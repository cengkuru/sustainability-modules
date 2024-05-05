// shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideBarComponent } from './side-bar/side-bar.component';
import { TopNavComponent } from './top-nav/top-nav.component';
import {ReactiveFormsModule} from "@angular/forms";
import {RouterLink} from "@angular/router";
import {AdminLoaderComponent} from "./admin-loader/admin-loader.component";

@NgModule({
  declarations: [SideBarComponent, TopNavComponent,AdminLoaderComponent],
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  exports: [SideBarComponent, TopNavComponent,AdminLoaderComponent] // Make sure to export the components
})
export class SharedModule {}
