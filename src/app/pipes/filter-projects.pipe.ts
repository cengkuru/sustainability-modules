import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterProjects'
})
export class FilterProjectsPipe implements PipeTransform {
  transform(projects: any[], phase: string | null): any[] {
    if (!phase || !projects) return projects;
    return projects.filter(project => project.phase?.toLowerCase() === phase.toLowerCase());
  }
}
