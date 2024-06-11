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
    projects: any[] = [];
    climateFinanceChart: echarts.ECharts | undefined;
    mitigationAdaptationChart: echarts.ECharts | undefined;
    beneficiariesChart: echarts.ECharts | undefined;
    eiaChart: echarts.ECharts | undefined;
    climateFinanceDropdownOpen = false;
    mitigationAdaptationDropdownOpen = false;
    beneficiariesDropdownOpen = false;
    eiaDropdownOpen = false;

    constructor(private http: HttpClient) {}

    ngOnInit(): void {
        this.http.get<any[]>('assets/data/viz_projects.json').subscribe(data => {
            this.projects = data;
            this.initCharts();
        });
    }

    ngAfterViewInit(): void {
        // Ensure charts are only initialized when the DOM is ready
        if (this.projects.length > 0) {
            this.initCharts();
        }
    }

    initCharts(): void {
        setTimeout(() => {
            this.initClimateFinanceChart();
            this.initMitigationAdaptationChart();
            this.initBeneficiariesChart();
            this.initEIAChart();
        }, 0);
    }

    initClimateFinanceChart(): void {
        const climateFinanceData = this.calculateClimateFinanceData(this.projects);
        this.climateFinanceChart = echarts.init(document.getElementById('climateFinanceChart') as HTMLDivElement);
        this.climateFinanceChart.setOption({
            title: { text: 'Climate Finance Projects per Sector', left: 'center', textStyle: { color: '#2c4143' } },
            tooltip: { trigger: 'item' },
            series: [{
                name: 'Climate Finance',
                type: 'pie',
                radius: '50%',
                data: climateFinanceData,
                emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
                itemStyle: {
                    color: (params: any) => {
                        const colors = ['#61a8bd', '#ffce32', '#D60000', '#628ea0'];
                        return colors[params.dataIndex % colors.length];
                    }
                }
            }]
        });
    }

    initMitigationAdaptationChart(): void {
        const mitigationAdaptationData = this.calculateMitigationAdaptationData();
        this.mitigationAdaptationChart = echarts.init(document.getElementById('mitigationAdaptationChart') as HTMLDivElement);
        this.mitigationAdaptationChart.setOption({
            title: { text: 'Mitigation, Adaptation and Cross Cutting Investments', left: 'center', textStyle: { color: '#2c4143' } },
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: mitigationAdaptationData.regions, axisLine: { lineStyle: { color: '#58707b' } } },
            yAxis: { type: 'value', axisLine: { lineStyle: { color: '#58707b' } } },
            series: [
                { name: 'Adaptation', type: 'bar', data: mitigationAdaptationData.adaptation, color: '#61a8bd' },
                { name: 'Mitigation', type: 'bar', data: mitigationAdaptationData.mitigation, color: '#ffce32' },
                { name: 'Cross Cutting', type: 'bar', data: mitigationAdaptationData.crossCutting, color: '#D60000' }
            ]
        });
    }

    calculateClimateFinanceData(projectList: any[]): any[] {
        const climateFinance: { [key: string]: number } = {};
        projectList.forEach(project => {
            const financeSource = project.stages.identification?.climateFinanceData?.financialInstrument;
            const amount = project.stages.identification?.climateFinanceData?.amountOfInvestment || 0;
            if (financeSource) {
                const parsedAmount = parseFloat(amount.replace(/[^0-9.-]+/g, ""));
                climateFinance[financeSource] = (climateFinance[financeSource] || 0) + parsedAmount;
            }
        });
        return Object.keys(climateFinance).map(source => ({ value: climateFinance[source], name: source }));
    }

    calculateMitigationAdaptationData(): { regions: string[], adaptation: number[], mitigation: number[], crossCutting: number[] } {
        const data: { [key: string]: { Adaptation: number, Mitigation: number, 'Cross Cutting': number } } = {
            'Eastern Cape': { 'Adaptation': 4, 'Mitigation': 1, 'Cross Cutting': 2 },
            'Western Cape': { 'Adaptation': 2, 'Mitigation': 4, 'Cross Cutting': 3 },
            'Free State': { 'Adaptation': 3, 'Mitigation': 2, 'Cross Cutting': 2 },
            'Northern Cape': { 'Adaptation': 4, 'Mitigation': 2, 'Cross Cutting': 5 }
        };

        const regions = Object.keys(data);
        const adaptation = regions.map(region => data[region]['Adaptation']);
        const mitigation = regions.map(region => data[region]['Mitigation']);
        const crossCutting = regions.map(region => data[region]['Cross Cutting']);

        return { regions, adaptation, mitigation, crossCutting };
    }

    initBeneficiariesChart(): void {
        const beneficiariesData = this.calculateBeneficiariesData(this.projects);
        this.beneficiariesChart = echarts.init(document.getElementById('beneficiariesChart') as HTMLDivElement);
        this.beneficiariesChart.setOption({
            title: { text: 'Number of Direct Beneficiaries', left: 'center', textStyle: { color: '#2c4143' } },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#6a7985'
                    }
                }
            },
            legend: { data: ['Female', 'Male'], top: 'bottom' },
            xAxis: { type: 'category', boundaryGap: false, data: beneficiariesData.regions, axisLine: { lineStyle: { color: '#58707b' } } },
            yAxis: { type: 'value', axisLine: { lineStyle: { color: '#58707b' } } },
            series: [
                {
                    name: 'Female',
                    type: 'line',
                    stack: 'Total',
                    areaStyle: {},
                    emphasis: {
                        focus: 'series'
                    },
                    data: beneficiariesData.female,
                    color: '#ffce32'
                },
                {
                    name: 'Male',
                    type: 'line',
                    stack: 'Total',
                    areaStyle: {},
                    emphasis: {
                        focus: 'series'
                    },
                    data: beneficiariesData.male,
                    color: '#D60000'
                }
            ]
        });
    }


    calculateBeneficiariesData(projectList: any[]): any {
        const regions = projectList.map(project => project.region);
        const total = projectList.map(project => project.beneficiaries.total);
        const female = projectList.map(project => project.beneficiaries.female);
        const male = projectList.map(project => project.beneficiaries.male);

        return { regions, total, female, male };
    }

    initEIAChart(): void {
        const eiaData = this.calculateEIAData(this.projects);
        this.eiaChart = echarts.init(document.getElementById('eiaChart') as HTMLDivElement);
        this.eiaChart.setOption({
            title: { text: 'Environmental Impact Assessment Approval Status', left: 'center', textStyle: { color: '#2c4143' } },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: { data: ['Approved', 'Pending', 'Rejected'], top: 'bottom' },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '10%',
                containLabel: true
            },
            xAxis: { type: 'value', axisLine: { lineStyle: { color: '#58707b' } } },
            yAxis: { type: 'category', data: eiaData.projects, axisLine: { lineStyle: { color: '#58707b' } } },
            series: [
                {
                    name: 'Approved',
                    type: 'bar',
                    stack: 'total',
                    label: {
                        show: true
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    data: eiaData.approved,
                    color: '#61a8bd'
                },
                {
                    name: 'Pending',
                    type: 'bar',
                    stack: 'total',
                    label: {
                        show: true
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    data: eiaData.pending,
                    color: '#ffce32'
                },
                {
                    name: 'Rejected',
                    type: 'bar',
                    stack: 'total',
                    label: {
                        show: true
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    data: eiaData.rejected,
                    color: '#D60000'
                }
            ]
        });
    }


    calculateEIAData(projectList: any[]): any {
        const projectNames = projectList.map(project => project.name);
        const approved = projectList.map(project => project.EIA.status === 'Approved' ? 1 : 0);
        const pending = projectList.map(project => project.EIA.status === 'Pending' ? 1 : 0);
        const rejected = projectList.map(project => project.EIA.status === 'Rejected' ? 1 : 0);

        return { projects: projectNames, approved, pending, rejected };
    }


    toggleDropdown(chartType: string): void {
        if (chartType === 'climateFinance') {
            this.climateFinanceDropdownOpen = !this.climateFinanceDropdownOpen;
        } else if (chartType === 'mitigationAdaptation') {
            this.mitigationAdaptationDropdownOpen = !this.mitigationAdaptationDropdownOpen;
        }
        else if (chartType === 'beneficiaries') {
            this.beneficiariesDropdownOpen = !this.beneficiariesDropdownOpen;
        } else if (chartType === 'eia') {
            this.eiaDropdownOpen = !this.eiaDropdownOpen;
        }
    }

    downloadChartData(chart: echarts.ECharts, format: string): void {
        const option = chart.getOption() as any;
        const dataStr = JSON.stringify(option.series[0].data);
        const blob = new Blob([dataStr], { type: "application/json" });

        if (format === 'json') {
            this.downloadFile(blob, 'chart-data.json');
        } else if (format === 'csv') {
            const csvStr = this.convertToCSV(JSON.parse(dataStr));
            this.downloadFile(new Blob([csvStr], { type: "text/csv" }), 'chart-data.csv');
        } else if (format === 'png') {
            const imgData = chart.getDataURL({
                type: 'png',
                pixelRatio: 2,
                backgroundColor: '#fff'
            });
            const link = document.createElement('a');
            link.href = imgData;
            link.download = 'chart.png';
            link.click();
        } else if (format === 'pdf') {
            const imgData = chart.getDataURL({
                type: 'png',
                pixelRatio: 2,
                backgroundColor: '#fff'
            });
            const doc = new jsPDF();
            doc.addImage(imgData, 'PNG', 10, 10, 180, 160);
            doc.save('chart.pdf');
        }
    }

    downloadFile(blob: Blob, filename: string): void {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }

    convertToCSV(data: any[]): string {
        const array = [Object.keys(data[0])].concat(data);
        return array.map(row => {
            return Object.values(row).map(value => {
                return typeof value === 'string' ? JSON.stringify(value) : value;
            }).toString();
        }).join('\n');
    }
}
