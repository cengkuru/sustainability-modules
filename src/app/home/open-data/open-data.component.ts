import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProjectService } from '../../services/project.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

type DownloadFormat = 'json' | 'csv' | 'xlsx';

interface DataFile {
  id: string;
  name: string;
  description: string;
  size?: string;
  lastModified?: Date;
  format: string;
  icon: string;
}

@Component({
  selector: 'app-open-data',
  templateUrl: './open-data.component.html',
  styleUrls: ['./open-data.component.scss'],
  imports: [CommonModule],
  standalone: true
})
export class OpenDataComponent implements OnInit {
  flattenedProjects$!: Observable<any[]>;
  downloading = false;
  error: string | null = null;
  lastUpdated: Date = new Date();
  downloadProgress: number = 0;

  dataFiles: DataFile[] = [
    {
      id: 'project-overview',
      name: 'Project Overview Dataset',
      description: 'Comprehensive dataset containing detailed project information, including locations, investments, and climate objectives.',
      size: '2.4 MB',
      lastModified: new Date(),
      format: 'Multiple formats available',
      icon: 'bi-file-earmark-text'
    }
  ];

  downloadFormats: { type: DownloadFormat; label: string; icon: string }[] = [
    { type: 'json', label: 'JSON', icon: 'bi-filetype-json' },
    { type: 'csv', label: 'CSV', icon: 'bi-filetype-csv' },
    { type: 'xlsx', label: 'Excel', icon: 'bi-file-earmark-spreadsheet' }
  ];

  constructor(
    private firestore: AngularFirestore,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    this.flattenedProjects$ = this.firestore.collection('projects').valueChanges().pipe(
      map(projects => projects.map(project => this.projectService.flattenProject(project)))
    );

    // Simulate periodic updates
    this.lastUpdated = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
  }

  async downloadFile(fileId: string, format: DownloadFormat) {
    this.downloading = true;
    this.error = null;
    this.downloadProgress = 0;

    try {
      const projects = await firstValueFrom(this.flattenedProjects$);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        if (this.downloadProgress < 90) {
          this.downloadProgress += Math.random() * 30;
        }
      }, 500);

      switch (format) {
        case 'json':
          this.downloadData(JSON.stringify(projects, null, 2), `${fileId}.json`, 'application/json');
          break;
        case 'csv':
          this.downloadData(this.convertToCSV(projects), `${fileId}.csv`, 'text/csv');
          break;
        case 'xlsx':
          this.downloadExcel(projects, `${fileId}.xlsx`);
          break;
        default:
          throw new Error('Unsupported format');
      }

      // Complete progress
      setTimeout(() => {
        clearInterval(progressInterval);
        this.downloadProgress = 100;
        setTimeout(() => {
          this.downloading = false;
          this.downloadProgress = 0;
        }, 500);
      }, 500);

    } catch (err) {
      console.error('Download error:', err);
      this.error = 'An error occurred during download. Please try again.';
      this.downloading = false;
      this.downloadProgress = 0;
    }
  }

  private convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  private downloadData(data: string | Blob, fileName: string, mimeType: string): void {
    const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private downloadExcel(data: any[], fileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const excelData: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(excelData, fileName);
  }
}
