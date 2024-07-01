import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ProjectService } from "../../services/project.service";
import {FlattenedProject} from "../../models/flattened-project.model";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
          this.downloadData(dataStr, fileName);
          break;
        case 'json':
          dataStr = JSON.stringify(flattenedProjects, null, 2);
          fileName += '.json';
          this.downloadData(dataStr, fileName);
          break;
        case 'txt':
          dataStr = this.convertToTXT(flattenedProjects);
          fileName += '.txt';
          this.downloadData(dataStr, fileName);
          break;
        case 'xlsx':
          fileName += '.xlsx';
          this.downloadExcel(flattenedProjects, fileName);
          break;
      }
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

  private downloadExcel(data: FlattenedProject[], fileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };

    // Styling
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4472C4" } },
      alignment: { horizontal: "center" }
    };

    // Apply styles to header row
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "1";
      if (!worksheet[address]) continue;
      worksheet[address].s = headerStyle;
    }

    // Auto-size columns
    const max_width = 50;
    const min_width = 10;
    const colWidths: number[] = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let max_length = min_width;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const address = XLSX.utils.encode_cell({c: C, r: R});
        if (!worksheet[address]) continue;
        const cell = worksheet[address];
        const value = cell.v || '';
        const length = value.toString().length;
        if (length > max_length) max_length = length;
      }
      colWidths[C] = max_length > max_width ? max_width : max_length;
    }
    worksheet['!cols'] = colWidths.map(w => ({width: w}));

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const excelData: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(excelData, fileName);
  }
}
