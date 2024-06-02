import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent {
  contacts = [
    {
      title: 'CoST – the Infrastructure Transparency Initiative',
      email: 'CoST@infrastructuretransparency.org',
      phone: '+44 (0)20 8057 3052',
      address: '167-169 Great Portland Street, 5th Floor, London, W1W 5PF, UK'
    }
  ];
}
