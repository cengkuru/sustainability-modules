// dashboard-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ProjectsListComponent} from "./projects-list/projects-list.component";
import {IndexProjectComponent} from "./index-project/index-project.component";
import {AddProjectComponent} from "./add-project/add-project.component";
import {UpdateProjectComponent} from "./update-project/update-project.component";



const routes: Routes = [
    {
        path: 'projects',
        component: IndexProjectComponent,
        children: [
            { path: '', component: ProjectsListComponent, pathMatch: 'full' },
            { path: 'add', component: AddProjectComponent },
            { path: 'edit-project/:id', component: UpdateProjectComponent }

        ]
    },
    { path: '', pathMatch: 'full', redirectTo: 'projects' },
    { path: '**', redirectTo: 'projects' }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProjectRoutingModule { }