import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProjectService } from '../../services/project.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

type DownloadFormat = 'json' | 'csv' | 'xlsx';

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

  dataFiles = [
    { id: 'project-overview', name: 'Project Overview' },
  ];

  downloadFormats: { type: DownloadFormat; label: string }[] = [
    { type: 'json', label: 'JSON' },
    { type: 'csv', label: 'CSV' },
    { type: 'xlsx', label: 'Excel' },
  ];

  constructor(
    private firestore: AngularFirestore,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    this.flattenedProjects$ = this.firestore.collection('projects').valueChanges().pipe(
      map(projects => projects.map(project => this.projectService.flattenProject(project)))
    );
  }

  async downloadFile(fileId: string, format: DownloadFormat) {
    this.downloading = true;
    this.error = null;
    try {
      const projects = await firstValueFrom(this.flattenedProjects$);
      
      switch (format) {
        case 'json':
          this.downloadData(JSON.stringify(projects, null, 2), `${fileId}.json`);
          break;
        case 'csv':
          this.downloadData(this.convertToCSV(projects), `${fileId}.csv`);
          break;
        case 'xlsx':
          this.downloadExcel(projects, `${fileId}.xlsx`);
          break;
        default:
          throw new Error('Unsupported format');
      }
    } catch (err) {
      console.error('Download error:', err);
      this.error = 'An error occurred during download. Please try again.';
    } finally {
      this.downloading = false;
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

  private downloadData(data: string | Blob, fileName: string): void {
    const blob = data instanceof Blob ? data : new Blob([data], { type: 'text/plain' });
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
