import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import * as echarts from 'echarts';
import { jsPDF } from "jspdf";
import { EChartsOption, BarSeriesOption, PieSeriesOption } from 'echarts';

@Component({
    selector: 'app-data-analysis',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './data-analysis.component.html',
    styleUrls: ['./data-analysis.component.scss']
})
export class DataAnalysisComponent implements OnInit, AfterViewInit {
    @ViewChild('investmentTrendsChart', { static: false }) investmentTrendsChartElement!: ElementRef;
    @ViewChild('investmentByRegionChart', { static: false }) investmentByRegionChartElement!: ElementRef;
    @ViewChild('projectsByRegionChart', { static: false }) projectsByRegionChartElement!: ElementRef;
    @ViewChild('projectsByClimateObjectivesChart', { static: false }) projectsByClimateObjectivesChartElement!: ElementRef;
    @ViewChild('investmentsByClimateObjectivesChart', { static: false }) investmentsByClimateObjectivesChartElement!: ElementRef;
    @ViewChild('totalProjectsBySectorChart', { static: false }) totalProjectsBySectorChartElement!: ElementRef;

    investmentByRegionChart: echarts.ECharts | null = null;
    projectsByRegionChart: echarts.ECharts | null = null;
    projectsByClimateObjectivesChart: echarts.ECharts | null = null;
    investmentsByClimateObjectivesChart: echarts.ECharts | null = null;
    totalProjectsBySectorChart: echarts.ECharts | null = null;

    dropdownOpen: { [key: string]: boolean } = {
        investmentByRegion: false,
        projectsByRegion: false,
        projectsByClimateObjectives: false,
        investmentsByClimateObjectives: false,
        totalProjectsBySector: false
    };

    private investmentData = [
        { region: 'Gauteng', '2019': 1800, '2020': 2000, '2021': 2200, '2022': 2500 },
        { region: 'Western Cape', '2019': 1500, '2020': 1600, '2021': 1700, '2022': 1800 },
        { region: 'KwaZulu-Natal', '2019': 1700, '2020': 1800, '2021': 1900, '2022': 2100 },
        { region: 'Eastern Cape', '2019': 900, '2020': 1000, '2021': 1100, '2022': 1200 },
        { region: 'Free State', '2019': 700, '2020': 750, '2021': 800, '2022': 900 },
        { region: 'Limpopo', '2019': 800, '2020': 850, '2021': 900, '2022': 1000 },
        { region: 'Mpumalanga', '2019': 900, '2020': 950, '2021': 1000, '2022': 1100 },
        { region: 'North West', '2019': 600, '2020': 650, '2021': 700, '2022': 800 },
        { region: 'Northern Cape', '2019': 400, '2020': 450, '2021': 500, '2022': 600 }
    ];

    constructor(private http: HttpClient) { }

    ngOnInit(): void {
        // Initialization code if needed
    }

    ngAfterViewInit(): void {
        // Wait for the DOM to be ready
        setTimeout(() => {
            this.initializeCharts();
        }, 0);
    }

    private initializeCharts(): void {
        this.initChart(this.investmentByRegionChartElement, this.createInvestmentByRegionChart.bind(this));
        this.initChart(this.projectsByRegionChartElement, this.createProjectsByRegionChart.bind(this));
        this.initChart(this.projectsByClimateObjectivesChartElement, this.createProjectsByClimateObjectivesChart.bind(this));
        this.initChart(this.investmentsByClimateObjectivesChartElement, this.createInvestmentsByClimateObjectivesChart.bind(this));
        this.initChart(this.totalProjectsBySectorChartElement, this.createTotalProjectsBySectorChart.bind(this));
    }

    private initChart(chartElement: ElementRef, chartInitFunction: () => void): void {
        if (chartElement && chartElement.nativeElement) {
            chartInitFunction();
        } else {
            console.error('DOM element for chart not found');
        }
    }

    private createInvestmentByRegionChart(): void {
        const chartDom = this.investmentByRegionChartElement.nativeElement;
        this.investmentByRegionChart = echarts.init(chartDom);

        const years = ['2019', '2020', '2021', '2022'];
        const regions = this.investmentData.map(item => item.region);

        const series: BarSeriesOption[] = years.map(year => ({
            name: year,
            type: 'bar',
            data: this.investmentData.map(item => item[year as keyof typeof item] as number)
        }));

        const option: EChartsOption = {
            title: {
                text: 'Infrastructure Investment by Region',
                
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: (params: any) => {
                    let tooltipContent = `${params[0].axisValue}<br/>`;
                    params.forEach((item: any) => {
                        tooltipContent += `${item.marker} ${item.seriesName}: $${item.value} million<br/>`;
                    });
                    return tooltipContent;
                }
            },
            legend: {
                data: years,
                bottom: 0
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: regions,
                axisLabel: {
                    rotate: 45,
                    interval: 0
                }
            },
            yAxis: {
                type: 'value',
                name: 'Investment (Million $)'
            },
            series: series,
            color: ['#19BC9B', '#DBFAF4', '#C6D316', '#69B0DE', '#E7F2FA', '#FB5F44']
        };

        this.investmentByRegionChart.setOption(option);

        window.addEventListener('resize', () => {
            this.investmentByRegionChart?.resize();
        });
    }

    private createProjectsByRegionChart(): void {
        const chartDom = this.projectsByRegionChartElement.nativeElement;
        this.projectsByRegionChart = echarts.init(chartDom);

        const data = [
            { region: 'Gauteng', projects: 45 },
            { region: 'Western Cape', projects: 35 },
            { region: 'KwaZulu-Natal', projects: 40 },
            { region: 'Eastern Cape', projects: 30 },
            { region: 'Free State', projects: 20 },
            { region: 'Limpopo', projects: 25 },
            { region: 'Mpumalanga', projects: 28 },
            { region: 'North West', projects: 15 },
            { region: 'Northern Cape', projects: 10 }
        ];

        const series: BarSeriesOption[] = [
            {
                name: 'Projects',
                type: 'bar',
                data: data.map(item => item.projects)
            }
        ];

        const option: EChartsOption = {
            title: {
                text: 'Projects per Region',
                
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} projects'
            },
            xAxis: {
                type: 'category',
                data: data.map(item => item.region),
                axisLabel: {
                    rotate: 45,
                    interval: 0
                }
            },
            yAxis: {
                type: 'value',
                name: 'Number of Projects'
            },
            series: series,
            color: ['#69B0DE'],
            animationDuration: 1000,
            animationEasing: 'cubicOut',
            animationDelay: (idx: number) => idx * 100
        };

        this.projectsByRegionChart.setOption(option);

        // Add resize listener
        window.addEventListener('resize', () => {
            this.projectsByRegionChart!.resize();
        });
    }

    private createProjectsByClimateObjectivesChart(): void {
        const chartDom = this.projectsByClimateObjectivesChartElement.nativeElement;
        this.projectsByClimateObjectivesChart = echarts.init(chartDom);

        const data = [
            { objective: 'Adaptation', projects: 60 },
            { objective: 'Mitigation', projects: 50 },
            { objective: 'Cross Cutting', projects: 30 }
        ];

        const series: PieSeriesOption[] = [
            {
                name: 'Projects',
                type: 'pie',
                radius: '50%',
                data: data.map(item => ({ value: item.projects, name: item.objective }))
            }
        ];

        const option: EChartsOption = {
            title: {
                text: 'Projects per Climate Objective',
                
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} projects'
            },
            series: series,
            color: ['#19BC9B', '#C6D316', '#FB5F44'],
            label: {
                formatter: '{b}: {d}%',
                position: 'outside'
            },
            animationDuration: 1000,
            animationEasing: 'cubicOut',
            animationDelay: (idx: number) => idx * 100
        };

        this.projectsByClimateObjectivesChart.setOption(option);

        window.addEventListener('resize', () => {
            this.projectsByClimateObjectivesChart!.resize();
        });
    }

    private createInvestmentsByClimateObjectivesChart(): void {
        const chartDom = this.investmentsByClimateObjectivesChartElement.nativeElement;
        this.investmentsByClimateObjectivesChart = echarts.init(chartDom);

        const data = [
            { objective: 'Adaptation', investment: 3000 },
            { objective: 'Mitigation', investment: 2500 },
            { objective: 'Cross Cutting', investment: 1500 }
        ];

        const series: PieSeriesOption[] = [
            {
                name: 'Investments',
                type: 'pie',
                radius: '50%',
                data: data.map(item => ({ value: item.investment, name: item.objective }))
            }
        ];

        const option: EChartsOption = {
            title: {
                text: 'Investments per Climate Objective',
                
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: '{b}: ${c} million'
            },
            series: series,
            color: ['#19BC9B', '#C6D316', '#FB5F44'],
            label: {
                formatter: '{b}: ${c}M',
                position: 'outside'
            },
            animationDuration: 1000,
            animationEasing: 'cubicOut',
            animationDelay: (idx: number) => idx * 100
        };

        this.investmentsByClimateObjectivesChart.setOption(option);

        window.addEventListener('resize', () => {
            this.investmentsByClimateObjectivesChart!.resize();
        });
    }

    private createTotalProjectsBySectorChart(): void {
        const chartDom = this.totalProjectsBySectorChartElement.nativeElement;
        this.totalProjectsBySectorChart = echarts.init(chartDom);

        const data = [
            { sector: 'Water', projects: 40 },
            { sector: 'Energy', projects: 35 },
            { sector: 'Transport', projects: 30 },
            { sector: 'Agriculture', projects: 25 }
        ];

        const series: BarSeriesOption[] = [
            {
                name: 'Projects',
                type: 'bar',
                data: data.map(item => item.projects)
            }
        ];

        const option: EChartsOption = {
            title: {
                text: 'Total Projects per Sector',
                
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} projects'
            },
            xAxis: {
                type: 'category',
                data: data.map(item => item.sector),
                axisLabel: {
                    rotate: 45,
                    interval: 0
                }
            },
            yAxis: {
                type: 'value',
                name: 'Number of Projects'
            },
            series: series,
            color: ['#C6D316'],
            animationDuration: 1000,
            animationEasing: 'cubicOut',
            animationDelay: (idx: number) => idx * 100
        };

        this.totalProjectsBySectorChart.setOption(option);

        // Add resize listener
        window.addEventListener('resize', () => {
            this.totalProjectsBySectorChart!.resize();
        });
    }

    toggleDropdown(chartName: string): void {
        this.dropdownOpen[chartName] = !this.dropdownOpen[chartName];
    }

    downloadChartData(chartName: string, format: string): void {
        const chart = this.getChartInstance(chartName);
        if (!chart) {
            console.error(`Chart instance for ${chartName} not found`);
            return;
        }

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

    convertChartToCSV(chart: echarts.ECharts): string {
        const option = chart.getOption();
        let csv = '';
        if (option && Array.isArray(option['series'])) {
            option['series'].forEach((series: any) => {
                csv += series.name + '\n';
                if (Array.isArray(series.data)) {
                    csv += series.data.map((d: any) =>
                        (typeof d === 'object' ? `${d.name},${d.value}` : d)
                    ).join('\n') + '\n\n';
                }
            });
        }
        return csv;
    }

    private getChartInstance(chartName: string): echarts.ECharts | null {
        switch (chartName) {
            case 'investmentByRegion':
                return this.investmentByRegionChart;
            case 'projectsByRegion':
                return this.projectsByRegionChart;
            case 'projectsByClimateObjectives':
                return this.projectsByClimateObjectivesChart;
            case 'investmentsByClimateObjectives':
                return this.investmentsByClimateObjectivesChart;
            case 'totalProjectsBySector':
                return this.totalProjectsBySectorChart;
            default:
                return null;
        }
    }
}
