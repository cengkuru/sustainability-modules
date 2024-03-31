import { Component } from '@angular/core';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  newModules = [
    {
      title: 'Economic and Financial',
      description: 'Get a clear picture of project costs, budgets, and long-term financial impacts.',
      dataPoints: '11 Data Points',
      icon: 'bi bi-cash-stack',
      url: 'economic',
      cardColor: 'bg-green-50'
    },
    {
      title: 'Environmental and Climate Resilience',
      description: 'Understand how projects affect nature, prepare for climate risks, and reduce environmental harm.',
      dataPoints: '11 Data Points',
      icon: 'bi bi-tree',
      url: 'environment',
      cardColor: 'bg-blue-50'
    },
    {
      title: 'Social Impact',
      description: 'Ensure projects benefit everyone, promote equality, and support local communities.',
      dataPoints: '12 Data Points',
      icon: 'bi bi-people-fill',
      url: 'social',
      cardColor: 'bg-purple-50'
    },
    {
      title: 'Institutional',
      description: 'Check if projects align with policies, identify integrity risks, and monitor progress.',
      dataPoints: '11 Data Points',
      icon: 'bi bi-building',
      url: 'institutional',
      cardColor: 'bg-yellow-50'
    },
    {
      title: 'Climate Finance',
      description: 'See how investments tackle climate change and make a positive impact.',
      dataPoints: '33 Data Points',
      icon: 'bi bi-cloud-sun',
      url: 'climate',
      cardColor: 'bg-orange-50'
    }
  ];



}
