import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LandingComponent} from "./landing/landing.component";
import {LoginComponent} from "./login/login.component";
import {IndexComponent} from "./index/index.component";
import {ProjectListComponent} from "./project-list/project-list.component";
import {AboutComponent} from "./about/about.component";
import {OpenDataComponent} from "./open-data/open-data.component";
import {FeedbackComponent} from "./feedback/feedback.component";
import {DataAnalysisComponent} from "./data-analysis/data-analysis.component";
import {ProjectDetailsComponent} from "./project-details/project-details.component";

const routes: Routes = [
    // public route with children

{
        path: '',
        component: IndexComponent,
        children: [
            { path: 'home', component: LandingComponent },
            { path: 'login', component: LoginComponent },
            { path: 'projects', component: ProjectListComponent },
            // project details route
            { path: 'projects/:id', component: ProjectDetailsComponent },
            // open-data route
            { path: 'downloads', component: OpenDataComponent },
            // feedback route
            { path: 'feedback', component: FeedbackComponent },
            // data-analytics route
            { path: 'data-analytics', component: DataAnalysisComponent },

            // about route
            { path: 'about', component: AboutComponent },
            { path: '', redirectTo: 'home', pathMatch: 'full' }
        ],

    },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
