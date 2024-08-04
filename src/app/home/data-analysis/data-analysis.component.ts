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

type ChartName = 'investmentByRegion' | 'projectsByRegion' | 'projectsByClimateObjectives' |
    'investmentsByClimateObjectives' | 'totalProjectsBySector' | 'projectTypes' |
    'infrastructureInvestment';

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

    markers: { lat: number; lng: number; popup: string; }[] = [];
    isLoading: boolean = true;
    mapInitialized: boolean = false;
    projectsLoaded: boolean = false;
    private viewInitialized: boolean = false;



    dropdownOpen: Record<ChartName, boolean> = {
        investmentByRegion: true,
        projectsByRegion: true,
        projectsByClimateObjectives: true,
        investmentsByClimateObjectives: true,
        totalProjectsBySector: true,
        projectTypes: true,
        infrastructureInvestment: true
    };

    chartNames: ChartName[] = [
        'totalProjectsBySector',
        'infrastructureInvestment',
        'projectsByRegion',
        'investmentsByClimateObjectives'
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

    // Key Metrics
    totalProjects: number = 0;
    projectCompletionRate: number = 0;
    jobsCreated: number = 0;

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
            totalProjectsBySector: 'Projects by Sector',
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
    private updateChartStyles(option: EChartsOption): EChartsOption {
        const appleStyling: Partial<EChartsOption> = {
            backgroundColor: '#FFFFFF',
            textStyle: {
                fontFamily: 'Inter, sans-serif',
                color: '#333333'
            },
            title: {
                textStyle: {
                    color: '#333333',
                    fontWeight: 'bold',
                    fontSize: 18
                }
            },
            tooltip: {
                backgroundColor: 'rgba(247, 247, 247, 0.9)',
                borderColor: '#d8d8cd',
                borderWidth: 1,
                textStyle: {
                    color: '#333333'
                }
            },
            legend: {
                textStyle: {
                    color: '#333333'
                }
            },
            xAxis: {
                axisLine: {
                    lineStyle: {
                        color: '#d8d8cd'
                    }
                },
                axisLabel: {
                    color: '#333333'
                }
            },
            yAxis: {
                axisLine: {
                    lineStyle: {
                        color: '#d8d8cd'
                    }
                },
                axisLabel: {
                    color: '#333333'
                },
                splitLine: {
                    lineStyle: {
                        color: '#d8d8cd'
                    }
                }
            }
        };

        return { ...option, ...appleStyling };
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

        if (this.viewInitialized && this.projectsLoaded && this.mapContainer && this.mapContainer.nativeElement) {
            this.initializeMap();
        } else {
            if (!this.mapContainer) {
                console.error('Map container is not available');
            }
            // Retry after a short delay
            setTimeout(() => this.checkAndInitializeMap(), 100);
        }
    }

    initializeMap(): void {
        if (this.mapInitialized) {
            console.log('Map already initialized');
            return;
        }

        this.map = L.map(this.mapContainer.nativeElement).setView([-28.4793, 24.6727], 6);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        this.projects.forEach(project => {
            const marker = L.marker([project.location.lat, project.location.lng]).addTo(this.map);
            marker.bindPopup(`
                <div class="p-4 max-w-sm">
                    <h3 class="text-lg font-semibold mb-2">${project.name}</h3>
                    <p class="mb-2">Region: ${project.region.name}</p>
                    <p class="mb-4">Budget: $${project.budget.toLocaleString()}</p>
                    <button class="view-details-button px-4 py-2 bg-accent text-secondary rounded hover:bg-secondary hover:text-accent transition duration-300">
                        View Details
                    </button>
                </div>
            `);
        });

        this.fitMapBounds();
        this.mapInitialized = true;
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
                this.initializeFilters();
                this.updateKeyMetrics();
                this.checkAndInitializeMap();
                this.initializeCharts();
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
            this.cdr.detectChanges();
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
            yearlyInvestment: data['yearlyInvestment'] || {}
        };
    }


    initializeFilters() {
        this.regions = ['All', ...new Set(this.projects.map(p => p.region.name))];
        this.sectors = ['All', ...new Set(this.projects.map(p => p.sector))];
        this.climateObjectives = ['All', ...new Set(this.projects.map(p => p.climateObjective))];
        const years = this.projects.flatMap(p => Object.keys(p.yearlyInvestment).map(Number));
        this.startYear = Math.min(...years);
        this.endYear = Math.max(...years);
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
        this.updateAllCharts();
    }

    updateKeyMetrics() {
        this.totalProjects = this.filteredProjects.length;
        // Assuming a project is completed if it has no investment in the last year
        const completedProjects = this.filteredProjects.filter(p =>
            !p.yearlyInvestment[this.endYear.toString()]
        ).length;
        this.projectCompletionRate = (completedProjects / this.totalProjects) * 100;
        // Assuming each project creates a random number of jobs between 100 and 1000
        this.jobsCreated = this.filteredProjects.reduce((sum, p) =>
            sum + Math.floor(Math.random() * 900 + 100), 0
        );
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
            case 'totalProjectsBySector':
                this.createTotalProjectsBySectorChart();
                break;
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

    private createTotalProjectsBySectorChart(): void {
        const chart = this.charts['totalProjectsBySector'];
        if (!chart) return;

        const projectsBySector = this.filteredProjects.reduce((acc, project) => {
            acc[project.sector] = (acc[project.sector] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        const data = Object.entries(projectsBySector)
            .map(([sector, count]) => ({ sector, projects: count }))
            .sort((a, b) => b.projects - a.projects);

        const option: EChartsOption = {
            title: {
                text: 'Total Projects per Sector',
                left: 'center',
                top: 10,
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
                formatter: '{b}: {c} projects',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: '#d8d8cd',
                borderWidth: 1,
                textStyle: {
                    color: '#333333',
                    fontFamily: 'Inter, sans-serif'
                }
            },
            grid: {
                left: '5%',
                right: '5%',
                bottom: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                name: 'Number of Projects',
                nameTextStyle: {
                    color: '#333333',
                    fontFamily: 'Inter, sans-serif'
                },
                axisLine: {
                    lineStyle: {
                        color: '#d8d8cd'
                    }
                },
                axisLabel: {
                    color: '#333333',
                    fontFamily: 'Inter, sans-serif'
                },
                splitLine: {
                    lineStyle: {
                        color: '#f0f0f0'
                    }
                }
            },
            yAxis: {
                type: 'category',
                data: data.map(item => item.sector),
                axisLine: {
                    lineStyle: {
                        color: '#d8d8cd'
                    }
                },
                axisTick: {
                    alignWithLabel: true
                },
                axisLabel: {
                    color: '#333333',
                    fontFamily: 'Inter, sans-serif'
                }
            },
            series: [{
                name: 'Projects',
                type: 'bar',
                data: data.map(item => item.projects),
                itemStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 1,
                        y2: 0,
                        colorStops: [{
                            offset: 0,
                            color: '#D60000' // secondary color
                        }, {
                            offset: 1,
                            color: '#61a8bd' // accent6 color
                        }]
                    },
                    borderRadius: [0, 4, 4, 0]
                },
                emphasis: {
                    itemStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 1,
                            y2: 0,
                            colorStops: [{
                                offset: 0,
                                color: '#AD0000' // darker secondary color
                            }, {
                                offset: 1,
                                color: '#4d8a9e' // darker accent6 color
                            }]
                        }
                    }
                },
                barWidth: '60%'
            }],
            animationDuration: 1000,
            animationEasing: 'cubicInOut'
        };

        chart.setOption(this.updateChartStyles(option));
    }

    private createInfrastructureInvestmentChart(): void {
        const chart = this.charts['infrastructureInvestment'];
        if (!chart) return;

        const investmentBySector = this.filteredProjects.reduce((acc, project) => {
            acc[project.sector] = (acc[project.sector] || 0) + project.budget;
            return acc;
        }, {} as { [key: string]: number });

        const data = Object.entries(investmentBySector).map(([sector, budget]) => ({
            name: sector,
            value: budget
        }));

        const option: EChartsOption = {
            title: {
                text: 'Infrastructure Investment by Sector',
                left: 'center'
            },
            tooltip: {
                formatter: function(info: any) {
                    const value = info.value.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'ZAR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    });
                    return `<b>${info.name}</b>: ${value}`;
                }
            },
            series: [{
                name: 'Infrastructure Investment',
                type: 'treemap',
                data: data,
                label: {
                    show: true,
                    formatter: '{b}\n{c}',
                    fontSize: 14
                },
                itemStyle: {
                    borderColor: '#fff'
                },
                levels: [
                    {
                        itemStyle: {
                            borderWidth: 0,
                            gapWidth: 5
                        }
                    },
                    {
                        itemStyle: {
                            gapWidth: 1
                        }
                    },
                    {
                        colorSaturation: [0.35, 0.5],
                        itemStyle: {
                            gapWidth: 1,
                            borderColorSaturation: 0.6
                        }
                    }
                ]
            }]
        };

        chart.setOption(option);
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

        const regions = Array.from(new Set(this.projects.map(p => p.region.name)));
        const years = Object.keys(this.projects[0].yearlyInvestment);

        const series: BarSeriesOption[] = years.map(year => ({
            name: year,
            type: 'bar',
            data: regions.map(region =>
                this.projects
                    .filter(p => p.region.name === region)
                    .reduce((sum, p) => sum + (p.yearlyInvestment[year] || 0), 0)
            ),
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

        this.charts['investmentByRegion']!.setOption(option);
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

        const projectsByObjective = this.projects.reduce((acc, project) => {
            acc[project.climateObjective] = (acc[project.climateObjective] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        const data = Object.entries(projectsByObjective).map(([objective, count]) => ({
            value: count,
            name: objective
        }));

        const series: PieSeriesOption[] = [{
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
                    color: '#333333' // accent color for emphasized text
                }
            },
            labelLine: {
                show: false
            },
            data: data
        }];

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

        this.charts['projectsByClimateObjectives']!.setOption(option);
    }

    private createInvestmentsByClimateObjectivesChart(): void {
        const chartDom = document.getElementById('investmentsByClimateObjectivesChart');
        if (!chartDom) return;
        this.charts['investmentsByClimateObjectives'] = echarts.init(chartDom);

        const investmentsByObjective = this.projects.reduce((acc, project) => {
            acc[project.climateObjective] = (acc[project.climateObjective] || 0) + project.budget;
            return acc;
        }, {} as { [key: string]: number });

        const data = Object.entries(investmentsByObjective).map(([objective, investment]) => ({
            value: investment,
            name: objective
        }));

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
                data: data.map(item => ({ value: item.value, name: item.name }))
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

        this.charts['investmentsByClimateObjectives']!.setOption(option);
    }

    @HostListener('window:resize')
    onResize() {
        Object.values(this.charts).forEach(chart => chart?.resize());
    }


}
