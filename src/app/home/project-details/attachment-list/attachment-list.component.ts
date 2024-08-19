import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from "@angular/common";
import { animate, style, transition, trigger } from "@angular/animations";

@Component({
  selector: 'app-attachment-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './attachment-list.component.html',
  styleUrl: './attachment-list.component.scss',
  animations: [
    trigger('fadeSlideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms cubic-bezier(0.2, 0.0, 0.0, 1.0)', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.2, 0.0, 0.0, 1.0)', style({ opacity: 0, transform: 'translateY(10px)' })),
      ]),
    ]),
  ],
})
export class AttachmentListComponent {
  @Input() attachments: any[] = [];

  getTooltipContent(attachment: any): string {
    return `
      Document Type: ${attachment.documentType}
      Format: ${attachment.format}
      Language: ${attachment.language}
      Pages: ${attachment.pages}
      Date Published: ${this.formatDate(attachment.datePublished)}
      Date Modified: ${this.formatDate(attachment.dateModified)}
    `;
  }

  private formatDate(date: string | Date): string {
    return new DatePipe('en-US').transform(date, 'mediumDate') || '';
  }
}
