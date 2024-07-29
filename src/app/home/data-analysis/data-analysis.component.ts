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

            // After loading Leaflet, apply custom styles to align with Tailwind config
            this.applyLeafletCustomStyles();
        } catch (error) {
            console.error('Error loading Leaflet scripts or styles:', error);
            throw error;
        }
    }

    private applyLeafletCustomStyles(): void {
        // This function will be called after Leaflet is loaded
        // Here you can apply custom styles to Leaflet elements using your Tailwind config colors

        const style = document.createElement('style');
        style.textContent = `
        /* Custom Leaflet styles using Tailwind config colors */
        
        /* Map container */
        .leaflet-container {
            background-color: #F7F7F7; /* primary color */
        }

        /* Popup */
        .leaflet-popup-content-wrapper {
            background-color: #F7F7F7; /* primary color */
            color: #333333; /* accent color */
            border-radius: 10px; /* rounded-apple-lg */
        }
        .leaflet-popup-tip {
            background-color: #F7F7F7; /* primary color */
        }

        /* Controls */
        .leaflet-control-zoom a {
            background-color: #F7F7F7; /* primary color */
            color: #333333; /* accent color */
            border-color: #d8d8cd; /* accent2 color */
        }
        .leaflet-control-zoom a:hover {
            background-color: #D60000; /* secondary color */
            color: #F7F7F7; /* primary color */
        }

        /* Attribution */
        .leaflet-control-attribution {
            background-color: rgba(247, 247, 247, 0.7) !important; /* primary color with opacity */
            color: #333333 !important; /* accent color */
        }

        /* You can add more custom styles here as needed */
    `;
        document.head.appendChild(style);
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
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '18',
                        fontWeight: 'bold',
                        color: '#333333' // accent color for emphasized text
                    }
                },
                labelLine: {
                    show: false
                },
                data: data.map(item => ({ value: item.projects, name: item.type }))
            }
        ];

        const option: EChartsOption = {
            backgroundColor: '#F7F7F7', // primary color as background
            title: {
                text: 'Project Types Distribution',
                left: 'center',
                top: '5%',
                textStyle: {
                    color: '#333333', // accent color for title
                    fontSize: 18,
                    fontWeight: 'bold',
                    fontFamily: 'Inter, sans-serif' // Using Inter font as specified in Tailwind config
                }
            },
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} projects ({d}%)',
                backgroundColor: 'rgba(247, 247, 247, 0.9)', // primary color with opacity
                borderColor: '#d8d8cd', // accent2 color for border
                borderWidth: 1,
                textStyle: {
                    color: '#333333', // accent color for tooltip text
                    fontFamily: 'Inter, sans-serif'
                }
            },
            legend: {
                orient: 'vertical',
                left: '5%',
                top: 'center',
                itemWidth: 25,
                itemHeight: 14,
                itemGap: 12,
                textStyle: {
                    color: '#333333', // accent color for legend text
                    fontSize: 14,
                    fontFamily: 'Inter, sans-serif'
                }
            },
            series: series,
            color: ['#D60000', '#2c4143', '#58707b', '#ffce32', '#61a8bd'], // Using secondary, accent3, accent4, accent5, accent6 colors
            animationDuration: 1000,
            animationEasing: 'cubicInOut',
            animationDelay: (idx: number) => idx * 150
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
            data: this.investmentData.map(item => item[year as keyof typeof item] as number),
            barGap: '10%',
            barCategoryGap: '20%',
            itemStyle: {
                borderRadius: [4, 4, 0, 0]
            }
        }));

        const option: EChartsOption = {
            backgroundColor: '#F7F7F7', // primary color as background
            title: {
                text: 'Infrastructure Investment by Region',
                left: 'center',
                top: '20px',
                textStyle: {
                    color: '#333333', // accent color for title
                    fontWeight: 'bold',
                    fontSize: 18,
                    fontFamily: 'Inter, sans-serif'
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                backgroundColor: 'rgba(247, 247, 247, 0.9)', // primary color with opacity
                borderColor: '#d8d8cd', // accent2 color for border
                borderWidth: 1,
                textStyle: {
                    color: '#333333', // accent color for tooltip text
                    fontFamily: 'Inter, sans-serif'
                },
                formatter: (params: any) => {
                    let tooltipContent = `<strong>${params[0].axisValue}</strong><br/>`;
                    params.forEach((item: any) => {
                        tooltipContent += `${item.marker} ${item.seriesName}: $${item.value.toLocaleString()} million<br/>`;
                    });
                    return tooltipContent;
                }
            },
            legend: {
                data: years,
                bottom: '10px',
                textStyle: {
                    color: '#333333', // accent color for legend text
                    fontFamily: 'Inter, sans-serif'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: regions,
                axisLabel: {
                    rotate: 45,
                    interval: 0,
                    color: '#333333', // accent color for axis labels
                    fontFamily: 'Inter, sans-serif'
                },
                axisLine: {
                    lineStyle: {
                        color: '#d8d8cd' // accent2 color for axis line
                    }
                }
            },
            yAxis: {
                type: 'value',
                name: 'Investment (Million $)',
                nameTextStyle: {
                    color: '#333333', // accent color for axis name
                    fontFamily: 'Inter, sans-serif'
                },
                axisLabel: {
                    color: '#333333', // accent color for axis labels
                    fontFamily: 'Inter, sans-serif'
                },
                axisLine: {
                    lineStyle: {
                        color: '#d8d8cd' // accent2 color for axis line
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: '#d8d8cd' // accent2 color for split lines
                    }
                }
            },
            series: series,
            color: ['#D60000', '#2c4143', '#58707b', '#61a8bd'], // Using secondary, accent3, accent4, accent6 colors
            animationDuration: 1000,
            animationEasing: 'cubicInOut'
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
                data: data.map(item => item.projects),
                itemStyle: {
                    borderRadius: [4, 4, 0, 0]
                },
                emphasis: {
                    itemStyle: {
                        color: '#58707b' // accent4 color for hover effect
                    }
                }
            }
        ];

        const option: EChartsOption = {
            backgroundColor: '#F7F7F7', // primary color as background
            title: {
                text: 'Projects per Region',
                left: 'center',
                top: '20px',
                textStyle: {
                    color: '#333333', // accent color for title
                    fontWeight: 'bold',
                    fontSize: 18,
                    fontFamily: 'Inter, sans-serif'
                }
            },
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(247, 247, 247, 0.9)', // primary color with opacity
                borderColor: '#d8d8cd', // accent2 color for border
                borderWidth: 1,
                textStyle: {
                    color: '#333333', // accent color for tooltip text
                    fontFamily: 'Inter, sans-serif'
                },
                formatter: '{b}: {c} projects'
            },
            grid: {
                left: '5%',
                right: '5%',
                bottom: '15%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: data.map(item => item.region),
                axisLabel: {
                    rotate: 45,
                    interval: 0,
                    color: '#333333', // accent color for axis labels
                    fontFamily: 'Inter, sans-serif'
                },
                axisLine: {
                    lineStyle: {
                        color: '#d8d8cd' // accent2 color for axis line
                    }
                }
            },
            yAxis: {
                type: 'value',
                name: 'Number of Projects',
                nameTextStyle: {
                    color: '#333333', // accent color for axis name
                    fontFamily: 'Inter, sans-serif'
                },
                axisLabel: {
                    color: '#333333', // accent color for axis labels
                    fontFamily: 'Inter, sans-serif'
                },
                axisLine: {
                    lineStyle: {
                        color: '#d8d8cd' // accent2 color for axis line
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: '#d8d8cd' // accent2 color for split lines
                    }
                }
            },
            series: series,
            color: ['#D60000'], // Using secondary color for bars
            animationDuration: 1000,
            animationEasing: 'cubicInOut',
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
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '18',
                        fontWeight: 'bold',
                        color: '#333333'
                    }
                },
                labelLine: {
                    show: false
                },
                data: data.map(item => ({ value: item.projects, name: item.objective }))
            }
        ];

        const option: EChartsOption = {
            backgroundColor: '#F7F7F7', // primary color as background
            title: {
                text: 'Projects per Climate Objective',
                left: 'center',
                top: '5%',
                textStyle: {
                    color: '#333333', // accent color for title
                    fontWeight: 'bold',
                    fontSize: 18,
                    fontFamily: 'Inter, sans-serif'
                }
            },
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(247, 247, 247, 0.9)', // primary color with opacity
                borderColor: '#d8d8cd', // accent2 color for border
                borderWidth: 1,
                textStyle: {
                    color: '#333333', // accent color for tooltip text
                    fontFamily: 'Inter, sans-serif'
                },
                formatter: '{b}: {c} projects ({d}%)'
            },
            legend: {
                orient: 'vertical',
                left: '5%',
                top: 'center',
                itemWidth: 25,
                itemHeight: 14,
                itemGap: 12,
                textStyle: {
                    color: '#333333', // accent color for legend text
                    fontSize: 14,
                    fontFamily: 'Inter, sans-serif'
                }
            },
            series: series,
            color: ['#D60000', '#2c4143', '#58707b'], // Using secondary, accent3, accent4 colors
            animationDuration: 1000,
            animationEasing: 'cubicInOut',
            animationDelay: (idx: number) => idx * 150
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
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '18',
                        fontWeight: 'bold',
                        color: '#333333'
                    }
                },
                labelLine: {
                    show: false
                },
                data: data.map(item => ({ value: item.investment, name: item.objective }))
            }
        ];

        const option: EChartsOption = {
            backgroundColor: '#F7F7F7', // primary color as background
            title: {
                text: 'Investments per Climate Objective',
                left: 'center',
                top: '5%',
                textStyle: {
                    color: '#333333', // accent color for title
                    fontWeight: 'bold',
                    fontSize: 18,
                    fontFamily: 'Inter, sans-serif'
                }
            },
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(247, 247, 247, 0.9)', // primary color with opacity
                borderColor: '#d8d8cd', // accent2 color for border
                borderWidth: 1,
                textStyle: {
                    color: '#333333', // accent color for tooltip text
                    fontFamily: 'Inter, sans-serif'
                },
                formatter: (params: any) => {
                    const value = params.value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
                    return `${params.name}: ${value} million (${params.percent}%)`;
                }
            },
            legend: {
                orient: 'vertical',
                left: '5%',
                top: 'center',
                itemWidth: 25,
                itemHeight: 14,
                itemGap: 12,
                textStyle: {
                    color: '#333333', // accent color for legend text
                    fontSize: 14,
                    fontFamily: 'Inter, sans-serif'
                }
            },
            series: series,
            color: ['#D60000', '#2c4143', '#58707b'], // Using secondary, accent3, accent4 colors
            animationDuration: 1000,
            animationEasing: 'cubicInOut',
            animationDelay: (idx: number) => idx * 150
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
                data: data.map(item => item.projects),
                itemStyle: {
                    borderRadius: [4, 4, 0, 0]
                },
                emphasis: {
                    itemStyle: {
                        color: '#58707b' // accent4 color for hover effect
                    }
                }
            }
        ];

        const option: EChartsOption = {
            backgroundColor: '#F7F7F7', // primary color as background
            title: {
                text: 'Total Projects per Sector',
                left: 'center',
                top: '20px',
                textStyle: {
                    color: '#333333', // accent color for title
                    fontWeight: 'bold',
                    fontSize: 18,
                    fontFamily: 'Inter, sans-serif'
                }
            },
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(247, 247, 247, 0.9)', // primary color with opacity
                borderColor: '#d8d8cd', // accent2 color for border
                borderWidth: 1,
                textStyle: {
                    color: '#333333', // accent color for tooltip text
                    fontFamily: 'Inter, sans-serif'
                },
                formatter: '{b}: {c} projects'
            },
            grid: {
                left: '5%',
                right: '5%',
                bottom: '15%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: data.map(item => item.sector),
                axisLabel: {
                    rotate: 45,
                    interval: 0,
                    color: '#333333', // accent color for axis labels
                    fontFamily: 'Inter, sans-serif'
                },
                axisLine: {
                    lineStyle: {
                        color: '#d8d8cd' // accent2 color for axis line
                    }
                }
            },
            yAxis: {
                type: 'value',
                name: 'Number of Projects',
                nameTextStyle: {
                    color: '#333333', // accent color for axis name
                    fontFamily: 'Inter, sans-serif'
                },
                axisLabel: {
                    color: '#333333', // accent color for axis labels
                    fontFamily: 'Inter, sans-serif'
                },
                axisLine: {
                    lineStyle: {
                        color: '#d8d8cd' // accent2 color for axis line
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: '#d8d8cd' // accent2 color for split lines
                    }
                }
            },
            series: series,
            color: ['#D60000'], // Using secondary color for bars
            animationDuration: 1000,
            animationEasing: 'cubicInOut',
            animationDelay: (idx: number) => idx * 100
        };

        this.totalProjectsBySectorChart.setOption(option);
    }

    toggleDropdown(chartName: string): void {
        this.dropdownOpen[chartName] = !this.dropdownOpen[chartName];
    }


}
