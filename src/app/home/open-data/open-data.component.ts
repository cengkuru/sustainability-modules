import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-open-data',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './open-data.component.html',
  styleUrls: ['./open-data.component.scss']
})
export class OpenDataComponent implements OnInit {
  projects$: Observable<any[]>;

  constructor(private firestore: AngularFirestore) {
    this.projects$ = new Observable<any[]>(); // Initialize to an empty observable to avoid undefined issues
  }

  ngOnInit(): void {
    this.projects$ = this.firestore.collection('projects').snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as object;
          console.log('Data:', data);
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
    );
  }

  async downloadFile(format: string): Promise<void> {
    console.log('Downloading data in ' + format + ' format...');
    try {
      const projects = await lastValueFrom(this.projects$);
      console.log('Projects:', projects);
      if (!projects || projects.length === 0) {
        console.error('No project data available for download.');
        return;
      }

      let dataStr = '';
      let fileName = 'projects';

      switch (format) {
        case 'csv':
          dataStr = this.convertToCSV(projects);
          fileName += '.csv';
          break;
        case 'json':
          dataStr = JSON.stringify(projects, null, 2);
          fileName += '.json';
          break;
        case 'txt':
          dataStr = this.convertToTXT(projects);
          fileName += '.txt';
          break;
      }

      const blob = new Blob([dataStr], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading data:', error);
    }
  }

  private convertToCSV(data: any[]): string {
    console.log('Converting data to CSV format...', data);
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    return [headers, ...rows].join('\n');
  }

  private convertToTXT(data: any[]): string {
    if (!data || data.length === 0) return '';
    return data.map(row => JSON.stringify(row)).join('\n');
  }
}
