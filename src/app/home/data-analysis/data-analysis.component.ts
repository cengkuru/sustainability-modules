import { CommonModule } from "@angular/common";
import { Component, AfterViewInit, ElementRef, ViewChild, NgZone, HostListener, ChangeDetectorRef } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import * as echarts from 'echarts';
import { EChartsOption, BarSeriesOption, PieSeriesOption } from 'echarts';
import * as L from 'leaflet';
import { ScriptLoaderService } from "../../services/scriptLoader.service";
import { Project } from "../../models/vizprojects.model";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import firebase from "firebase/compat";
import DocumentData = firebase.firestore.DocumentData;
import {CallbackDataParams} from "echarts/types/dist/shared";

type ChartName = 'investmentByRegion' | 'projectsByRegion' | 'projectsByClimateObjectives' |
    'investmentsByClimateObjectives' | 'projectTypes' |
    'infrastructureInvestment';


// You might also want to add a type for the click event parameters
interface ChartClickEventParams {
    componentType: string;
    seriesType: string;
    seriesIndex: number;
    seriesName: string;
    name: string;
    dataIndex: number;
    data: any;
    dataType: string;
    value: number | number[];
    color: string;
}

@Component({
    selector: 'app-data-analysis',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './data-analysis.component.html',
    styleUrls: ['./data-analysis.component.scss']
})
export class DataAnalysisComponent implements AfterViewInit {
    @ViewChild('mapContainer') mapContainer!: ElementRef;

    charts: { [key in ChartName]?: echarts.ECharts } = {};

    private map!: L.Map;
    projects: Project[] = [];
    filteredProjects: Project[] = [];

    isLoading: boolean = true;
    mapInitialized: boolean = false;
    projectsLoaded: boolean = false;
    private viewInitialized: boolean = false;


    markers: { lat: number; lng: number; popup: string; status: string; }[] = [];


    // Brand Colors
    private readonly brandColors = {
        primary: '#f7f7f7',
        secondary: '#d60000',
        accent: '#333333',
        accent1: '#ffce32',
        accent2: '#d8d8cd',
        accent3: '#2c4143',
        accent4: '#58707b',
        accent5: '#9bcbd9',
        accent6: '#61a8bd'
    };



    dropdownOpen: Record<ChartName, boolean> = {
        investmentByRegion: true,
        projectsByRegion: true,
        projectsByClimateObjectives: true,
        investmentsByClimateObjectives: true,
        projectTypes: true,
        infrastructureInvestment: true
    };

    chartNames: ChartName[] = [
        'infrastructureInvestment',
        'projectsByRegion',
        'investmentsByClimateObjectives',
        'investmentByRegion'  // Add this line
    ];



    // Filters
    regions: string[] = [];
    sectors: string[] = [];
    climateObjectives: string[] = [];
    selectedRegion: string = 'All';
    selectedSector: string = 'All';
    selectedClimateObjective: string = 'All';
    startYear: number = 0;
    endYear: number = 0;

    minYear: number = 0;
    maxYear: number = 0;

    // Key Metrics
    totalProjects: number = 0;
    projectCompletionRate: number = 0;
    jobsCreated: number = 0;

    climateRiskAssessmentPercentage: number = 0;
    sustainableSubsectorBreakdown: { [key: string]: number } = {};
    sortedSubsectorBreakdown: { key: string; value: number; percentage: number }[] = [];


    stats = [
        { title: 'Total Projects', value: this.totalProjects, icon: 'bi-folder2-open', description: `from ${this.regions.length - 1} Regions`, format: '1.0-0' },
        { title: 'Project Completion', value: this.projectCompletionRate, icon: 'bi-graph-up', description: 'of projects completed', format: '1.0-0' },
        { title: 'Jobs Created', value: this.jobsCreated, icon: 'bi-people', description: 'estimated new jobs', format: '1.0-0' },
        { title: 'Risk Assessment', value: this.climateRiskAssessmentPercentage, icon: 'bi-clipboard-check', description: 'projects with published assessment', format: '1.0-0' }
    ];



    constructor(
        private http: HttpClient,
        private ngZone: NgZone,
        private scriptLoader: ScriptLoaderService,
        private cdr: ChangeDetectorRef,
        private firestore: AngularFirestore,
    ) { }

    async ngOnInit(): Promise<void> {
        try {
            await this.loadLeafletScripts();
            await this.loadProjects();
            this.updateKeyMetrics();
            this.initializeCharts();
            this.cdr.detectChanges();
        } catch (error) {
            console.error('Error during component initialization:', error);
        }
    }

    ngAfterViewInit() {
        this.viewInitialized = true;
        this.ngZone.runOutsideAngular(() => {
            setTimeout(() => {
                this.checkAndInitializeMap();
            }, 0);
        });
    }

    ngOnDestroy(): void {
        if (this.map) {
            this.map.remove();
        }
    }

    private updateChartStyles(option: EChartsOption): EChartsOption {
        const appleStyling: Partial<EChartsOption> = {
            backgroundColor: this.brandColors.primary,
            textStyle: {
                fontFamily: 'Inter, sans-serif',
                color: this.brandColors.accent
            },
            title: {
                textStyle: {
                    color: this.brandColors.accent,
                    fontWeight: 'bold',
                    fontSize: 18
                }
            },
            tooltip: {
                backgroundColor: `rgba(247, 247, 247, 0.9)`,
                borderColor: this.brandColors.accent2,
                borderWidth: 1,
                textStyle: {
                    color: this.brandColors.accent
                }
            },
            legend: {
                textStyle: {
                    color: this.brandColors.accent
                }
            },
            xAxis: {
                axisLine: {
                    lineStyle: {
                        color: this.brandColors.accent2
                    }
                },
                axisLabel: {
                    color: this.brandColors.accent
                }
            },
            yAxis: {
                axisLine: {
                    lineStyle: {
                        color: this.brandColors.accent2
                    }
                },
                axisLabel: {
                    color: this.brandColors.accent
                },
                splitLine: {
                    lineStyle: {
                        color: this.brandColors.accent2
                    }
                }
            }
        };

        return { ...option, ...appleStyling };
    }


    private async loadLeafletScripts(): Promise<void> {
        const scripts = [
            'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js'
        ];
        const styles = [
            'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css'
        ];

        try {
            await this.scriptLoader.loadScripts(scripts);
            await this.scriptLoader.loadStyles(styles);
            // After loading Leaflet, apply custom styles to align with Tailwind config
            this.applyLeafletCustomStyles();
        } catch (error) {
            console.error('Error loading Leaflet scripts or styles:', error);
            throw error;
        }
    }


    getChartTitle(chartName: ChartName): string {
        const titles: Record<ChartName, string> = {
            infrastructureInvestment: 'Investment by Sector',
            projectsByRegion: 'Projects by Region',
            investmentsByClimateObjectives: 'Investment by Climate Objective',
            investmentByRegion: 'Investment by Region',
            projectsByClimateObjectives: 'Projects by Climate Objectives',
            projectTypes: 'Project Types'
        };
        return titles[chartName] || 'Chart';
    }

    toggleDropdown(chartName: ChartName): void {
        this.dropdownOpen[chartName] = !this.dropdownOpen[chartName];
        setTimeout(() => {
            this.charts[chartName]?.resize();
        }, 0);
    }

    // Update the chart creation methods to use Apple-inspired styles

    private applyLeafletCustomStyles(): void {
        const style = document.createElement('style');
        style.textContent = `
        .leaflet-container {
            background-color: ${this.brandColors.primary};
        }
        .leaflet-popup-content-wrapper {
            background-color: ${this.brandColors.primary};
            color: ${this.brandColors.accent};
            border-radius: 10px;
        }
        .leaflet-popup-tip {
            background-color: ${this.brandColors.primary};
        }
        .leaflet-control-zoom a {
            background-color: ${this.brandColors.primary};
            color: ${this.brandColors.accent};
            border-color: ${this.brandColors.accent2};
        }
        .leaflet-control-zoom a:hover {
            background-color: ${this.brandColors.secondary};
            color: ${this.brandColors.primary};
        }
        .leaflet-control-attribution {
            background-color: rgba(247, 247, 247, 0.7) !important;
            color: ${this.brandColors.accent} !important;
        }
    `;
        document.head.appendChild(style);
    }

    checkAndInitializeMap(): void {
        if (this.viewInitialized && this.projectsLoaded && this.mapContainer && this.mapContainer.nativeElement) {
            setTimeout(() => {
                this.initializeMap();
            }, 100);  // 100ms delay
        } else {
            if (!this.mapContainer) {
                console.error('Map container is not available');
            }
            setTimeout(() => this.checkAndInitializeMap(), 100);
        }
    }


    private getPulsingIcon(status: string): L.DivIcon {
        const color = '#D60000';
        return L.divIcon({
            className: 'pulsing-icon',
            html: `
            <div class="relative w-6 h-6">
                <div class="absolute inset-0 pulse-ring rounded-full border-2" style="border-color: ${color};"></div>
                <div class="absolute inset-0 rounded-full" style="background-color: ${color};"></div>
            </div>
        `,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
    }
    private getColorForStatus(status: string): string {
        const statusColors: { [key: string]: string } = {
            'Completed': '#4caf50',
            'In Progress': '#ffc107',
            'Planned': '#2196f3',
            'Other': '#d60000'
        };
        return statusColors[status] || statusColors['Other'];
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
            const marker = L.marker([markerData.lat, markerData.lng], {
                icon: this.getPulsingIcon(markerData.status)
            }).addTo(this.map);
            marker.bindPopup(markerData.popup);
        });

        this.fitMapBounds();
        this.mapInitialized = true;
        console.log('Map initialized successfully');
    }


    generateMarkers() {
        console.log('generateMarkers called');
        this.markers = this.filteredProjects.map(project => {
            if (project.location) {
                const popup = `
                <div class="p-6 max-w-sm bg-primary-100 rounded-apple ">
                    <h3 class="text-lg font-semibold mb-2 text-accent-300">${project.name}</h3>
                    <p class="mb-2 text-accent-100">
                        <span class="font-medium">Budget:</span> 
                        ${project.budget.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </p>
                    <p class="mb-4 text-accent-100">
                        <span class="font-medium">Region:</span> ${project.region.name}
                    </p>
                </div>
            `;
                return {
                    lat: project.location.lat,
                    lng: project.location.lng,
                    popup: popup,
                    status: this.getProjectStatus(project)
                };
            }
            return null;
        }).filter((marker): marker is { lat: number; lng: number; popup: string; status: string } => marker !== null);
        console.log('Generated markers:', this.markers);
    }

    private getProjectStatus(project: Project): string {
        const currentYear = new Date().getFullYear();
        const investmentYears = Object.keys(project.yearlyInvestment).map(Number);

        if (investmentYears.length === 0) {
            return 'Planned';
        }

        const latestInvestmentYear = Math.max(...investmentYears);
        const earliestInvestmentYear = Math.min(...investmentYears);

        if (latestInvestmentYear < currentYear) {
            return 'Completed';
        } else if (earliestInvestmentYear > currentYear) {
            return 'Planned';
        } else {
            return 'In Progress';
        }
    }

    fitMapBounds() {
        if (this.projects.length > 0 && this.map) {
            const bounds = L.latLngBounds(this.projects.map(p => [p.location.lat, p.location.lng]));
            this.map.fitBounds(bounds);
        }
    }

    async loadProjects() {
        this.isLoading = true;
        try {
            const snapshot = await this.firestore.collection<Project>('dataVizProjects').get().toPromise();
            if (snapshot) {
                this.projects = snapshot.docs.map(doc => this.convertToProject(doc.id, doc.data()));
                this.filteredProjects = [...this.projects];
                this.projectsLoaded = true;
                console.log(this.projects);
                this.initializeFilters();
                this.calculateNewMetrics();
                this.updateKeyMetrics();
                this.generateMarkers(); // Add this line
                this.checkAndInitializeMap();
            } else {
                console.error('No data received from Firestore');
                this.projects = [];
                this.filteredProjects = [];
            }
        } catch (error) {
            console.error('Error loading projects:', error);
            this.projects = [];
            this.filteredProjects = [];
        } finally {
            this.isLoading = false;
        }
    }

    private convertToProject(id: string, data: DocumentData): Project {
        return {
            id,
            name: data['name'] || '',
            budget: data['budget'] || 0,
            region: data['region'] || { name: '', code: '', population: 0 },
            location: data['location'] || { lat: 0, lng: 0 },
            climateObjective: data['climateObjective'] || '',
            sector: data['sector'] || '',
            subsector: data['subsector'] || '',
            projectType: data['projectType'] || '',
            date: data['date'] || '',
            yearlyInvestment: data['yearlyInvestment'] || {},
            climateAndDisasterRiskAssessmentPublished: data['climateAndDisasterRiskAssessmentPublished'] || false,
            sustainableSubsector: data['sustainableSubsector'] || ''
        };
    }

    initializeFilters() {
        this.regions = ['All', ...new Set(this.projects.map(p => p.region.name))];
        this.sectors = ['All', ...new Set(this.projects.map(p => p.sector))];
        this.climateObjectives = ['All', ...new Set(this.projects.map(p => p.climateObjective))];
        const years = this.projects.flatMap(p => Object.keys(p.yearlyInvestment).map(Number));
        this.startYear = this.minYear = Math.min(...years);
        this.endYear = this.maxYear = Math.max(...years);
    }

    getSubsectorIcon(subsector: string): string {
        const iconMap: { [key: string]: string } = {
            'Biomass': 'bi bi-tree',
            'Flood protection': 'bi bi-water',
            'Geothermal': 'bi bi-thermometer-half',
            'Hydropower': 'bi bi-droplet',
            'Low carbon transport': 'bi bi-bicycle',
            'Natural resource management': 'bi bi-flower1',
            'Renewable energy': 'bi bi-sun',
            'Solar': 'bi bi-brightness-high',
            'Transport': 'bi bi-truck',
            'Water and wastewater management': 'bi bi-moisture',
            'Wind': 'bi bi-wind'
        };

        return iconMap[subsector] || 'bi bi-question-circle';
    }


    applyFilters() {
        this.filteredProjects = this.projects.filter(p =>
            (this.selectedRegion === 'All' || p.region.name === this.selectedRegion) &&
            (this.selectedSector === 'All' || p.sector === this.selectedSector) &&
            (this.selectedClimateObjective === 'All' || p.climateObjective === this.selectedClimateObjective) &&
            Object.keys(p.yearlyInvestment).some(year => {
                const y = Number(year);
                return y >= this.startYear && y <= this.endYear;
            })
        );
        this.updateKeyMetrics();
        this.updateSustainableSubsectorBreakdown();
        this.generateMarkers(); // Add this line
        this.updateAllCharts();
        this.updateMapMarkers(); // Add this method to update the map markers
        this.cdr.detectChanges();
    }

// Add this new method to update the map markers
    private updateMapMarkers() {
        if (this.map) {
            // Clear existing markers
            this.map.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                    this.map.removeLayer(layer);
                }
            });

            // Add new markers
            this.markers.forEach(markerData => {
                const marker = L.marker([markerData.lat, markerData.lng], {
                    icon: this.getPulsingIcon(markerData.status)
                }).addTo(this.map);
                marker.bindPopup(markerData.popup);
            });

            this.fitMapBounds();
        }
    }

    private updateSustainableSubsectorBreakdown() {
        this.sustainableSubsectorBreakdown = this.filteredProjects.reduce((acc, p) => {
            if (p.sustainableSubsector) {
                acc[p.sustainableSubsector] = (acc[p.sustainableSubsector] || 0) + 1;
            }
            return acc;
        }, {} as { [key: string]: number });

        this.totalProjects = this.filteredProjects.length;

        this.sortedSubsectorBreakdown = Object.entries(this.sustainableSubsectorBreakdown)
            .map(([key, value]) => ({
                key,
                value,
                percentage: (value / this.totalProjects) * 100
            }))
            .sort((a, b) => b.value - a.value);
    }


    updateKeyMetrics() {
        this.totalProjects = this.filteredProjects.length;

        // Update sustainableSubsectorBreakdown
        this.updateSustainableSubsectorBreakdown();

        // Assuming a project is completed if it has no investment in the last year
        const completedProjects = this.filteredProjects.filter(p =>
            !p.yearlyInvestment[this.endYear.toString()]
        ).length;
        this.projectCompletionRate = (completedProjects / this.totalProjects) * 100 || 0;
        // Assuming each project creates a random number of jobs between 100 and 1000
        this.jobsCreated = this.filteredProjects.reduce((sum, p) =>
            sum + Math.floor(Math.random() * 900 + 100), 0
        );

        // Update the stats array
        this.stats = [
            { title: 'Total Projects', value: this.totalProjects, icon: 'bi-folder2-open', description: `from ${this.regions.length - 1} Regions`, format: '1.0-0' },
            { title: 'Project Completion', value: this.projectCompletionRate, icon: 'bi-graph-up', description: 'of projects completed', format: '1.0-0' },
            { title: 'Jobs Created', value: this.jobsCreated, icon: 'bi-people', description: 'estimated new jobs', format: '1.0-0' },
            { title: 'Risk Assessment', value: this.climateRiskAssessmentPercentage, icon: 'bi-clipboard-check', description: 'projects with published assessment', format: '1.0-0' }
        ];

        console.log('Updated metrics:', { totalProjects: this.totalProjects, projectCompletionRate: this.projectCompletionRate, jobsCreated: this.jobsCreated });
    }


    private initializeCharts(): void {
        this.chartNames.forEach(chartName => {
            const chartDom = document.getElementById(chartName + 'Chart');
            if (chartDom) {
                this.charts[chartName] = echarts.init(chartDom);
                this.updateChart(chartName);
            }
        });
    }

    private updateAllCharts(): void {
        Object.keys(this.charts).forEach(chartName => {
            this.updateChart(chartName);
        });
    }

    private updateChart(chartName: string): void {
        switch (chartName) {

            case 'infrastructureInvestment':
                this.createInfrastructureInvestmentChart();
                break;
            case 'projectTypes':
                this.createProjectTypesChart();
                break;
            case 'investmentByRegion':
                this.createInvestmentByRegionChart();
                break;
            case 'projectsByRegion':
                this.createProjectsByRegionChart();
                break;
            case 'projectsByClimateObjectives':
                this.createProjectsByClimateObjectivesChart();
                break;
            case 'investmentsByClimateObjectives':
                this.createInvestmentsByClimateObjectivesChart();
                break;
        }
    }


    private createInfrastructureInvestmentChart(): void {
        const chart = this.charts['infrastructureInvestment'];
        if (!chart) return;

        const processData = (projects: Project[], groupBy: 'sector' | 'subsector') => {
            const investmentData = projects.reduce((acc, project) => {
                const key = project[groupBy];
                if (!acc[key]) {
                    acc[key] = { value: 0, projectCount: 0 };
                }
                acc[key].value += project.budget;
                acc[key].projectCount++;
                return acc;
            }, {} as { [key: string]: { value: number, projectCount: number } });

            return Object.entries(investmentData).map(([name, data]) => ({
                name,
                value: data.value,
                projectCount: data.projectCount
            }));
        };

        const renderChart = (data: any[], title: string) => {
            const totalInvestment = data.reduce((sum, item) => sum + item.value, 0);

            const option: EChartsOption = {
                title: {
                    text: title,
                    left: 'center',
                    top: 20,
                    textStyle: {
                        fontSize: 18,
                        fontWeight: 'bold',
                        fontFamily: 'Inter, sans-serif',
                        color: this.brandColors.accent
                    }
                },
                tooltip: {
                    formatter: (info: any) => {
                        const value = info.value.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'ZAR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        });
                        const percentage = ((info.value / totalInvestment) * 100).toFixed(2);
                        return `<strong>${info.name}</strong><br/>` +
                            `Investment: ${value}<br/>` +
                            `Percentage: ${percentage}%<br/>` +
                            `Projects: ${info.data.projectCount}`;
                    },
                    backgroundColor: this.brandColors.primary,
                    borderColor: this.brandColors.accent2,
                    textStyle: {
                        color: this.brandColors.accent
                    }
                },
                series: [{
                    name: 'Infrastructure Investment',
                    type: 'treemap',
                    data: data,
                    label: {
                        show: true,
                        formatter: (params: any) => {
                            return `{name|${params.name}}\n{value|${params.value.toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'ZAR',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            })}}`;
                        },
                        rich: {
                            name: {
                                fontSize: 14,
                                fontWeight: 'bold',
                                color: this.brandColors.primary,
                                lineHeight: 20
                            },
                            value: {
                                fontSize: 12,
                                color: this.brandColors.primary,
                                lineHeight: 20
                            }
                        }
                    },
                    itemStyle: {
                        borderColor: this.brandColors.primary,
                        borderWidth: 1,
                        gapWidth: 1
                    },
                    levels: [
                        {
                            itemStyle: {
                                borderColor: this.brandColors.primary,
                                borderWidth: 0,
                                gapWidth: 1
                            }
                        },
                        {
                            colorSaturation: [0.3, 0.6],
                            itemStyle: {
                                borderColorSaturation: 0.7,
                                gapWidth: 2,
                                borderWidth: 2
                            }
                        }
                    ],
                    breadcrumb: { show: false }
                }],
                color: [
                    this.brandColors.secondary,
                    this.brandColors.accent6,
                    this.brandColors.accent5,
                    this.brandColors.accent1,
                    this.brandColors.accent3,
                    this.brandColors.accent4,
                    this.brandColors.accent2
                ],
                toolbox: {
                    show: false  // Disable the toolbox completely
                },
                dataZoom: [
                    {
                        type: 'inside',
                        disabled: true  // Disable inside zoom
                    },
                    {
                        type: 'slider',
                        show: false  // Hide zoom slider
                    }
                ],
                grid: {
                    left: '5%',
                    right: '5%',
                    bottom: '10%',
                    top: '10%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: data.map(item => item.name),
                    axisLabel: {
                        rotate: 45,
                        interval: 0
                    },
                    axisTick: {
                        alignWithLabel: true
                    }
                },
                yAxis: {
                    type: 'value'
                },
                animation: false  // Disable animations
            };

            chart.setOption(this.updateChartStyles(option));

            // Disable chart dragging
            chart.getZr().off('mousedown');
            chart.getZr().off('mousemove');
            chart.getZr().off('mouseup');
        };

        let currentData = processData(this.filteredProjects, 'sector');
        let currentTitle = 'Infrastructure Investment by Sector';
        let drillStack: { data: any[], title: string }[] = [];

        renderChart(currentData, currentTitle);

        chart.on('click', (params) => {
            if (params.componentType === 'series') {
                if (drillStack.length === 0) {
                    // Drill down to subsector
                    const sector = params.name;
                    const subsectorData = processData(
                        this.filteredProjects.filter(p => p.sector === sector),
                        'subsector'
                    );
                    drillStack.push({ data: currentData, title: currentTitle });
                    currentData = subsectorData;
                    currentTitle = `Infrastructure Investment in ${sector} by Subsector`;
                    renderChart(currentData, currentTitle);
                } else {
                    // Go back to sector view
                    const previousLevel = drillStack.pop();
                    if (previousLevel) {
                        currentData = previousLevel.data;
                        currentTitle = previousLevel.title;
                        renderChart(currentData, currentTitle);
                    }
                }
            }
        });
    }
    private createProjectTypesChart(): void {
        const chartDom = document.getElementById('projectTypesChart');
        if (!chartDom) return;
        this.charts['projectTypes'] = echarts.init(chartDom);

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

        this.charts['projectTypes']!.setOption(option);
    }

    private createInvestmentByRegionChart(): void {
        const chartDom = document.getElementById('investmentByRegionChart');
        if (!chartDom) return;
        this.charts['investmentByRegion'] = echarts.init(chartDom);
    
        // Extract unique regions and years from the projects
        const regions = Array.from(new Set(this.projects.map(p => p.region.name))).sort();
        const years = Array.from(new Set(
            this.projects.flatMap(p => Object.keys(p.yearlyInvestment))
        )).sort();
    
        // Prepare data for each region
        const series: BarSeriesOption[] = regions.map(region => {
            const data = years.map(year => {
                const yearlyInvestment = this.projects
                    .filter(p => p.region.name === region)
                    .reduce((sum, p) => sum + (p.yearlyInvestment[year] || 0), 0);
                return yearlyInvestment / 1e9; // Convert to billions
            });
    
            return {
                name: region,
                type: 'bar',
                stack: 'total',
                emphasis: {
                    focus: 'series'
                },
                data: data
            };
        });
    
        const option: EChartsOption = {
            backgroundColor: '#f7f7f7', // Light gray background
            title: {
                text: 'Investment by Region',
                left: 'center',
                top: '20px',
                textStyle: {
                    color: '#333333',
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
                formatter: (params: any) => {
                    let tooltip = `${params[0].axisValue}<br/>`;
                    let total = 0;
                    params.forEach((item: any) => {
                        const value = item.value.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'ZAR',
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1
                        });
                        tooltip += `${item.marker} ${item.seriesName}: ${value}B<br/>`;
                        total += item.value;
                    });
                    tooltip += `<strong>Total: ${total.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'ZAR',
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1
                    })}B</strong>`;
                    return tooltip;
                }
            },
            legend: {
                data: regions,
                top: '50px',
                textStyle: {
                    color: '#333333',
                    fontFamily: 'Inter, sans-serif'
                },
                type: 'scroll',
                pageButtonPosition: 'end'
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '10%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: years,
                axisLabel: {
                    color: '#333333',
                    fontFamily: 'Inter, sans-serif'
                },
                axisLine: {
                    lineStyle: {
                        color: '#d8d8cd'
                    }
                }
            },
            yAxis: {
                type: 'value',
                name: 'Investment (Billion ZAR)',
                nameTextStyle: {
                    color: '#333333',
                    fontFamily: 'Inter, sans-serif'
                },
                axisLabel: {
                    color: '#333333',
                    fontFamily: 'Inter, sans-serif',
                    formatter: (value: number) => `${value}`
                },
                axisLine: {
                    lineStyle: {
                        color: '#d8d8cd'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: '#d8d8cd',
                        type: 'dashed'
                    }
                }
            },
            series: series,
            color: [
                this.brandColors.secondary, 
                this.brandColors.accent6, 
                this.brandColors.accent5, 
                this.brandColors.accent1, 
                this.brandColors.accent3,
                this.brandColors.accent4, 
                this.brandColors.accent2, '#795548', '#607D8B', '#3F51B5'
            ],
            animationDuration: 1000,
            animationEasing: 'cubicInOut'
        };
    
        this.charts['investmentByRegion']!.setOption(option);
    }

// Make sure this method is also in your component
    private showRegionDetails(region: string, year: string): void {
        const regionProjects = this.filteredProjects.filter(p =>
            p.region.name === region && p.yearlyInvestment[year]
        );

        const details = regionProjects.map(p => ({
            name: p.name,
            investment: p.yearlyInvestment[year] / 1e6,
            sector: p.sector
        }));

        console.log(`Projects in ${region} for ${year}:`, details);
    }
    public filterChart(selectedRegions?: string[], selectedYears?: string[]): void {
        // Implementation depends on how you want to handle filtering
        // This is just a basic example
        this.filteredProjects = this.projects.filter(p =>
            (!selectedRegions || selectedRegions.includes(p.region.name)) &&
            (!selectedYears || selectedYears.some(year => p.yearlyInvestment[year] > 0))
        );
        this.createInvestmentByRegionChart(); // Recreate the chart with filtered data
    }

    private createProjectsByRegionChart(): void {
        const chartDom = document.getElementById('projectsByRegionChart');
        if (!chartDom) return;
        this.charts['projectsByRegion'] = echarts.init(chartDom);

        const projectsByRegion = this.projects.reduce((acc, project) => {
            acc[project.region.name] = (acc[project.region.name] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        const data = Object.entries(projectsByRegion)
            .map(([region, count]) => ({ region, projects: count }))
            .sort((a, b) => b.projects - a.projects);

        const series: BarSeriesOption[] = [{
            name: 'Projects',
            type: 'bar',
            data: data.map(item => item.projects),
            itemStyle: {
                borderRadius: [4, 4, 0, 0]
            },
            emphasis: {
                itemStyle: {
                    color: '#58707b'
                }
            }
        }];

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
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
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

        this.charts['projectsByRegion']!.setOption(option);
    }

    private createProjectsByClimateObjectivesChart(): void {
        const chartDom = document.getElementById('projectsByClimateObjectivesChart');
        if (!chartDom) return;
        this.charts['projectsByClimateObjectives'] = echarts.init(chartDom);

        // Get unique climate objectives and years
        const climateObjectives = Array.from(new Set(this.projects.map(p => p.climateObjective)));
        const years = Array.from(new Set(this.projects.flatMap(p => Object.keys(p.yearlyInvestment)))).sort();

        // Prepare data for each climate objective
        const series: BarSeriesOption[] = climateObjectives.map(objective => {
            const data = years.map(year => {
                const yearlyInvestment = this.projects
                    .filter(p => p.climateObjective === objective)
                    .reduce((sum, p) => sum + (p.yearlyInvestment[year] || 0), 0);
                return yearlyInvestment / 1e6; // Convert to millions
            });

            return {
                name: objective,
                type: 'bar',
                stack: 'total',
                emphasis: {
                    focus: 'series'
                },
                data: data
            };
        });

        const option: EChartsOption = {
            backgroundColor: this.brandColors.primary,
            title: {
                text: 'Investment by Climate Objective Over Time',
                left: 'center',
                top: '20px',
                textStyle: {
                    color: this.brandColors.accent,
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
                backgroundColor: `rgba(247, 247, 247, 0.9)`,
                borderColor: this.brandColors.accent2,
                borderWidth: 1,
                textStyle: {
                    color: this.brandColors.accent,
                    fontFamily: 'Inter, sans-serif'
                },
                formatter: (params: any) => {
                    let tooltip = `${params[0].axisValue}<br/>`;
                    let total = 0;
                    params.forEach((item: any) => {
                        const value = item.value.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'ZAR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2
                        });
                        tooltip += `${item.marker} ${item.seriesName}: ${value} million<br/>`;
                        total += item.value;
                    });
                    tooltip += `<strong>Total: ${total.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'ZAR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2
                    })} million</strong>`;
                    return tooltip;
                }
            },
            legend: {
                data: climateObjectives,
                bottom: '5%',
                textStyle: {
                    color: this.brandColors.accent,
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
                data: years,
                axisLabel: {
                    color: this.brandColors.accent,
                    fontFamily: 'Inter, sans-serif'
                },
                axisLine: {
                    lineStyle: {
                        color: this.brandColors.accent2
                    }
                }
            },
            yAxis: {
                type: 'value',
                name: 'Investment (Million ZAR)',
                nameTextStyle: {
                    color: this.brandColors.accent,
                    fontFamily: 'Inter, sans-serif'
                },
                axisLabel: {
                    color: this.brandColors.accent,
                    fontFamily: 'Inter, sans-serif'
                },
                axisLine: {
                    lineStyle: {
                        color: this.brandColors.accent2
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: this.brandColors.accent2
                    }
                }
            },
            series: series,
            color: [
                this.brandColors.secondary,
                this.brandColors.accent3,
                this.brandColors.accent4,
                this.brandColors.accent5,
                this.brandColors.accent6
            ],
            animationDuration: 1000,
            animationEasing: 'cubicInOut'
        };

        this.charts['projectsByClimateObjectives']!.setOption(this.updateChartStyles(option));
    }

    private createInvestmentsByClimateObjectivesChart(): void {
        const chartDom = document.getElementById('investmentsByClimateObjectivesChart');
        if (!chartDom) return;
        this.charts['investmentsByClimateObjectives'] = echarts.init(chartDom);
    
        const climateObjectives = ['Mitigation', 'Cross-cutting', 'Adaptation'];
        
        // Extract years from the projects
        const years = Array.from(new Set(
            this.projects.flatMap(p => Object.keys(p.yearlyInvestment))
        )).sort();
    
        // Prepare data for each climate objective
        const series: BarSeriesOption[] = climateObjectives.map(objective => {
            const data = years.map(year => {
                const yearlyInvestment = this.projects
                    .filter(p => p.climateObjective === objective)
                    .reduce((sum, p) => sum + (p.yearlyInvestment[year] || 0), 0);
                return yearlyInvestment / 1e9; // Convert to billions
            });
    
            return {
                name: objective,
                type: 'bar',
                stack: 'total',
                emphasis: {
                    focus: 'series'
                },
                data: data
            };
        });
    
        const option: EChartsOption = {
            backgroundColor: '#f7f7f7', // Light gray background
            title: {
                text: 'Investment by Climate Objective',
                left: 'center',
                top: '20px',
                textStyle: {
                    color: '#333333',
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
                formatter: (params: any) => {
                    let tooltip = `${params[0].axisValue}<br/>`;
                    let total = 0;
                    params.forEach((item: any) => {
                        const value = item.value.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'ZAR',
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1
                        });
                        tooltip += `${item.marker} ${item.seriesName}: ${value}B<br/>`;
                        total += item.value;
                    });
                    tooltip += `<strong>Total: ${total.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'ZAR',
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1
                    })}B</strong>`;
                    return tooltip;
                }
            },
            legend: {
                data: climateObjectives,
                top: '50px',
                textStyle: {
                    color: '#333333',
                    fontFamily: 'Inter, sans-serif'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '10%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: years,
                axisLabel: {
                    color: '#333333',
                    fontFamily: 'Inter, sans-serif'
                },
                axisLine: {
                    lineStyle: {
                        color: '#d8d8cd'
                    }
                }
            },
            yAxis: {
                type: 'value',
                name: 'Investment (Billion ZAR)',
                nameTextStyle: {
                    color: '#333333',
                    fontFamily: 'Inter, sans-serif'
                },
                axisLabel: {
                    color: '#333333',
                    fontFamily: 'Inter, sans-serif',
                    formatter: (value: number) => `${value}`
                },
                axisLine: {
                    lineStyle: {
                        color: '#d8d8cd'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: '#d8d8cd',
                        type: 'dashed'
                    }
                }
            },
            series: series,
            color: [
                '#2c4143',  // Mitigation (blue)
                '#61a8bd',  // Cross-cutting (cyan)
                '#d60000'   // Adaptation (pink)
            ],
            animationDuration: 1000,
            animationEasing: 'cubicInOut'
        };
    
        this.charts['investmentsByClimateObjectives']!.setOption(option);
    }

    @HostListener('window:resize')
    onResize() {
        Object.values(this.charts).forEach(chart => chart?.resize());
    }


    private calculateNewMetrics() {
        // Calculate Climate and Disaster Risk Assessment percentage
        const assessmentCount = this.projects.filter(p => p.climateAndDisasterRiskAssessmentPublished).length;
        this.climateRiskAssessmentPercentage = (assessmentCount / this.projects.length) * 100;

        // Calculate Sustainable Subsector breakdown
        this.sustainableSubsectorBreakdown = this.projects.reduce((acc, p) => {
            acc[p.sustainableSubsector] = (acc[p.sustainableSubsector] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });
    }

    resetFilters() {
        this.selectedRegion = 'All';
        this.selectedSector = 'All';
        this.selectedClimateObjective = 'All';
        this.startYear = this.minYear;
        this.endYear = this.maxYear;
        this.applyFilters();
    }


}
