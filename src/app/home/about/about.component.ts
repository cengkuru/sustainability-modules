import { Component } from '@angular/core';
import {DatePipe, NgForOf} from "@angular/common";

@Component({
  selector: 'app-about',
  standalone: true,
    imports: [
        DatePipe,
        NgForOf
    ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {

}
