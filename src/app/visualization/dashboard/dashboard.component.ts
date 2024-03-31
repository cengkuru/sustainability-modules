import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {EChartsOption, TooltipComponentOption} from 'echarts';
import {CallbackDataParams} from "echarts/types/dist/shared";
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit  {
  activeTab: string = 'economic-financial';

  public climateFinanceInvestmentChartOptions: EChartsOption = {
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params: any) => {
        if (Array.isArray(params)) {
          return params.map((param) => {
            const { seriesName, value, marker } = param;
            return `${marker}${seriesName}: $${value} billion`;
          }).join('<br>');
        } else {
          const { seriesName, value, marker } = params;
          return `${marker}${seriesName}: $${value} billion`;
        }
      },
    },
    xAxis: {
      type: 'category',
      data: ['Renewable Energy', 'Energy Efficiency', 'Sustainable Transport', 'Climate Resilience', 'Natural Capital'],
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '${value}B',
      },
      name: 'Investment Amount (Billions USD)',
      nameLocation: 'middle',
      nameGap: 60,
      nameTextStyle: {
        fontWeight: 'bold',
      },
    },
    legend: {
      show: true,
      top: 'bottom',
    },
    series: [
      {
        name: 'Public Finance',
        data: [45, 30, 25, 20, 15],
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color: '#66BB6A',
        },
      },
      {
        name: 'Development Finance Institutions',
        data: [60, 50, 40, 30, 20],
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color: '#42A5F5',
        },
      },
      {
        name: 'Private Sector',
        data: [80, 70, 60, 50, 40],
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color: '#FFA726',
        },
      },
      {
        name: 'Multilateral Climate Funds',
        data: [20, 15, 10, 8, 5],
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color: '#7E57C2',
        },
      },
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true,
    },
    backgroundColor: '#FFFFFF',
  };

  public climateFinanceInvestmentBySectorOptions: EChartsOption = {

    tooltip: {
      trigger: 'item',
      formatter: '{b}: ${c} billion ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['Renewable Energy', 'Energy Efficiency', 'Sustainable Transport', 'Climate Resilience', 'Natural Capital'],
    },
    series: [
      {
        name: 'Investment',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '20',
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: 250, name: 'Renewable Energy' },
          { value: 180, name: 'Energy Efficiency' },
          { value: 150, name: 'Sustainable Transport' },
          { value: 120, name: 'Climate Resilience' },
          { value: 90, name: 'Natural Capital' },
        ],
      },
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    color: ['#66BB6A', '#42A5F5', '#FFA726', '#7E57C2', '#26A69A'],
  };

  public policyCoherenceOptions: EChartsOption = {

    tooltip: {},
    legend: {
      data: ['Policy Coherence'],
      bottom: '5%',
      left: 'center',
    },
    radar: {
      indicator: [
        { name: 'Alignment with National Development Plans', max: 100 },
        { name: 'Alignment with Sector Strategies', max: 100 },
        { name: 'Alignment with Climate Change Commitments', max: 100 },
        { name: 'Alignment with Social Inclusion Policies', max: 100 },
        { name: 'Alignment with Environmental Regulations', max: 100 },
        { name: 'Stakeholder Engagement in Policy Design', max: 100 },
      ],
      shape: 'circle',
      splitNumber: 5,
      axisName: {
        color: 'rgb(0, 0, 0)',
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.2)',
        },
      },
      splitArea: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.2)',
        },
      },
    },
    series: [
      {
        name: 'Policy Coherence',
        type: 'radar',
        data: [
          {
            value: [85, 90, 75, 80, 95, 70],
            name: 'Policy Coherence',
            areaStyle: {
              color: 'rgba(0, 128, 0, 0.3)',
            },
          },
        ],
      },
    ],
  };

  public antiCorruptionCertificationsOptions: EChartsOption = {

    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params: any) => {
        const { name, value } = params[0];
        return `${name}: ${value}%`;
      },
    },
    xAxis: {
      type: 'category',
      data: ['ISO 37001', 'TRACE', 'ETHIC Intelligence', 'Other'],
      axisLabel: {
        rotate: 45,

      },
    },
    yAxis: {
      type: 'value',
      name: 'Percentage of Projects',
      axisLabel: {
        formatter: '{value}%',
      },
    },
    series: [
      {
        name: 'Anti-Corruption Certifications',
        type: 'bar',
        data: [65, 20, 10, 5],
        itemStyle: {
          color: '#4CAF50',
        },
        emphasis: {
          itemStyle: {
            color: '#66BB6A',
          },
        },
      },
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: '20%',
      containLabel: true,
    },
  };

  public transparencyScoreOptions: EChartsOption = {

    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const { name, value } = params[0];
        return `Year: ${name}<br/>Transparency Score: ${value}%`;
      },
    },
    xAxis: {
      type: 'category',
      data: ['2018', '2019', '2020', '2021', '2022'],
      axisLabel: {
        fontSize: 12,
      },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      interval: 20,
      axisLabel: {
        formatter: '{value}%',
      },
    },
    series: [
      {
        name: 'Transparency Score',
        type: 'line',
        data: [60, 65, 70, 75, 80],
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          color: '#4CAF50',
          width: 3,
        },
        itemStyle: {
          color: '#4CAF50',
        },
        label: {
          show: true,
          formatter: '{c}%',
        },
      },
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '20%',
      containLabel: true,
    },
  };

  public independentMonitoringReportsOptions: EChartsOption = {

    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: ['Completed', 'In Progress', 'Not Started'],
      bottom: '0%',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01],
    },
    yAxis: {
      type: 'category',
      data: ['2022', '2021', '2020', '2019', '2018'],
    },
    series: [
      {
        name: 'Completed',
        type: 'bar',
        stack: 'status',
        data: [80, 70, 60, 50, 40],
        itemStyle: {
          color: '#66BB6A',
        },
      },
      {
        name: 'In Progress',
        type: 'bar',
        stack: 'status',
        data: [15, 20, 25, 30, 35],
        itemStyle: {
          color: '#FFA726',
        },
      },
      {
        name: 'Not Started',
        type: 'bar',
        stack: 'status',
        data: [5, 10, 15, 20, 25],
        itemStyle: {
          color: '#EF5350',
        },
      },
    ],
  };

  public communityEngagementOptions: EChartsOption = {

    tooltip: {},
    legend: {
      data: ['Community Engagement'],
      bottom: '5%',
      left: 'center',
    },
    radar: {
      indicator: [
        { name: 'Public Consultation Meetings', max: 100 },
        { name: 'Inclusive Design and Implementation', max: 100 },
        { name: 'Beneficiary Feedback Mechanisms', max: 100 },
        { name: 'Grievance Redress Mechanisms', max: 100 },
        { name: 'Information Disclosure', max: 100 },
        { name: 'Stakeholder Mapping', max: 100 },
      ],
      shape: 'circle',
      splitNumber: 5,
      axisName: {
        color: 'rgb(0, 0, 0)',
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.2)',
        },
      },
      splitArea: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.2)',
        },
      },
    },
    series: [
      {
        name: 'Community Engagement',
        type: 'radar',
        data: [
          {
            value: [80, 75, 70, 85, 90, 65],
            name: 'Community Engagement',
            areaStyle: {
              color: 'rgba(0, 128, 0, 0.3)',
            },
          },
        ],
      },
    ],
  };

  public inclusiveDesignOptions: EChartsOption = {

    tooltip: {},
    legend: {
      data: ['Inclusive Design'],
      bottom: '5%',
      left: 'center',
    },
    radar: {
      indicator: [
        { name: 'Accessibility', max: 100 },
        { name: 'Affordability', max: 100 },
        { name: 'Gender Inclusivity', max: 100 },
        { name: 'Cultural Sensitivity', max: 100 },
        { name: 'Stakeholder Engagement', max: 100 },
        { name: 'Universal Design Principles', max: 100 },
      ],
      shape: 'circle',
      splitNumber: 5,
      axisName: {
        color: 'rgb(0, 0, 0)',
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.2)',
        },
      },
      splitArea: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.2)',
        },
      },
    },
    series: [
      {
        name: 'Inclusive Design',
        type: 'radar',
        data: [
          {
            value: [85, 80, 75, 90, 70, 80],
            name: 'Inclusive Design',
            areaStyle: {
              color: 'rgba(0, 128, 0, 0.3)',
            },
          },
        ],
      },
    ],
  };

  public laborStandardsComplianceOptions: EChartsOption = {

    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: ['Compliant', 'Non-Compliant', 'Not Assessed'],
      bottom: '0%',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['2018', '2019', '2020', '2021', '2022'],
    },
    yAxis: {
      type: 'value',
      name: 'Number of Projects',
      axisLabel: {
        formatter: '{value}',
      },
    },
    series: [
      {
        name: 'Compliant',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series',
        },
        data: [120, 132, 101, 134, 90],
        itemStyle: {
          color: '#66BB6A',
        },
      },
      {
        name: 'Non-Compliant',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series',
        },
        data: [20, 25, 18, 30, 15],
        itemStyle: {
          color: '#EF5350',
        },
      },
      {
        name: 'Not Assessed',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series',
        },
        data: [60, 43, 81, 36, 95],
        itemStyle: {
          color: '#BDBDBD',
        },
      },
    ],
  };

  public jobsCreatedOptions: EChartsOption = {

    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const { name, value } = params[0];
        return `Year: ${name}<br/>Jobs Created: ${value}`;
      },
    },
    xAxis: {
      type: 'category',
      data: ['2018', '2019', '2020', '2021', '2022'],
      axisLabel: {
        fontSize: 12,
      },
    },
    yAxis: {
      type: 'value',
      name: 'Number of Jobs',
      axisLabel: {
        formatter: '{value}',
      },
    },
    series: [
      {
        name: 'Jobs Created',
        type: 'line',
        data: [5000, 7500, 6000, 8000, 10000],
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          color: '#4CAF50',
          width: 3,
        },
        itemStyle: {
          color: '#4CAF50',
        },
        label: {
          show: true,
          formatter: '{c}',
        },
      },
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '20%',
      containLabel: true,
    },
  };

  public carbonFootprintOptions: EChartsOption = {

    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const { name, value } = params[0];
        return `Year: ${name}<br/>Carbon Footprint (tCO2e): ${value}`;
      },
    },
    xAxis: {
      type: 'category',
      data: ['2018', '2019', '2020', '2021', '2022'],
      axisLabel: {
        fontSize: 12,
      },
    },
    yAxis: {
      type: 'value',
      name: 'Carbon Footprint (tCO2e)',
      axisLabel: {
        formatter: '{value}',
      },
    },
    series: [
      {
        name: 'Carbon Footprint',
        type: 'line',
        data: [1500, 1800, 1200, 1000, 800],
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          color: '#EF5350',
          width: 3,
        },
        itemStyle: {
          color: '#EF5350',
        },
        label: {
          show: true,
          formatter: '{c}',
        },
      },
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '20%',
      containLabel: true,
    },
  };

  public energyEfficiencyOptions: EChartsOption = {

    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const { name, value } = params[0];
        return `Year: ${name}<br/>Energy Efficiency Score: ${value}`;
      },
    },
    xAxis: {
      type: 'category',
      data: ['2018', '2019', '2020', '2021', '2022'],
      axisLabel: {
        fontSize: 12,
      },
    },
    yAxis: {
      type: 'value',
      name: 'Energy Efficiency Score',
      min: 0,
      max: 100,
      interval: 20,
      axisLabel: {
        formatter: '{value}',
      },
    },
    series: [
      {
        name: 'Energy Efficiency',
        type: 'line',
        data: [60, 65, 70, 75, 80],
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          color: '#4CAF50',
          width: 3,
        },
        itemStyle: {
          color: '#4CAF50',
        },
        label: {
          show: true,
          formatter: '{c}',
        },
      },
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '20%',
      containLabel: true,
    },
  };

  public waterConsumptionOptions: EChartsOption = {

    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const { name, value } = params[0];
        return `Year: ${name}<br/>Water Consumption (m³): ${value}`;
      },
    },
    xAxis: {
      type: 'category',
      data: ['2018', '2019', '2020', '2021', '2022'],
      axisLabel: {
        fontSize: 12,
      },
    },
    yAxis: {
      type: 'value',
      name: 'Water Consumption (m³)',
      axisLabel: {
        formatter: '{value}',
      },
    },
    series: [
      {
        name: 'Water Consumption',
        type: 'line',
        data: [5000, 4500, 4000, 3500, 3000],
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          color: '#2196F3',
          width: 3,
        },
        itemStyle: {
          color: '#2196F3',
        },
        label: {
          show: true,
          formatter: '{c}',
        },
      },
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '20%',
      containLabel: true,
    },
  };

  public biodiversityImpactOptions: EChartsOption = {

    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const { name, value } = params[0];
        return `Year: ${name}<br/>Biodiversity Impact Score: ${value}`;
      },
    },
    xAxis: {
      type: 'category',
      data: ['2018', '2019', '2020', '2021', '2022'],
      axisLabel: {
        fontSize: 12,
      },
    },
    yAxis: {
      type: 'value',
      name: 'Biodiversity Impact Score',
      min: 0,
      max: 100,
      interval: 20,
      axisLabel: {
        formatter: '{value}',
      },
    },
    series: [
      {
        name: 'Biodiversity Impact',
        type: 'line',
        data: [70, 65, 60, 55, 50],
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          color: '#FFA726',
          width: 3,
        },
        itemStyle: {
          color: '#FFA726',
        },
        label: {
          show: true,
          formatter: '{c}',
        },
      },
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '20%',
      containLabel: true,
    },
  };

  public costBenefitAnalysisOptions: EChartsOption = {

    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params: any) => {
        let tooltip = `<b>${params[0].name}</b><br/>`;
        params.forEach((param: any) => {
          tooltip += `${param.seriesName}: $${param.value} billion<br/>`;
        });
        return tooltip;
      },
    },
    legend: {
      data: ['Costs', 'Benefits'],
      bottom: '0%',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['2018', '2019', '2020', '2021', '2022'],
    },
    yAxis: {
      type: 'value',
      name: 'Amount (Billion USD)',
      axisLabel: {
        formatter: '${value}',
      },
    },
    series: [
      {
        name: 'Costs',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series',
        },
        data: [120, 132, 101, 134, 90],
        itemStyle: {
          color: '#EF5350',
        },
      },
      {
        name: 'Benefits',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series',
        },
        data: [220, 182, 191, 234, 290],
        itemStyle: {
          color: '#66BB6A',
        },
      },
    ],
  };

  public roiAnalysisOptions: EChartsOption = {

    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const { name, value } = params[0];
        return `Year: ${name}<br/>ROI: ${value}%`;
      },
    },
    xAxis: {
      type: 'category',
      data: ['2018', '2019', '2020', '2021', '2022'],
      axisLabel: {
        fontSize: 12,
      },
    },
    yAxis: {
      type: 'value',
      name: 'Return on Investment (%)',
      axisLabel: {
        formatter: '{value}%',
      },
    },
    series: [
      {
        name: 'ROI',
        type: 'line',
        data: [8, 12, 15, 18, 20],
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          color: '#4CAF50',
          width: 3,
        },
        itemStyle: {
          color: '#4CAF50',
        },
        label: {
          show: true,
          formatter: '{c}%',
        },
      },
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '20%',
      containLabel: true,
    },
  };
  constructor() { }

  ngOnInit(): void {

  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }
}
