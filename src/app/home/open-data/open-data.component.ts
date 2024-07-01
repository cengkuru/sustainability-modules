import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ProjectService } from "../../services/project.service";
import {FlattenedProject} from "../../models/flattened-project.model";

@Component({
  selector: 'app-open-data',
  templateUrl: './open-data.component.html',
  styleUrls: ['./open-data.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class OpenDataComponent implements OnInit {
  flattenedProjects$!: Observable<FlattenedProject[]>;
  downloading = false;
  error: string | null = null;

  constructor(
      private firestore: AngularFirestore,
      private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.flattenedProjects$ = this.firestore.collection('projects').valueChanges().pipe(
        map(projects => projects.map(project => this.projectService.flattenProject(project)))
    );
  }

  async downloadFile(format: string): Promise<void> {
    this.downloading = true;
    this.error = null;
    console.log('Downloading data in ' + format + ' format...');

    try {
      const flattenedProjects = await firstValueFrom(this.flattenedProjects$);
      if (!flattenedProjects || flattenedProjects.length === 0) {
        throw new Error('No project data available for download.');
      }

      let dataStr = '';
      let fileName = 'projects';

      switch (format) {
        case 'csv':
          dataStr = this.convertToCSV(flattenedProjects);
          fileName += '.csv';
          break;
        case 'json':
          dataStr = JSON.stringify(flattenedProjects, null, 2);
          fileName += '.json';
          break;
        case 'txt':
          dataStr = this.convertToTXT(flattenedProjects);
          fileName += '.txt';
          break;
      }

      this.downloadData(dataStr, fileName);
    } catch (error) {
      console.error('Error downloading data:', error);
      this.error = 'An error occurred while downloading the data. Please try again.';
    } finally {
      this.downloading = false;
    }
  }

  private convertToCSV(data: FlattenedProject[]): string {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header as keyof FlattenedProject];
        if (typeof value === 'number') {
          return value.toString();
        }
        if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  private convertToTXT(data: FlattenedProject[]): string {
    if (!data || data.length === 0) return '';
    return data.map(row => JSON.stringify(row)).join('\n');
  }

  private downloadData(data: string, fileName: string): void {
    const blob = new Blob([data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
