import { Component } from '@angular/core';
import {CommonModule} from "@angular/common";

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
    },
    {
      title: 'Open Contracting Partnership',
      email: 'engage@open-contracting.org',
      phone: '+1 (555) 905-2345',
      address: '1100 13th Street NW, Suite 800, 20005 Washington, D.C., USA'
    },
    {
      title: 'Deutsche Gesellschaft für Internationale Zusammenarbeit (GIZ) GmbH - Bonn Office',
      email: 'info@giz.de',
      phone: '+49 228 44 60-0',
      address: 'Friedrich-Ebert-Allee 32 + 36, 53113 Bonn'
    },
    {
      title: 'Deutsche Gesellschaft für Internationale Zusammenarbeit (GIZ) GmbH - Eschborn Office',
      email: 'info@giz.de',
      phone: '+49 6196 79-0',
      address: 'Dag-Hammarskjöld-Weg 1-5, 65760 Eschborn'
    }
  ];

  additionalContacts = [
    {
      title: 'Open Data Services Co-operative',
      email: 'contact@opendataservices.coop',
      phone: '',
      address: ''
    }
  ];

  feedbackChannels = [
    {
      title: 'CoST Feedback',
      email: 'CoST@infrastructuretransparency.org',
      phone: '+44 (0)20 8057 3052'
    },
    {
      title: 'OC4IDS Feedback',
      email: 'engage@open-contracting.org',
      phone: '+1 (555) 905-2345'
    }
  ];

  socialMediaChannels = [
    {
      platform: 'Github',
      icon: 'github',
      url: 'https://github.com'
    },
    {
      platform: 'Twitter',
      icon: 'twitter',
      url: 'https://twitter.com'
    },
    {
      platform: 'LinkedIn',
      icon: 'linkedin',
      url: 'https://linkedin.com'
    }
  ];
}
