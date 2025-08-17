import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations'; // Add this line

@Component({
    selector: 'app-attachment-list',
    imports: [CommonModule],
    templateUrl: './attachment-list.component.html',
    styleUrls: ['./attachment-list.component.scss'],
    animations: [
        trigger('fadeSlideInOut', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(10px)' }),
                animate('300ms cubic-bezier(0.25, 0.1, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
            ]),
            transition(':leave', [
                animate('300ms cubic-bezier(0.25, 0.1, 0.25, 1)', style({ opacity: 0, transform: 'translateY(10px)' })),
            ]),
        ]),
        trigger('stageAnimation', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(20px)' }),
                animate('300ms cubic-bezier(0.33, 1, 0.68, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
            ], { delay: '{{ delay }}' })
        ]),
        // Add other triggers as needed
    ]
})
export class AttachmentListComponent {
  @Input() attachments: any[] = []; // Initialize with an empty array
  tooltipVisible: boolean = false; // Initialize tooltip visibility

  public formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString();
  }

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

  toggleTooltip(event: MouseEvent): void {
    this.tooltipVisible = !this.tooltipVisible; // Toggle tooltip visibility
    event.stopPropagation(); // Prevent event from bubbling up
  }
}
