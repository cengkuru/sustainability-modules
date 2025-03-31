// shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideBarComponent } from './side-bar/side-bar.component';
import { TopNavComponent } from './top-nav/top-nav.component';
import { ReactiveFormsModule } from "@angular/forms";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AdminLoaderComponent } from "./admin-loader/admin-loader.component";

@NgModule({
  declarations: [TopNavComponent, AdminLoaderComponent],
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink, 
    RouterLinkActive,
    SideBarComponent
  ],
  exports: [SideBarComponent, TopNavComponent, AdminLoaderComponent]
})
export class SharedModule {}
