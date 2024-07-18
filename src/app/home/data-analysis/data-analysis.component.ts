import { CommonModule } from "@angular/common";
import {Component, AfterViewInit, ElementRef, ViewChild, NgZone, HostListener, ChangeDetectorRef} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import * as echarts from 'echarts';
import { jsPDF } from "jspdf";
import { EChartsOption, BarSeriesOption, PieSeriesOption } from 'echarts';
import * as L from 'leaflet';
import { ScriptLoaderService } from "../../services/scriptLoader.service";


@Component({
    selector: 'app-data-analysis',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './data-analysis.component.html',
    styleUrls: ['./data-analysis.component.scss']
})
export class DataAnalysisComponent implements AfterViewInit {
    @ViewChild('mapContainer') mapContainer!: ElementRef;

    investmentByRegionChart: echarts.ECharts | null = null;
    projectsByRegionChart: echarts.ECharts | null = null;
    projectsByClimateObjectivesChart: echarts.ECharts | null = null;
    investmentsByClimateObjectivesChart: echarts.ECharts | null = null;
    totalProjectsBySectorChart: echarts.ECharts | null = null;
    projectTypesChart: echarts.ECharts | null = null;

    private map!: L.Map;

    markers: { lat: number; lng: number; popup: string; }[] = [];
    isLoading: boolean = true;
    mapInitialized: boolean = false;
    projectsLoaded: boolean = false;
    private viewInitialized: boolean = false;

    dropdownOpen: { [key: string]: boolean } = {
        investmentByRegion: false,
        projectsByRegion: false,
        projectsByClimateObjectives: false,
        investmentsByClimateObjectives: false,
        totalProjectsBySector: false,
        projectTypes: false
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

    constructor(
        private http: HttpClient,
        private ngZone: NgZone,
        private scriptLoader: ScriptLoaderService,
        private cdr: ChangeDetectorRef,
        ) { }

    async ngOnInit(): Promise<void> {
        console.log('ngOnInit called');
        try {
            await this.loadLeafletScripts();
            this.loadProjects();
        } catch (error) {
            console.error('Error during component initialization:', error);
        }
    }

    ngAfterViewInit() {
        console.log('ngAfterViewInit called');
        this.viewInitialized = true;
        this.ngZone.runOutsideAngular(() => {
            setTimeout(() => {
                this.checkAndInitializeMap();
            }, 0);
        });
    }

    ngOnDestroy(): void {
        console.log('ngOnDestroy called');
        if (this.map) {
            this.map.remove();
        }
    }

    private async loadLeafletScripts(): Promise<void> {
        console.log('loadLeafletScripts called');
        const scripts = [
            'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js'
        ];
        const styles = [
            'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css'
        ];

        try {
            await this.scriptLoader.loadScripts(scripts);
            await this.scriptLoader.loadStyles(styles);
            console.log('Leaflet scripts and styles loaded successfully');
        } catch (error) {
            console.error('Error loading Leaflet scripts or styles:', error);
            throw error;
        }
    }

    checkAndInitializeMap(): void {
        console.log('checkAndInitializeMap called');
        console.log('viewInitialized:', this.viewInitialized);
        console.log('projectsLoaded:', this.projectsLoaded);
        console.log('mapContainer:', this.mapContainer);

        if (this.viewInitialized && this.projectsLoaded && this.mapContainer && this.mapContainer.nativeElement) {
            this.initializeMap();
        } else {
            console.log('Map initialization deferred');
            if (!this.mapContainer) {
                console.error('Map container is not available');
            }
            // Retry after a short delay
            setTimeout(() => this.checkAndInitializeMap(), 100);
        }
    }


    initializeMap(): void {
        console.log('initializeMap called');
        if (this.mapInitialized) {
            console.log('Map already initialized');
            return;
        }

        console.log('Creating map instance');
        this.map = L.map(this.mapContainer.nativeElement).setView([-28.4793, 24.6727], 6);

        console.log('Adding tile layer');
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        console.log('Adding markers', this.markers);
        this.markers.forEach(markerData => {
            const marker = L.marker([markerData.lat, markerData.lng]).addTo(this.map);
            marker.bindPopup(markerData.popup);
        });

        this.fitMapBounds();
        this.mapInitialized = true;
        console.log('Map initialized successfully');
    }

    fitMapBounds() {
        console.log('fitMapBounds called', this.markers.length);
        if (this.markers.length > 0 && this.map) {
            const bounds = L.latLngBounds(this.markers.map(m => [m.lat, m.lng]));
            this.map.fitBounds(bounds);
        }
    }

    loadProjects() {
        this.isLoading = true;
        // Simulate loading projects
        setTimeout(() => {
            this.generateRandomMarkers();
            this.projectsLoaded = true;
            this.isLoading = false;
            this.checkAndInitializeMap();
            this.initializeCharts();
            this.cdr.detectChanges();
        }, 1000);
    }

    generateRandomMarkers() {
        console.log('generateMarkers called');
        const projectTypes = ['Water', 'Energy', 'Transport', 'Agriculture'];
        const regions = ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape'];

        for (let i = 0; i < 50; i++) {
            const lat = Math.random() * ((-22) - (-34)) + (-34);
            const lng = Math.random() * (32 - 16) + 16;
            const projectType = projectTypes[Math.floor(Math.random() * projectTypes.length)];
            const region = regions[Math.floor(Math.random() * regions.length)];

            const popup = `
                <div class="p-4 max-w-sm">
                    <h3 class="text-lg font-semibold mb-2">${projectType} Project</h3>
                    <p class="mb-2">Region: ${region}</p>
                    <p class="mb-4">Investment: $${Math.floor(Math.random() * 100 + 1)} million</p>
                    <button class="view-details-button px-4 py-2 bg-accent text-secondary rounded hover:bg-secondary hover:text-accent transition duration-300">
                        View Details
                    </button>
                </div>
            `;
            this.markers.push({ lat, lng, popup });
        }
        console.log('Generated markers:', this.markers);
    }

    @HostListener('window:resize')
    onResize() {
        if (this.map) {
            this.map.invalidateSize();
        }
    }

    private initializeCharts(): void {
        this.createInvestmentByRegionChart();
        this.createProjectsByRegionChart();
        this.createProjectsByClimateObjectivesChart();
        this.createInvestmentsByClimateObjectivesChart();
        this.createTotalProjectsBySectorChart();
        this.createProjectTypesChart();
    }


    private createProjectTypesChart(): void {
        const chartDom = document.getElementById('projectTypesChart');
        if (!chartDom) return;
        this.projectTypesChart = echarts.init(chartDom);

        const data = [
            { type: 'Solar Energy', projects: 50 },
            { type: 'Wind Energy', projects: 40 },
            { type: 'Water Management', projects: 35 },
            { type: 'Sustainable Agriculture', projects: 30 },
            { type: 'Green Buildings', projects: 25 }
        ];

        const series: PieSeriesOption[] = [
            {
                name: 'Project Types',
                type: 'pie',
                radius: '50%',
                data: data.map(item => ({ value: item.projects, name: item.type }))
            }
        ];

        const option: EChartsOption = {
            title: {
                text: 'Project Types Distribution',
                left: 'center',
                textStyle: {
                    color: '#333333',
                    fontWeight: 'normal'
                }
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                textStyle: {
                    color: '#333333'
                }
            },
            series: series,
            color: ['#FF9500', '#34C759', '#5AC8FA', '#FF2D55', '#AF52DE'],
            animationDuration: 1000,
            animationEasing: 'cubicOut',
            animationDelay: (idx: number) => idx * 100
        };

        this.projectTypesChart.setOption(option);
    }




    private createInvestmentByRegionChart(): void {
        const chartDom = document.getElementById('investmentByRegionChart');
        if (!chartDom) return;
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
                left: 'center',
                textStyle: {
                    color: '#333333',
                    fontWeight: 'normal'
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderColor: '#ccc',
                borderWidth: 1,
                textStyle: {
                    color: '#333'
                },
                formatter: (params: any) => {
                    let tooltipContent = `<strong>${params[0].axisValue}</strong><br/>`;
                    params.forEach((item: any) => {
                        tooltipContent += `${item.marker} ${item.seriesName}: $${item.value} million<br/>`;
                    });
                    return tooltipContent;
                }
            },
            legend: {
                data: years,
                bottom: 0,
                textStyle: {
                    color: '#333333'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: regions,
                axisLabel: {
                    rotate: 45,
                    interval: 0,
                    color: '#333333'
                }
            },
            yAxis: {
                type: 'value',
                name: 'Investment (Million $)',
                axisLabel: {
                    color: '#333333'
                }
            },
            series: series,
            color: ['#007AFF', '#34C759', '#FF9500', '#FF3B30']
        };

        this.investmentByRegionChart.setOption(option);
    }

    private createProjectsByRegionChart(): void {
        const chartDom = document.getElementById('projectsByRegionChart');
        if (!chartDom) return;
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
                left: 'center',
                textStyle: {
                    color: '#333333',
                    fontWeight: 'normal'
                }
            },
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderColor: '#ccc',
                borderWidth: 1,
                textStyle: {
                    color: '#333'
                },
                formatter: '{b}: {c} projects'
            },
            xAxis: {
                type: 'category',
                data: data.map(item => item.region),
                axisLabel: {
                    rotate: 45,
                    interval: 0,
                    color: '#333333'
                }
            },
            yAxis: {
                type: 'value',
                name: 'Number of Projects',
                axisLabel: {
                    color: '#333333'
                }
            },
            series: series,
            color: ['#5856D6'],
            animationDuration: 1000,
            animationEasing: 'cubicOut',
            animationDelay: (idx: number) => idx * 100
        };

        this.projectsByRegionChart.setOption(option);
    }

    private createProjectsByClimateObjectivesChart(): void {
        const chartDom = document.getElementById('projectsByClimateObjectivesChart');
        if (!chartDom) return;
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
                left: 'center',
                textStyle: {
                    color: '#333333',
                    fontWeight: 'normal'
                }
            },
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderColor: '#ccc',
                borderWidth: 1,
                textStyle: {
                    color: '#333'
                },
                formatter: '{b}: {c} projects ({d}%)'
            },
            series: series,
            color: ['#FF2D55', '#5AC8FA', '#FFCC00'],
            label: {
                formatter: '{b}: {d}%',
                position: 'outside',
                color: '#333333'
            },
            animationDuration: 1000,
            animationEasing: 'cubicOut',
            animationDelay: (idx: number) => idx * 100
        };

        this.projectsByClimateObjectivesChart.setOption(option);
    }

    private createInvestmentsByClimateObjectivesChart(): void {
        const chartDom = document.getElementById('investmentsByClimateObjectivesChart');
        if (!chartDom) return;
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
                left: 'center',
                textStyle: {
                    color: '#333333',
                    fontWeight: 'normal'
                }
            },
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderColor: '#ccc',
                borderWidth: 1,
                textStyle: {
                    color: '#333'
                },
                formatter: '{b}: ${c} million ({d}%)'
            },
            series: series,
            color: ['#FF2D55', '#5AC8FA', '#FFCC00'],
            label: {
                formatter: '{b}: ${c}M',
                position: 'outside',
                color: '#333333'
            },
            animationDuration: 1000,
            animationEasing: 'cubicOut',
            animationDelay: (idx: number) => idx * 100
        };

        this.investmentsByClimateObjectivesChart.setOption(option);
    }

    private createTotalProjectsBySectorChart(): void {
        const chartDom = document.getElementById('totalProjectsBySectorChart');
        if (!chartDom) return;
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
                left: 'center',
                textStyle: {
                    color: '#333333',
                    fontWeight: 'normal'
                }
            },
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderColor: '#ccc',
                borderWidth: 1,
                textStyle: {
                    color: '#333'
                },
                formatter: '{b}: {c} projects'
            },
            xAxis: {
                type: 'category',
                data: data.map(item => item.sector),
                axisLabel: {
                    rotate: 45,
                    interval: 0,
                    color: '#333333'
                }
            },
            yAxis: {
                type: 'value',
                name: 'Number of Projects',
                axisLabel: {
                    color: '#333333'
                }
            },
            series: series,
            color: ['#007AFF'],
            animationDuration: 1000,
            animationEasing: 'cubicOut',
            animationDelay: (idx: number) => idx * 100
        };

        this.totalProjectsBySectorChart.setOption(option);
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
