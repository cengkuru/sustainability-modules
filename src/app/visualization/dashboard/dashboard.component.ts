import {Component, Inject, OnInit, ViewChild} from '@angular/core';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit  {
  activeTab: string = 'economic-financial';



  constructor() { }

  ngOnInit(): void {

  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }
}
