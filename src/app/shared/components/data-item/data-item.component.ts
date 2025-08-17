import {Component, Input} from '@angular/core';
import {CommonModule} from "@angular/common";

@Component({
    selector: 'app-data-item',
    imports: [CommonModule],
    templateUrl: './data-item.component.html',
    styleUrl: './data-item.component.scss'
})
export class DataItemComponent {
  @Input() icon!: string;
  @Input() label!: string;
  @Input() value!: string;

}
