import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterProjects'
})
export class FilterProjectsPipe implements PipeTransform {
  transform(projects: any[], phase: string): any[] {
    if (!phase) return projects;
    return projects.filter(project => project.phase === phase);
  }
}
