import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import * as echarts from 'echarts';
import jsPDF from 'jspdf';

@Component({
    selector: 'app-data-analysis',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './data-analysis.component.html',
    styleUrls: ['./data-analysis.component.scss']
})
export class DataAnalysisComponent implements OnInit, AfterViewInit {
    projectCompletionRatesChart: any;
    totalClimateFinanceChart: any;
    transparencyImpactChart: any;
    stakeholderEngagementChart: any;
    totalBudgetVsActualExpenditureChart: any;
    budgetVariancesChart: any;

    dropdownOpen: { [key: string]: boolean } = {
        projectCompletionRates: false,
        totalClimateFinance: false,
        transparencyImpact: false,
        stakeholderEngagement: false,
        totalBudgetVsActualExpenditure: false,
        budgetVariances: false
    };

    constructor(private http: HttpClient) { }

    ngOnInit(): void {
        // Initialization code if needed
    }

    ngAfterViewInit(): void {
        this.createProjectCompletionRatesChart();
        this.createTotalClimateFinanceChart();
        this.createTransparencyImpactChart();
        this.createStakeholderEngagementChart();
        this.createTotalBudgetVsActualExpenditureChart();
        this.createBudgetVariancesChart();
    }

    toggleDropdown(chartName: string): void {
        this.dropdownOpen[chartName] = !this.dropdownOpen[chartName];
    }

    downloadChartData(chart: any, format: string): void {
        const dataURL = chart.getDataURL({
            type: format === 'png' ? 'png' : 'svg',
        });

        if (format === 'pdf') {
            const pdf = new jsPDF();
            pdf.addImage(dataURL, 'PNG', 10, 10, 180, 160);
            pdf.save('chart.pdf');
        } else if (format === 'json') {
            const json = chart.getOption();
            const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'chart.json';
            a.click();
            window.URL.revokeObjectURL(url);
        } else if (format === 'csv') {
            const csvData = 'data:text/csv;charset=utf-8,' + encodeURI(this.convertChartToCSV(chart));
            const link = document.createElement('a');
            link.setAttribute('href', csvData);
            link.setAttribute('download', 'chart.csv');
            link.click();
        } else if (format === 'png') {
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = 'chart.png';
            link.click();
        }
    }

    convertChartToCSV(chart: any): string {
        const option = chart.getOption();
        let csv = '';
        if (option && option.series) {
            option.series.forEach((series: any) => {
                csv += series.name + '\n';
                csv += series.data.map((d: any) => d.join(',')).join('\n') + '\n\n';
            });
        }
        return csv;
    }

    createProjectCompletionRatesChart(): void {
        const chartDom = document.getElementById('projectCompletionRatesChart')!;
        this.projectCompletionRatesChart = echarts.init(chartDom);

        const option: any = {
            title: {
                text: 'Project Completion Rates by Region',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                formatter: (params: any) => {
                    let tooltipText = `${params[0].name}<br/>`;
                    tooltipText += `${params[0].marker} Completion Rate: ${params[0].value}%<br/>`;
                    tooltipText += 'Project completion rate in this region';
                    return tooltipText;
                }
            },
            xAxis: {
                type: 'category',
                data: ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape']
            },
            yAxis: {
                type: 'value',
                max: 100
            },
            series: [
                {
                    data: [90, 75, 85, 80],
                    type: 'bar',
                    color: '#FFCE32',
                    label: {
                        show: true,
                        position: 'top',
                        formatter: '{c}%'
                    }
                }
            ]
        };

        this.projectCompletionRatesChart.setOption(option);
    }

    createTotalClimateFinanceChart(): void {
        const chartDom = document.getElementById('totalClimateFinanceChart')!;
        this.totalClimateFinanceChart = echarts.init(chartDom);
        const option: any = {
            title: {
                text: 'Total Climate Finance by Sector',
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                    return `${params.marker} ${params.name}: $${params.value} million<br/>Total climate finance allocated to the ${params.name} sector.`;
                }
            },
            legend: {
                bottom: '0%'
            },
            series: [
                {
                    name: 'Total Climate Finance',
                    type: 'pie',
                    radius: '50%',
                    data: [
                        { value: 120, name: 'Water' },
                        { value: 150, name: 'Energy' },
                        { value: 90, name: 'Transport' },
                        { value: 110, name: 'Agriculture' }
                    ],
                    color: ['#FFCE32', '#333333', '#61A8BD', '#D60000'],
                    label: {
                        formatter: '{b}: ${c}M',
                        position: 'outside'
                    }
                }
            ]
        };
        this.totalClimateFinanceChart.setOption(option);
    }

    createTransparencyImpactChart(): void {
        const chartDom = document.getElementById('transparencyImpactChart')!;
        this.transparencyImpactChart = echarts.init(chartDom);
        const option: any = {
            title: {
                text: 'Impact of Transparency on Project Outcomes',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                formatter: (params: any) => {
                    return `${params[0].name}<br/>Transparency Impact: ${params[0].value}%<br/>Higher transparency leads to better project outcomes.`;
                }
            },
            xAxis: {
                type: 'category',
                data: ['Q1', 'Q2', 'Q3', 'Q4']
            },
            yAxis: {
                type: 'value',
                max: 100
            },
            series: [
                {
                    data: [65, 75, 70, 80],
                    type: 'bar',
                    color: '#FFCE32',
                    label: {
                        show: true,
                        position: 'top',
                        formatter: '{c}%'
                    }
                }
            ]
        };
        this.transparencyImpactChart.setOption(option);
    }

    createStakeholderEngagementChart(): void {
        const chartDom = document.getElementById('stakeholderEngagementChart')!;
        this.stakeholderEngagementChart = echarts.init(chartDom);
        const option: any = {
            title: {
                text: 'Stakeholder Engagement Activities',
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                    return `${params.marker} ${params.name}: ${params.value}%<br/>Engagement with ${params.name} sector.`;
                }
            },
            legend: {
                bottom: '0%'
            },
            series: [
                {
                    name: 'Engagement Activities',
                    type: 'pie',
                    radius: '50%',
                    data: [
                        { value: 40, name: 'Government' },
                        { value: 30, name: 'Private Sector' },
                        { value: 20, name: 'Civil Society' },
                        { value: 10, name: 'Others' }
                    ],
                    color: ['#FFCE32', '#333333', '#61A8BD', '#D60000'],
                    label: {
                        formatter: '{b}: {d}%',
                        position: 'outside'
                    }
                }
            ]
        };
        this.stakeholderEngagementChart.setOption(option);
    }



    createTotalBudgetVsActualExpenditureChart(): void {
        const chartDom = document.getElementById('totalBudgetVsActualExpenditureChart')!;
        this.totalBudgetVsActualExpenditureChart = echarts.init(chartDom);
        const option: any = {
            title: {
                text: 'Total Budget vs. Actual Expenditure',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: (params: any) => {
                    let tooltipText = `${params[0].name}<br/>`;
                    params.forEach((item: any) => {
                        tooltipText += `${item.marker} ${item.seriesName}: $${item.value}M<br/>`;
                    });
                    tooltipText += 'The total budget and actual expenditure for each project.';
                    return tooltipText;
                }
            },
            legend: {
                bottom: '0%'
            },
            xAxis: {
                type: 'category',
                data: ['Water Treatment Plant', 'Solar Energy Farm', 'Highway Expansion', 'Urban Development']
            },
            yAxis: {
                type: 'value',
                name: 'USD (millions)',
                axisLabel: {
                    formatter: '{value}M'
                }
            },
            series: [
                {
                    name: 'Total Budget',
                    type: 'bar',
                    data: [200, 150, 300, 250],
                    color: '#61A8BD'
                },
                {
                    name: 'Actual Expenditure',
                    type: 'bar',
                    data: [180, 130, 290, 240],
                    color: '#D60000'
                }
            ]
        };
        this.totalBudgetVsActualExpenditureChart.setOption(option);
    }

    createBudgetVariancesChart(): void {
        const chartDom = document.getElementById('budgetVariancesChart')!;
        this.budgetVariancesChart = echarts.init(chartDom);
        const option: any = {
            title: {
                text: 'Budget Variances (Planned vs. Actual)',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: (params: any) => {
                    let tooltipText = `${params[0].name}<br/>`;
                    params.forEach((item: any) => {
                        tooltipText += `${item.marker} ${item.seriesName}: $${item.value}M<br/>`;
                    });
                    tooltipText += 'Variances between the planned budget and actual expenditure for each project.';
                    return tooltipText;
                }
            },
            legend: {
                bottom: '0%'
            },
            xAxis: {
                type: 'category',
                data: ['Water Treatment Plant', 'Solar Energy Farm', 'Highway Expansion', 'Urban Development']
            },
            yAxis: {
                type: 'value',
                name: 'USD (millions)',
                axisLabel: {
                    formatter: '{value}M'
                }
            },
            series: [
                {
                    name: 'Planned Budget',
                    type: 'bar',
                    data: [200, 150, 300, 250],
                    color: '#61A8BD'
                },
                {
                    name: 'Actual Expenditure',
                    type: 'bar',
                    data: [180, 130, 290, 240],
                    color: '#D60000'
                },
                {
                    name: 'Variance',
                    type: 'line',
                    data: [20, 20, 10, 10],
                    color: '#FFCE32'
                }
            ]
        };
        this.budgetVariancesChart.setOption(option);
    }

}
