import { CommonModule, CurrencyPipe } from "@angular/common";
import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  NgZone,
  HostListener,
  ChangeDetectorRef,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import * as echarts from "echarts";
import { EChartsOption, BarSeriesOption, PieSeriesOption, TreemapSeriesOption } from "echarts";
import * as L from "leaflet";
import 'leaflet.markercluster';
import { ScriptLoaderService } from "../../services/scriptLoader.service";
import { Project, ProjectUtils, CHART_COLORS, Region } from "../../models/vizprojects.model";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import firebase from "firebase/compat";
import DocumentData = firebase.firestore.DocumentData;
import { CallbackDataParams, TooltipFormatterCallback, TopLevelFormatterParams } from "echarts/types/dist/shared";

type ChartName =
  | "investmentByRegion"
  | "projectsByRegion"
  | "projectsByClimateObjectives"
  | "investmentsByClimateObjectives"
  | "projectTypes"
  | "infrastructureInvestment";

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
  selector: "app-data-analysis",
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [CurrencyPipe],
  templateUrl: "./data-analysis.component.html",
  styleUrls: ["./data-analysis.component.scss"],
})
export class DataAnalysisComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("mapContainer") mapContainer!: ElementRef;

  charts: { [key in ChartName]?: echarts.ECharts } = {};

  isLoading: boolean = true;
  mapInitialized: boolean = false;
  projectsLoaded: boolean = false;
  private viewInitialized: boolean = false;

  private map?: L.Map;
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  public markers: L.Marker[] = [];
  private markerClusterGroup?: L.MarkerClusterGroup;

  // Brand Colors
  private readonly brandColors = {
    primary: '#FFFFFF',
    secondary: '#007AFF',  // iOS blue
    accent: '#1D1D1F',    // Almost black
    accent1: '#86868B',   // Neutral gray
    accent2: '#E5E5E7',   // Light border
    accent3: '#F5F5F7',   // Background gray
    accent4: '#0055B3',   // Darker blue
    accent5: '#F0F0F2',   // Subtle hover
    accent6: '#FFFFFF',   // Pure white
    success: '#34C759',   // iOS green
    warning: '#FF9500',   // iOS orange
    error: '#FF3B30',     // iOS red
    chart1: '#007AFF',    // Primary chart color
    chart2: '#5856D6',    // Secondary chart color
    chart3: '#34C759',    // Tertiary chart color
    chart4: '#FF9500',    // Quaternary chart color
    chart5: '#FF2D55'     // Quinary chart color
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
    "infrastructureInvestment",
    "projectsByRegion",
    "investmentsByClimateObjectives",
    "investmentByRegion"
  ];

  // Filters
  regions: string[] = [];
  sectors: string[] = [];
  climateObjectives: string[] = [];
  selectedRegion: string = "All";
  selectedSector: string = "All";
  selectedClimateObjective: string = "All";
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
  sortedSubsectorBreakdown: {
    key: string;
    value: number;
    percentage: number;
  }[] = [];

  stats = [
    {
      title: "Total Projects",
      value: this.totalProjects,
      icon: "bi-folder2-open",
      description: `from ${this.regions.length - 1} Regions`,
      format: "1.0-0",
    },
    {
      title: "Project Completion",
      value: this.projectCompletionRate,
      icon: "bi-graph-up",
      description: "of projects completed",
      format: "1.0-0",
    },
    {
      title: "Jobs Created",
      value: this.jobsCreated,
      icon: "bi-people",
      description: "estimated new jobs",
      format: "1.0-0",
    },
    {
      title: "Risk Assessment",
      value: this.climateRiskAssessmentPercentage,
      icon: "bi-clipboard-check",
      description: "projects with published assessment",
      format: "1.0-0",
    },
  ];

  // Add after other properties
  public selectedSubsector: string | null = null;
  public chartView: 'donut' | 'bar' = 'donut';

  constructor(
    private http: HttpClient,
    private ngZone: NgZone,
    private scriptLoader: ScriptLoaderService,
    private cdr: ChangeDetectorRef,
    private firestore: AngularFirestore,
    private currencyPipe: CurrencyPipe
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.loadLeafletScripts();
      await this.loadProjects();
      if (this.viewInitialized && !this.mapInitialized) {
        this.initializeMap();
      }
      this.updateKeyMetrics();
      this.initializeCharts();
      this.updateSustainableSubsectorBreakdown();
      this.cdr.detectChanges();
    } catch (error) {
      console.error("Error during component initialization:", error);
    }
  }

  ngAfterViewInit() {
    this.viewInitialized = true;
    if (this.projectsLoaded && !this.mapInitialized) {
      this.initializeMap();
    }
    setTimeout(() => {
      this.initializeCharts();
    });
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }

  private updateChartStyles(option: EChartsOption): EChartsOption {
    const appleStyling: Partial<EChartsOption> = {
      backgroundColor: this.brandColors.primary,
      textStyle: {
        fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui",
        color: this.brandColors.accent,
        fontWeight: 400
      },
      title: {
        textStyle: {
          color: this.brandColors.accent,
          fontWeight: 500,
          fontSize: 20,
          fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui"
        },
        subtextStyle: {
          color: this.brandColors.accent1,
          fontSize: 14,
          fontWeight: 400
        }
      },
      tooltip: {
        backgroundColor: `rgba(255, 255, 255, 0.98)`,
        borderColor: this.brandColors.accent2,
        borderWidth: 1,
        textStyle: {
          color: this.brandColors.accent,
          fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui",
          fontSize: 13
        },
        padding: [8, 12],
        borderRadius: 10,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowOffsetY: 4,
        extraCssText: 'backdrop-filter: blur(10px)'
      },
      legend: {
        textStyle: {
          color: this.brandColors.accent1,
          fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui",
          fontSize: 13
        },
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 15,
        icon: 'circle',
        pageIconColor: this.brandColors.accent1,
        pageIconInactiveColor: this.brandColors.accent2,
        pageTextStyle: {
          color: this.brandColors.accent1
        }
      },
      xAxis: {
        axisLine: {
          lineStyle: {
            color: this.brandColors.accent2,
            width: 1
          }
        },
        axisLabel: {
          color: this.brandColors.accent1,
          fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui",
          fontSize: 12
        },
        splitLine: {
          show: false
        },
        axisTick: {
          alignWithLabel: true,
          length: 4,
          lineStyle: {
            color: this.brandColors.accent2
          }
        }
      },
      yAxis: {
        axisLine: {
          lineStyle: {
            color: this.brandColors.accent2,
            width: 1
          }
        },
        axisLabel: {
          color: this.brandColors.accent1,
          fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui",
          fontSize: 12
        },
        splitLine: {
          lineStyle: {
            color: this.brandColors.accent2,
            opacity: 0.3,
            type: 'dashed',
            width: 1
          }
        }
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '10%',
        top: '15%',
        containLabel: true
      }
    };

    return { ...option, ...appleStyling };
  }

  private async loadLeafletScripts(): Promise<void> {
    try {
      // We don't need to load external scripts or styles anymore
      // since we're using npm packages and Angular's built-in style loading
      this.applyLeafletCustomStyles();
    } catch (error) {
      console.error("Error applying Leaflet custom styles:", error);
      throw error;
    }
  }

  getChartTitle(chartName: ChartName): string {
    const titles: Record<ChartName, string> = {
      infrastructureInvestment: "Investment by Sector",
      projectsByRegion: "Projects by Region",
      investmentsByClimateObjectives: "Investment by Climate Objective",
      investmentByRegion: "Beneficiary Impact",
      projectsByClimateObjectives: "Projects by Climate Objectives",
      projectTypes: "Project Types"
    };
    return titles[chartName] || "Chart";
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
        font-family: 'SF Pro Display', 'Inter', system-ui;
      }
      .leaflet-popup-content-wrapper {
        background-color: ${this.brandColors.accent6};
        color: ${this.brandColors.accent};
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        border: 1px solid ${this.brandColors.accent2};
        backdrop-filter: blur(8px);
      }
      .leaflet-popup-tip {
        background-color: ${this.brandColors.accent6};
        border: 1px solid ${this.brandColors.accent2};
      }
      .leaflet-control-zoom a {
        background-color: ${this.brandColors.accent6} !important;
        color: ${this.brandColors.accent} !important;
        border-color: ${this.brandColors.accent2} !important;
        border-radius: 8px !important;
        margin-bottom: 8px !important;
      }
      .leaflet-control-zoom a:hover {
        background-color: ${this.brandColors.accent3} !important;
        color: ${this.brandColors.accent} !important;
      }
      .leaflet-control-attribution {
        background-color: rgba(255, 255, 255, 0.8) !important;
        color: ${this.brandColors.accent1} !important;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }
      .pulsing-icon .pulse-ring {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.5);
          opacity: 0;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }

  checkAndInitializeMap(): void {
    if (
      this.viewInitialized &&
      this.projectsLoaded &&
      this.mapContainer &&
      this.mapContainer.nativeElement
    ) {
      setTimeout(() => {
        this.initializeMap();
      }, 100); // 100ms delay
    } else {
      
      setTimeout(() => this.checkAndInitializeMap(), 100);
    }
  }

  private getPulsingIcon(status: string): L.DivIcon {
    const color = this.getColorForStatus(status);
    return L.divIcon({
        className: 'custom-div-icon',
        html: `
            <div class="relative flex">
                <div class="w-4 h-4 rounded-full ${color} animate-ping absolute opacity-75"></div>
                <div class="w-4 h-4 rounded-full ${color} relative"></div>
            </div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });
  }

  private getColorForStatus(status: string): string {
    const statusColors = {
        'Completed': 'bg-[#0066CC]',
        'In Progress': 'bg-amber-500',
        'Planned': 'bg-[#004499]',
        'Other': 'bg-[#86868B]'
    };
    return statusColors[status as keyof typeof statusColors] || statusColors['Other'];
  }

  private initializeMap(): void {
    if (!this.mapContainer || this.mapInitialized) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      if (this.map) {
        this.map.remove();
      }
      this.map = L.map(this.mapContainer.nativeElement, {
        minZoom: 2,
        maxZoom: 18,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      // Initialize marker cluster group
      this.markerClusterGroup = new L.MarkerClusterGroup({
        chunkedLoading: true,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        maxClusterRadius: 50,
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount();
          return L.divIcon({
            html: `
                <div class="relative flex items-center justify-center">
                    <div class="w-8 h-8 rounded-full bg-[#0066CC]/40 animate-ping absolute"></div>
                    <div class="w-8 h-8 rounded-full bg-[#0066CC] relative flex items-center justify-center border-2 border-white">
                        <span class="text-white text-sm font-semibold">${count}</span>
                    </div>
                </div>
            `,
            className: 'custom-cluster-icon',
            iconSize: L.point(32, 32),
            iconAnchor: L.point(16, 16)
          });
        }
      });

      this.mapInitialized = true;
      this.updateMapMarkers();
    });
  }

  private updateMapMarkers(): void {
    
    if (!this.map || !this.markerClusterGroup) {
      return;
    }

    const clusterGroup = this.markerClusterGroup;
    // Clear existing markers
    clusterGroup.clearLayers();
    this.markers = [];

    // Add new markers
    this.filteredProjects.forEach(project => {
      if (project.location && project.location.latitude && project.location.longitude) {
        
        const status = this.getProjectStatus(project);
        const marker = L.marker(
          [project.location.latitude, project.location.longitude],
          { icon: this.getPulsingIcon(status) }
        );

        const popupContent = `
          <div class="p-4 max-w-sm bg-white rounded-lg shadow-sm">
            <h3 class="text-lg font-semibold mb-2">${project.name || 'Project'}</h3>
            <div class="space-y-2 text-sm">
              <p><span class="font-medium">Budget:</span> ${project.budget.toLocaleString('en-US', {
                style: 'currency',
                currency: 'ZAR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}</p>
              <p><span class="font-medium">Region:</span> ${this.getRegionName(project.region)}</p>
              <p><span class="font-medium">Sector:</span> ${project.sector}</p>
              <p><span class="font-medium">Status:</span> ${status}</p>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        this.markers.push(marker);
        clusterGroup.addLayer(marker);
      }
    });

    

    // Add marker cluster group to map if not already added
    if (!this.map.hasLayer(clusterGroup)) {
      this.map.addLayer(clusterGroup);
    }

    // Fit bounds if there are markers
    if (this.markers.length > 0) {
      const group = L.featureGroup(this.markers);
      const bounds = group.getBounds();
      this.map.fitBounds(bounds, { 
        padding: [50, 50],
        maxZoom: 12
      });
    } else {
      // Default view for South Africa if no markers
      this.map.setView([-28.4793, 24.6727], 6);
    }
  }

  private getProjectStatus(project: Project): string {
    const currentYear = new Date().getFullYear();
    const investmentYears = Object.keys(project.yearlyInvestment).map(Number);

    if (investmentYears.length === 0) return "Planned";

    const latestInvestmentYear = Math.max(...investmentYears);
    const earliestInvestmentYear = Math.min(...investmentYears);

    if (latestInvestmentYear < currentYear) return "Completed";
    if (earliestInvestmentYear > currentYear) return "Planned";
    return "In Progress";
  }

  private convertToProject(id: string, data: DocumentData): Project {
    // Convert location format
    const location = data["location"] ? {
      latitude: data["location"].latitude || 0,
      longitude: data["location"].longitude || 0
    } : { latitude: 0, longitude: 0 };

    // Convert region from string to Region object if needed
    const region = typeof data["region"] === 'string' ? {
      name: data["region"],
      code: "",
      population: 0
    } : data["region"] || { name: "", code: "", population: 0 };

    // Determine funding source based on project data
    const fundingSource = data["funding_source"] || "Public"; // Default to Public if not specified

    const project = {
      id,
      name: data["name"] || "",
      budget: data["budget"] || 0,
      region: region,
      location: location,
      climateObjective: data["objective"] || "",
      sector: data["sector"] || "",
      subsector: data["subsector"] || "",
      projectType: data["projectType"] || "",
      date: data["date"] || "",
      yearlyInvestment: data["yearlyInvestment"] || {},
      climateAndDisasterRiskAssessmentPublished: data["climateAndDisasterRiskAssessmentPublished"] || false,
      sustainableSubsector: data["sustainableSubsector"] || "",
    };

    return {
      ...project,
      subsector_total: `$${(project.budget / 1e9).toFixed(1)}bn`,
      subsector_label: `${project.subsector}: $${(project.budget / 1e9).toFixed(1)}bn`,
      oc4ids: {
        climate_finance_decision_making: data["oc4ids"]?.climate_finance_decision_making || "Pending approval",
        nationally_determined_contributions: data["oc4ids"]?.nationally_determined_contributions || "Aligned with NDC",
        paris_agreement: data["oc4ids"]?.paris_agreement ?? true,
        beneficiaries: data["oc4ids"]?.beneficiaries || 0,
        amount_of_investment: data["oc4ids"]?.amount_of_investment || project.budget,
        funding_source: data["oc4ids"]?.funding_source || fundingSource,
        ratio_of_co_finance: data["oc4ids"]?.ratio_of_co_finance || "0:0",
        public_consultation_meetings: data["oc4ids"]?.public_consultation_meetings || 0,
        abatement_cost: data["oc4ids"]?.abatement_cost || 0,
        in_protected_area: data["oc4ids"]?.in_protected_area ?? false
      }
    };
  }

  async loadProjects() {
    this.isLoading = true;
    try {
      const snapshot = await this.firestore
        .collection<Project>("dataVizProjects")
        .get()
        .toPromise();
      if (snapshot) {
        console.log("Raw Firestore data:", snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() })));
        this.projects = snapshot.docs.map((doc) =>
          this.convertToProject(doc.id, doc.data())
        );
        
        // Log projects with valid coordinates
        const projectsWithCoords = this.projects.filter(p => 
          p.location && 
          typeof p.location.latitude === 'number' && 
          typeof p.location.longitude === 'number' &&
          p.location.latitude !== 0 &&
          p.location.longitude !== 0
        );
        
        

        this.filteredProjects = [...this.projects];
        this.projectsLoaded = true;
        this.initializeFilters();
        this.calculateNewMetrics();
        this.updateKeyMetrics();
        
        // Only update map markers if we have valid coordinates
        if (projectsWithCoords.length > 0) {
          this.updateMapMarkers();
        } else {
          console.warn("No projects with valid coordinates found");
        }
      } else {
        console.error("No data received from Firestore");
        this.projects = [];
        this.filteredProjects = [];
      }
    } catch (error) {
      console.error("Error loading projects:", error);
      this.projects = [];
      this.filteredProjects = [];
    } finally {
      this.isLoading = false;
    }
  }

  private getRegionName(region: Region | string): string {
    if (typeof region === 'string') {
      return region;
    }
    return region.name || '';
  }

  initializeFilters() {
    this.regions = ["All", ...new Set(this.projects.map((p) => this.getRegionName(p.region)))];
    this.sectors = ["All", ...new Set(this.projects.map((p) => p.sector))];
    this.climateObjectives = [
      "All",
      ...new Set(this.projects.map((p) => p.climateObjective)),
    ];
    const years = this.projects.flatMap((p) =>
      Object.keys(p.yearlyInvestment).map(Number)
    );
    this.startYear = this.minYear = Math.min(...years);
    this.endYear = this.maxYear = Math.max(...years);
  }

  private updateSustainableSubsectorBreakdown() {
    // Create a default mapping of subsectors with type definition
    const defaultSubsectors: { [key: string]: number } = {
      'Solar': 0,
      'Wind': 0,
      'Hydropower': 0,
      'Biomass': 0,
      'Geothermal': 0,
      'Transport': 0,
      'Water and wastewater management': 0,
      'Natural resource management': 0,
      'Low carbon transport': 0,
      'Flood protection': 0
    };

    // Count projects by subsector
    this.sustainableSubsectorBreakdown = this.filteredProjects.reduce(
      (acc, p) => {
        const subsector = p.subsector || 'Other';
        acc[subsector] = (acc[subsector] || 0) + 1;
        return acc;
      },
      { ...defaultSubsectors } as { [key: string]: number }
    );

    this.totalProjects = this.filteredProjects.length;

    // Convert to sorted array with percentages
    this.sortedSubsectorBreakdown = Object.entries(this.sustainableSubsectorBreakdown)
      .filter(([key, value]) => value > 0) // Only include subsectors with projects
      .map(([key, value]) => ({
        key,
        value,
        percentage: (value / this.totalProjects) * 100,
      }))
      .sort((a, b) => b.value - a.value);

    // Update the chart
    this.createSubsectorBarChart();
  }

  private createSubsectorBarChart(): void {
    const chartDom = document.getElementById('subsectorBarChart');
    if (!chartDom) return;

    const chart = echarts.init(chartDom);
    
    // Define the category structure with specific colors for each category
    const categories = {
      'Energy': {
        subsectors: ['Solar', 'Wind', 'Hydropower', 'Biomass', 'Geothermal'],
        color: this.brandColors.chart1,
        gradient: [
          { offset: 0, color: this.brandColors.chart1 },
          { offset: 1, color: this.getLighterColor(this.brandColors.chart1, -0.2) }
        ]
      },
      'Infrastructure': {
        subsectors: ['Transport', 'Low carbon transport'],
        color: this.brandColors.chart2,
        gradient: [
          { offset: 0, color: this.brandColors.chart2 },
          { offset: 1, color: this.getLighterColor(this.brandColors.chart2, -0.2) }
        ]
      },
      'Environment': {
        subsectors: ['Water and wastewater management', 'Natural resource management', 'Flood protection'],
        color: this.brandColors.chart3,
        gradient: [
          { offset: 0, color: this.brandColors.chart3 },
          { offset: 1, color: this.getLighterColor(this.brandColors.chart3, -0.2) }
        ]
      }
    };

    // Process data into hierarchical structure
    const processData = () => {
      const root = {
        name: 'All Sectors',
        children: [] as any[]
      };

      // Calculate totals for each category and subsector
      Object.entries(categories).forEach(([category, info]) => {
        const categoryProjects = this.filteredProjects.filter(p => 
          info.subsectors.includes(p.subsector)
        );

        if (categoryProjects.length > 0) {
          const categoryNode = {
            name: category,
            value: categoryProjects.reduce((sum, p) => sum + p.budget, 0),
            itemStyle: {
              color: info.color,
              borderColor: this.brandColors.primary,
              borderWidth: 2
            },
            children: [] as any[]
          };

          // Group projects by subsector
          const subsectorGroups = info.subsectors.reduce((acc, subsector) => {
            const projects = categoryProjects.filter(p => p.subsector === subsector);
            if (projects.length > 0) {
              acc[subsector] = projects;
            }
            return acc;
          }, {} as Record<string, Project[]>);

          // Create subsector nodes
          Object.entries(subsectorGroups).forEach(([subsector, projects], index) => {
            const subsectorValue = projects.reduce((sum, p) => sum + p.budget, 0);
            categoryNode.children.push({
              name: subsector,
              value: subsectorValue,
              itemStyle: {
                color: this.getLighterColor(info.color, 0.1 * (index + 1)),
                borderColor: this.brandColors.primary,
                borderWidth: 1
              },
              children: projects.map((project, projectIndex) => ({
                name: project.name,
                value: project.budget,
                itemStyle: {
                  color: this.getLighterColor(info.color, 0.2 * (projectIndex + 1)),
                  borderColor: this.brandColors.primary,
                  borderWidth: 1
                },
                project: project
              }))
            });
          });

          if (categoryNode.children.length > 0) {
            root.children.push(categoryNode);
          }
        }
      });

      return root;
    };

    const data = processData();
    const totalInvestment = data.children.reduce((sum, category) => sum + category.value, 0);

    const option: EChartsOption = {
      title: {
        text: 'Sustainable Subsector Analysis',
        subtext: `Total Investment: ${totalInvestment.toLocaleString('en-US', {
          style: 'currency',
          currency: 'ZAR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        })}`,
        left: 'center',
        top: 20
      },
      tooltip: {
        formatter: (params: any) => {
          const { name, value, data } = params;
          const formattedValue = value.toLocaleString('en-US', {
            style: 'currency',
            currency: 'ZAR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          });

          if (data.project) {
            // Project level tooltip
            return `
              <div class="font-['SF Pro Display']">
                <div class="font-medium mb-2">${name}</div>
                <div class="space-y-1 text-[#86868B]">
                  <div>Investment: <span class="text-[#1D1D1F]">${formattedValue}</span></div>
                  <div>Region: <span class="text-[#1D1D1F]">${this.getRegionName(data.project.region)}</span></div>
                  <div>Climate Objective: <span class="text-[#1D1D1F]">${data.project.climateObjective}</span></div>
                </div>
              </div>
            `;
          } else {
            // Category/Subsector level tooltip
            const percentage = ((value / totalInvestment) * 100).toFixed(1);
            const childCount = data.children ? data.children.length : 0;
            const childLabel = data.children ? 
              `${childCount} ${data.children[0].project ? 'Projects' : 'Subsectors'}` : 
              'No children';

            return `
              <div class="font-['SF Pro Display']">
                <div class="font-medium mb-2">${name}</div>
                <div class="space-y-1 text-[#86868B]">
                  <div>Investment: <span class="text-[#1D1D1F]">${formattedValue}</span></div>
                  <div>Share: <span class="text-[#1D1D1F]">${percentage}%</span></div>
                  <div>Contains: <span class="text-[#1D1D1F]">${childLabel}</span></div>
                </div>
              </div>
            `;
          }
        }
      },
      series: [{
        type: 'treemap',
        data: data.children,
        width: '95%',
        height: '90%',
        top: '10%',
        roam: false,
        nodeClick: 'zoomToNode',
        breadcrumb: {
          show: true,
          height: 30,
          top: 80,
          itemStyle: {
            color: this.brandColors.accent3,
            borderColor: this.brandColors.accent2,
            borderWidth: 1,
            textStyle: {
              color: this.brandColors.accent,
              fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui"
            }
          }
        },
        levels: [
          {
            itemStyle: {
              borderColor: this.brandColors.primary,
              borderWidth: 3,
              gapWidth: 3,
              borderRadius: [4, 4, 0, 0]
            },
            upperLabel: {
              show: true,
              height: 30,
              color: this.brandColors.primary,
              fontSize: 14,
              fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui",
              backgroundColor: 'rgba(0,0,0,0.4)'
            }
          },
          {
            itemStyle: {
              borderColor: this.brandColors.primary,
              borderWidth: 2,
              gapWidth: 2,
              borderRadius: [2, 2, 0, 0]
            },
            emphasis: {
              itemStyle: {
                borderColor: this.brandColors.accent
              }
            }
          },
          {
            itemStyle: {
              borderColor: this.brandColors.primary,
              borderWidth: 1,
              gapWidth: 1,
              borderRadius: [1, 1, 0, 0]
            },
            emphasis: {
              itemStyle: {
                borderColor: this.brandColors.accent
              }
            }
          }
        ],
        label: {
          show: true,
          formatter: (params: any) => {
            const value = params.value.toLocaleString('en-US', {
              style: 'currency',
              currency: 'ZAR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            });
            if (params.depth === 0) {
              return `{name|${params.name}}\n{value|${value}}`;
            } else if (params.depth === 1) {
              return `{name|${params.name}}\n{value|${value}}`;
            } else {
              return `{name|${params.name}}\n{small|${value}}`;
            }
          },
          rich: {
            name: {
              fontSize: 14,
              fontWeight: 500,
              color: '#FFFFFF',
              padding: [5, 0, 0, 0]
            },
            value: {
              fontSize: 12,
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.8)',
              padding: [0, 0, 5, 0]
            },
            small: {
              fontSize: 10,
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.7)',
              padding: [0, 0, 5, 0]
            }
          }
        },
        upperLabel: {
          show: true,
          height: 30,
          color: this.brandColors.primary,
          fontSize: 12,
          fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui"
        }
      } as TreemapSeriesOption]
    };

    chart.setOption(this.updateChartStyles(option));

    // Handle subsector highlighting
    if (this.selectedSubsector) {
      chart.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        name: this.selectedSubsector
      });
    }
  }

  private createSubsectorDonutChart(): void {
    // Remove this function
  }

  private createInfrastructureInvestmentChart(): void {
    const chart = this.charts["infrastructureInvestment"];
    if (!chart) return;

    // Process data to group by sectors and subsectors
    const sectorData = this.filteredProjects.reduce((acc, project) => {
        const sector = project.sector || 'Other';
        const subsector = project.subsector || 'Other';
        
        if (!acc[sector]) {
            acc[sector] = {
                total: 0,
                subsectors: {}
            };
        }
        
        if (!acc[sector].subsectors[subsector]) {
            acc[sector].subsectors[subsector] = 0;
        }
        
        acc[sector].total += project.budget;
        acc[sector].subsectors[subsector] += project.budget;
        
        return acc;
    }, {} as { [key: string]: { total: number, subsectors: { [key: string]: number } } });

    // Sort sectors by total investment and get top 10
    const sortedSectors = Object.entries(sectorData)
        .sort((a, b) => b[1].total - a[1].total);
    
    const topSectors = sortedSectors.slice(0, 10);
    
    // Combine remaining sectors into "Other"
    const otherSectors = sortedSectors.slice(10);
    if (otherSectors.length > 0) {
        const otherData = {
            total: otherSectors.reduce((sum, [_, data]) => sum + data.total, 0),
            subsectors: otherSectors.reduce((acc, [_, data]) => {
                Object.entries(data.subsectors).forEach(([subsector, value]) => {
                    acc[subsector] = (acc[subsector] || 0) + value;
                });
                return acc;
            }, {} as { [key: string]: number })
        };
        sectorData['Other'] = otherData;
        topSectors.push(['Other', otherData]);
    }

    // Get final list of sectors for display
    const sectors = topSectors.map(([sector]) => sector);
    
    // Collect all unique subsectors and their data
    const allSubsectors = new Set<string>();
    sectors.forEach(sector => {
        Object.keys(sectorData[sector].subsectors).forEach(subsector => {
            allSubsectors.add(subsector);
        });
    });

    // Create series for each subsector
    const subsectorSeries: any[] = Array.from(allSubsectors).map((subsector, index) => {
        const data = sectors.map(sector => ({
            value: sectorData[sector].subsectors[subsector] || 0,
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [{
                    offset: 0,
                    color: this.getLighterColor(this.getChartColor(index), 0.3)
                }, {
                    offset: 1,
                    color: this.getChartColor(index)
                }])
            }
        }));

        return {
            name: subsector,
            type: 'bar',
            stack: 'total',
            emphasis: {
                focus: 'series',
                itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(0,0,0,0.2)'
                }
            },
            data: data
        };
    });

    const option: EChartsOption = {
        title: {
            text: 'Investment by Sector',
            subtext: `Total Investment: ${this.currencyPipe.transform(
                sectors.reduce((sum, sector) => sum + sectorData[sector].total, 0),
                'ZAR',
                'symbol',
                '1.0-0'
            )}`,
            left: 'center',
            top: 20
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: (params: any) => {
                const sectorName = params[0].axisValue;
                const total = params.reduce((sum: number, item: any) => sum + (item.value || 0), 0);
                
                let tooltip = `<div class="font-['SF Pro Display']">
                    <div class="font-medium mb-2">${sectorName}</div>
                    <div class="text-[#86868B] mb-2">
                        Total: <span class="text-[#1D1D1F]">${this.currencyPipe.transform(total, 'ZAR', 'symbol', '1.0-0')}</span>
                    </div>
                    <div class="space-y-1">`;
                
                // Sort subsectors by value for this sector
                const sectorItems = params
                    .filter((item: any) => item.value > 0)
                    .sort((a: any, b: any) => b.value - a.value);

                sectorItems.forEach((item: any) => {
                    const percentage = ((item.value / total) * 100).toFixed(1);
                    tooltip += `
                        <div class="flex justify-between text-sm">
                            <span class="text-[#86868B]">${item.seriesName}:</span>
                            <span class="text-[#1D1D1F]">${this.currencyPipe.transform(item.value, 'ZAR', 'symbol', '1.0-0')} (${percentage}%)</span>
                        </div>`;
                });
                
                tooltip += '</div></div>';
                return tooltip;
            }
        },
        legend: {
            type: 'scroll',
            orient: 'horizontal',
            bottom: 0,
            data: Array.from(allSubsectors)
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
            data: sectors,
            axisLabel: {
                interval: 0,
                rotate: 45,
                formatter: (value: string) => {
                    return value.length > 15 ? value.substring(0, 12) + '...' : value;
                }
            }
        },
        yAxis: {
            type: 'value',
            name: 'Investment (ZAR)',
            axisLabel: {
                formatter: (value: number) => {
                    return this.currencyPipe.transform(value, 'ZAR', 'symbol', '1.0-0') || '';
                }
            }
        },
        series: subsectorSeries,
        animationDuration: 1000,
        animationEasing: 'cubicInOut'
    };

    chart.setOption(this.updateChartStyles(option));
  }

  private getLighterColor(color: string, factor: number): string {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const lighterR = Math.round(r + (255 - r) * factor);
    const lighterG = Math.round(g + (255 - g) * factor);
    const lighterB = Math.round(b + (255 - b) * factor);
    
    return `#${lighterR.toString(16).padStart(2, '0')}${lighterG.toString(16).padStart(2, '0')}${lighterB.toString(16).padStart(2, '0')}`;
  }

  private getChartColor(index: number): string {
    const colors = [
      this.brandColors.chart1,
      this.brandColors.chart2,
      this.brandColors.chart3,
      this.brandColors.chart4,
      this.brandColors.chart5
    ];
    return colors[index % colors.length];
  }

  private createProjectTypesChart(): void {
    const chartDom = document.getElementById("projectTypesChart");
    if (!chartDom) return;
    this.charts["projectTypes"] = echarts.init(chartDom);

    const data = [
      { type: "Solar Energy", projects: 50 },
      { type: "Wind Energy", projects: 40 },
      { type: "Water Management", projects: 35 },
      { type: "Sustainable Agriculture", projects: 30 },
      { type: "Green Buildings", projects: 25 },
    ];

    const series: PieSeriesOption[] = [
      {
        name: "Project Types",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: "18",
            fontWeight: "bold",
            color: "#333333", // accent color for emphasized text
          },
        },
        labelLine: {
          show: false,
        },
        data: data.map((item) => ({ value: item.projects, name: item.type })),
      },
    ];

    const option: EChartsOption = {
      backgroundColor: "#F7F7F7", // primary color as background

      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} projects ({d}%)",
        backgroundColor: "rgba(247, 247, 247, 0.9)", // primary color with opacity
        borderColor: "#d8d8cd", // accent2 color for border
        borderWidth: 1,
        textStyle: {
          color: "#333333", // accent color for tooltip text
          fontFamily: "Inter, sans-serif",
        },
      },
      legend: {
        orient: "vertical",
        left: "5%",
        top: "center",
        itemWidth: 25,
        itemHeight: 14,
        itemGap: 12,
        textStyle: {
          color: "#333333", // accent color for legend text
          fontSize: 14,
          fontFamily: "Inter, sans-serif",
        },
      },
      series: series,
      color: ["#D60000", "#2c4143", "#58707b", "#ffce32", "#61a8bd"], // Using secondary, accent3, accent4, accent5, accent6 colors
      animationDuration: 1000,
      animationEasing: "cubicInOut",
      animationDelay: (idx: number) => idx * 150,
    };

    this.charts["projectTypes"]!.setOption(option);
  }

  private createInvestmentByRegionChart(): void {
    const chartDom = document.getElementById('investmentByRegionChart');
    if (!chartDom) return;
    
    // Calculate protected area statistics
    const stats = this.filteredProjects.reduce((acc, project) => {
        const status = project.oc4ids.in_protected_area;
        const category = status ? 'Protected Area' : 'Non-Protected Area';
        
        if (!acc[category]) {
            acc[category] = {
                count: 0,
                investment: 0,
                projects: []
            };
        }
        
        acc[category].count += 1;
        acc[category].investment += project.budget;
        acc[category].projects.push({
            name: project.name,
            budget: project.budget,
            region: this.getRegionName(project.region)
        });
        
        return acc;
    }, {} as { [key: string]: { count: number; investment: number; projects: any[] } });

    const totalProjects = this.filteredProjects.length;
    const totalInvestment = this.filteredProjects.reduce((sum, p) => sum + p.budget, 0);

    const chart = echarts.init(chartDom);
    
    const option: EChartsOption = {
        title: {
            text: 'Protected Area Status',
            subtext: `Total Projects: ${totalProjects}`,
            left: 'center',
            top: 20,
            textStyle: {
                fontSize: 18,
                fontWeight: 500,
                color: this.brandColors.accent
            },
            subtextStyle: {
                fontSize: 14,
                color: this.brandColors.accent1
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: (params: any) => {
                const data = stats[params.name];
                const percentage = ((data.count / totalProjects) * 100).toFixed(1);
                const investmentBillion = (data.investment / 1e9).toFixed(2);
                
                return `
                    <div class="font-['SF Pro Display', 'Inter', system-ui] p-1">
                        <div class="font-medium mb-2">${params.name}</div>
                        <div class="space-y-1 text-[#86868B]">
                            <div>Projects: <span class="text-[#1D1D1F]">${data.count} (${percentage}%)</span></div>
                            <div>Total Investment: <span class="text-[#1D1D1F]">ZAR ${investmentBillion}B</span></div>
                        </div>
                    </div>
                `;
            }
        },
        legend: {
            orient: 'vertical',
            left: '15%',
            top: 'middle',
            itemWidth: 10,
            itemHeight: 10,
            icon: 'circle',
            formatter: (name: string) => {
                const data = stats[name];
                const percentage = ((data.count / totalProjects) * 100).toFixed(1);
                return `${name}: ${data.count} (${percentage}%)`;
            }
        },
        series: [
            {
                name: 'Protected Area Status',
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['65%', '50%'],
                avoidLabelOverlap: true,
                itemStyle: {
                    borderColor: this.brandColors.primary,
                    borderWidth: 2,
                    borderRadius: 4
                },
                label: {
                    show: false
                },
                emphasis: {
                    label: {
                        show: true,
                        formatter: '{b}\n{c} projects',
                        fontSize: 14,
                        fontWeight: 500
                    },
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.2)'
                    }
                },
                data: [
                    {
                        name: 'Protected Area',
                        value: stats['Protected Area']?.count || 0,
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: '#34C759' },
                                { offset: 1, color: '#248A3D' }
                            ])
                        }
                    },
                    {
                        name: 'Non-Protected Area',
                        value: stats['Non-Protected Area']?.count || 0,
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: '#FF9500' },
                                { offset: 1, color: '#C93400' }
                            ])
                        }
                    }
                ]
            },
            {
                name: 'Investment Ring',
                type: 'pie',
                radius: ['75%', '78%'],
                center: ['65%', '50%'],
                silent: true,
                label: {
                    show: false
                },
                data: [{
                    value: 1,
                    itemStyle: {
                        color: this.brandColors.accent2
                    }
                }]
            }
        ]
    };

    chart.setOption(this.updateChartStyles(option));
  }

  // Make sure this method is also in your component
  private showRegionDetails(region: string, year: string): void {
    const regionProjects = this.filteredProjects.filter(
      (p) => this.getRegionName(p.region) === region && p.yearlyInvestment[year]
    );

    const details = regionProjects.map((p) => ({
      name: p.name,
      investment: p.yearlyInvestment[year] / 1e6,
      sector: p.sector,
    }));
  }
  public filterChart(
    selectedRegions?: string[],
    selectedYears?: string[]
  ): void {
    // Implementation depends on how you want to handle filtering
    // This is just a basic example
    this.filteredProjects = this.projects.filter(
      (p) =>
        (!selectedRegions || selectedRegions.includes(this.getRegionName(p.region))) &&
          (!selectedYears ||
            selectedYears.some((year) => p.yearlyInvestment[year] > 0))
    );
    this.createInvestmentByRegionChart(); // Recreate the chart with filtered data
  }

  private createProjectsByRegionChart(): void {
    const chartDom = document.getElementById("projectsByRegionChart");
    if (!chartDom) return;
    this.charts["projectsByRegion"] = echarts.init(chartDom);

    const projectsByRegion = this.projects.reduce((acc, project) => {
      const regionName = this.getRegionName(project.region);
      acc[regionName] = (acc[regionName] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const data = Object.entries(projectsByRegion)
      .map(([region, count]) => ({ region, projects: count }))
      .sort((a, b) => b.projects - a.projects);

    const series: BarSeriesOption[] = [
      {
        name: "Projects",
        type: "bar",
        data: data.map((item) => item.projects),
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: "#58707b",
          },
        },
      },
    ];

    const option: EChartsOption = {
      backgroundColor: "#F7F7F7", // primary color as background

      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        formatter: "{b}: {c} projects",
      },
      grid: {
        left: "15%",
        right: "5%",
        bottom: "15%",
        top: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: data.map((item) => item.region),
        axisLabel: {
          rotate: 45,
          interval: 0,
          color: "#333333", // accent color for axis labels
          fontFamily: "Inter, sans-serif",
        },
        axisLine: {
          lineStyle: {
            color: "#d8d8cd", // accent2 color for axis line
          },
        },
      },
      yAxis: {
        type: "value",
        name: "Number of Projects",
        nameTextStyle: {
          color: "#333333", // accent color for axis name
          fontFamily: "Inter, sans-serif",
        },
        axisLabel: {
          color: "#333333", // accent color for axis labels
          fontFamily: "Inter, sans-serif",
        },
        axisLine: {
          lineStyle: {
            color: "#d8d8cd", // accent2 color for axis line
          },
        },
        splitLine: {
          lineStyle: {
            color: "#d8d8cd", // accent2 color for split lines
          },
        },
      },
      series: series,
      color: ["#D60000"], // Using secondary color for bars
      animationDuration: 1000,
      animationEasing: "cubicInOut",
      animationDelay: (idx: number) => idx * 100,
    };

    this.charts["projectsByRegion"]!.setOption(option);
  }

  private createProjectsByClimateObjectivesChart(): void {
    const chartDom = document.getElementById(
      "projectsByClimateObjectivesChart"
    );
    if (!chartDom) return;
    this.charts["projectsByClimateObjectives"] = echarts.init(chartDom);

    // Get unique climate objectives and years
    const climateObjectives = Array.from(
      new Set(this.projects.map((p) => p.climateObjective))
    );
    const years = Array.from(
      new Set(this.projects.flatMap((p) => Object.keys(p.yearlyInvestment)))
    ).sort();

    // Prepare data for each climate objective
    const series: BarSeriesOption[] = climateObjectives.map((objective) => {
      const data = years.map((year) => {
        const yearlyInvestment = this.projects
          .filter((p) => p.climateObjective === objective)
          .reduce((sum, p) => sum + (p.yearlyInvestment[year] || 0), 0);
        return yearlyInvestment / 1e6; // Convert to millions
      });

      return {
        name: objective,
        type: "bar",
        stack: "total",
        emphasis: {
          focus: "series",
        },
        data: data,
      };
    });

    const option: EChartsOption = {
      backgroundColor: this.brandColors.primary,

      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        backgroundColor: `rgba(247, 247, 247, 0.9)`,
        borderColor: this.brandColors.accent2,
        borderWidth: 1,
        textStyle: {
          color: this.brandColors.accent,
          fontFamily: "Inter, sans-serif",
        },
        formatter: (params: any) => {
          let tooltip = `${params[0].axisValue}<br/>`;
          let total = 0;
          params.forEach((item: any) => {
            const value = item.value.toLocaleString("en-US", {
              style: "currency",
              currency: "ZAR",
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            });
            tooltip += `${item.marker} ${item.seriesName}: ${value} million<br/>`;
            total += item.value;
          });
          tooltip += `<strong>Total: ${total.toLocaleString("en-US", {
            style: "currency",
            currency: "ZAR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })} million</strong>`;
          return tooltip;
        },
      },
      legend: {
        data: climateObjectives,
        bottom: "5%",
        textStyle: {
          color: this.brandColors.accent,
          fontFamily: "Inter, sans-serif",
        },
      },
      grid: {
        left: "13%",
        right: "4%",
        bottom: "15%",
        top: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: years,
        axisLabel: {
          color: this.brandColors.accent,
          fontFamily: "Inter, sans-serif",
        },
        axisLine: {
          lineStyle: {
            color: this.brandColors.accent2,
          },
        },
      },
      yAxis: {
        type: "value",
        name: "Investment (Million ZAR)",
        nameTextStyle: {
          color: this.brandColors.accent,
          fontFamily: "Inter, sans-serif",
        },
        axisLabel: {
          color: this.brandColors.accent,
          fontFamily: "Inter, sans-serif",
        },
        axisLine: {
          lineStyle: {
            color: this.brandColors.accent2,
          },
        },
        splitLine: {
          lineStyle: {
            color: this.brandColors.accent2,
          },
        },
      },
      series: series,
      color: [
        this.brandColors.secondary,
        this.brandColors.accent3,
        this.brandColors.accent4,
        this.brandColors.accent5,
        this.brandColors.accent6,
      ],
      animationDuration: 1000,
      animationEasing: "cubicInOut",
    };

    this.charts["projectsByClimateObjectives"]!.setOption(
      this.updateChartStyles(option)
    );
  }

  private createInvestmentsByClimateObjectivesChart(): void {
    const chartDom = document.getElementById('investmentsByClimateObjectivesChart');
    if (!chartDom) {
      console.error('Chart DOM element not found');
      return;
    }
    this.charts["investmentsByClimateObjectives"] = echarts.init(chartDom);

    // Calculate total investment by climate objective
    const objectiveData = this.filteredProjects.reduce((acc, project) => {
      const objective = project.climateObjective || 'Unspecified';
      acc[objective] = (acc[objective] || 0) + project.budget;
      return acc;
    }, {} as { [key: string]: number });

    // Convert to array and sort by investment amount
    const data = Object.entries(objectiveData)
      .map(([objective, budget]) => ({
        name: objective,
        value: budget / 1e9, // Convert to billions
        percentage: 0 // Will be calculated below
      }))
      .sort((a, b) => b.value - a.value);

    // Calculate percentages
    const totalBudget = data.reduce((sum, item) => sum + item.value, 0);
    data.forEach(item => {
      item.percentage = (item.value / totalBudget) * 100;
    });

    const option: EChartsOption = {
      title: {
        text: 'Investment Distribution by Climate Objective',
        subtext: 'Total Investment: ZAR ' + totalBudget.toFixed(1) + 'B',
        left: 'center',
        top: '20px',
        textStyle: {
          fontSize: 18,
          fontWeight: 500,
          color: this.brandColors.accent
        },
        subtextStyle: {
          fontSize: 14,
          color: this.brandColors.accent1
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `
            <div class="font-['SF Pro Display', 'Inter', system-ui]">
              <div class="font-medium mb-1">${params.name}</div>
              <div class="text-[#86868B]">
                Investment: <span class="text-[#1D1D1F]">ZAR ${params.value.toFixed(1)}B</span><br/>
                Share: <span class="text-[#1D1D1F]">${params.percent.toFixed(1)}%</span>
              </div>
            </div>
          `;
        },
        backgroundColor: `rgba(255, 255, 255, 0.95)`,
        borderColor: this.brandColors.accent2,
        textStyle: {
          color: this.brandColors.accent,
          fontFamily: "'SF Pro Display', 'Inter', system-ui"
        },
        padding: [8, 12],
        borderRadius: 8
      },
      legend: {
        orient: 'vertical',
        left: '15%',
        top: 'middle',
        itemWidth: 10,
        itemHeight: 10,
        icon: 'circle',
        formatter: (name: string) => {
          const item = data.find(d => d.name === name);
          return `${name}: ZAR ${item?.value.toFixed(1)}B (${item?.percentage.toFixed(1)}%)`;
        },
        textStyle: {
          color: this.brandColors.accent1,
          fontSize: 12,
          fontFamily: "'SF Pro Display', 'Inter', system-ui"
        }
      },
      series: [{
        name: 'Investment',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['65%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderColor: this.brandColors.primary,
          borderWidth: 2,
          borderRadius: 4
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            formatter: '{b}\n{c}B ({d}%)',
            fontSize: 12,
            fontWeight: 500
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        },
        labelLine: {
          show: false
        },
        data: data,
        color: [
          this.brandColors.secondary,
          this.brandColors.accent4,
          '#34C759',  // Success green
          '#FF9500',  // Warning orange
          '#FF3B30'   // Error red
        ]
      }]
    };

    this.charts["investmentsByClimateObjectives"]?.setOption(this.updateChartStyles(option));
  }

  @HostListener("window:resize")
  onResize() {
    Object.values(this.charts).forEach((chart) => chart?.resize());
  }

  private calculateNewMetrics() {
    // Calculate Climate and Disaster Risk Assessment percentage
    const assessmentCount = this.projects.filter(
      (p) => p.climateAndDisasterRiskAssessmentPublished
    ).length;
    this.climateRiskAssessmentPercentage =
      (assessmentCount / this.projects.length) * 100;

    // Calculate Sustainable Subsector breakdown
    this.sustainableSubsectorBreakdown = this.projects.reduce((acc, p) => {
      acc[p.sustainableSubsector] = (acc[p.sustainableSubsector] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  public getMaxStatValue(statTitle: string): number {
    switch (statTitle) {
      case 'Total Projects':
        return Math.max(this.totalProjects, 100); // Set minimum scale to 100
      case 'Project Completion':
        return 100; // Percentage scale
      case 'Jobs Created':
        return Math.max(this.jobsCreated, 10000); // Set minimum scale to 10,000
      case 'Risk Assessment':
        return 100; // Percentage scale
      default:
        return 100;
    }
  }

  public getChartIcon(chartName: ChartName): string {
    const icons: Record<ChartName, string> = {
      infrastructureInvestment: 'bi-building',
      projectsByRegion: 'bi-geo-alt',
      investmentsByClimateObjectives: 'bi-cloud-sun',
      investmentByRegion: 'bi-graph-up',
      projectsByClimateObjectives: 'bi-list-check',
      projectTypes: 'bi-diagram-3'
    };
    return icons[chartName] || 'bi-graph-up';
  }

  resetFilters() {
    this.selectedRegion = "All";
    this.selectedSector = "All";
    this.selectedClimateObjective = "All";
    this.startYear = this.minYear;
    this.endYear = this.maxYear;
    this.applyFilters();
  }

  // Add after other methods
  public highlightSubsector(subsector: string): void {
    this.selectedSubsector = subsector;
  }

  public clearSubsectorHighlight(): void {
    this.selectedSubsector = null;
  }

  public setChartView(view: 'donut' | 'bar'): void {
    this.chartView = view;
  }

  public getSubsectorBudget(subsector: string): number {
    return this.filteredProjects
      .filter(p => p.subsector === subsector)
      .reduce((sum, p) => sum + p.budget, 0);
  }

  public getCategoryName(subsector: string): string {
    const categories = {
      'Energy': ['Solar', 'Wind', 'Hydropower', 'Biomass', 'Geothermal'],
      'Infrastructure': ['Transport', 'Low carbon transport'],
      'Environment': ['Water management', 'Natural resources', 'Flood protection']
    };

    for (const [category, subsectors] of Object.entries(categories)) {
      if (subsectors.includes(subsector)) return category;
    }
    return 'Other';
  }

  public getCategoryColor(subsector: string): string {
    const categoryColors = {
      'Energy': 'bg-[#007AFF]',
      'Infrastructure': 'bg-[#5856D6]',
      'Environment': 'bg-[#34C759]',
      'Other': 'bg-[#86868B]'
    } as const;
    
    type CategoryKey = keyof typeof categoryColors;
    return categoryColors[this.getCategoryName(subsector) as CategoryKey];
  }

  private initializeCharts(): void {
    this.chartNames.forEach((chartName) => {
      const chartDom = document.getElementById(chartName + "Chart");
      if (chartDom) {
        this.charts[chartName] = echarts.init(chartDom);
        this.updateChart(chartName);
      } else {
        console.warn(`Chart container for ${chartName} not found`);
      }
    });
  }

  private updateAllCharts(): void {
    Object.keys(this.charts).forEach((chartName) => {
      this.updateChart(chartName as ChartName);
    });
  }

  private updateChart(chartName: ChartName): void {
    if (!this.charts[chartName]) {
      console.warn(`Chart instance for ${chartName} not initialized`);
      return;
    }
    
    switch (chartName) {
      case "infrastructureInvestment":
        this.createInfrastructureInvestmentChart();
        break;
      case "projectTypes":
        this.createProjectTypesChart();
        break;
      case "investmentByRegion":
        this.createInvestmentByRegionChart();
        break;
      case "projectsByRegion":
        this.createProjectsByRegionChart();
        break;
      case "projectsByClimateObjectives":
        this.createProjectsByClimateObjectivesChart();
        break;
      case "investmentsByClimateObjectives":
        this.createInvestmentsByClimateObjectivesChart();
        break;
    }
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
    const filters = {
      region: this.selectedRegion,
      sector: this.selectedSector,
      climateObjective: this.selectedClimateObjective,
      startYear: this.startYear,
      endYear: this.endYear
    };

    this.filteredProjects = this.projects.filter(project => {
      const regionName = this.getRegionName(project.region);
      return (
        (this.selectedRegion === "All" || regionName === this.selectedRegion) &&
        (this.selectedSector === "All" || project.sector === this.selectedSector) &&
        (this.selectedClimateObjective === "All" || project.climateObjective === this.selectedClimateObjective)
      );
    });

    this.updateKeyMetrics();
    this.updateSustainableSubsectorBreakdown();
    this.updateAllCharts();
    this.updateMapMarkers();
    this.cdr.detectChanges();
  }

  updateKeyMetrics() {
    this.totalProjects = this.filteredProjects.length;

    // Update sustainableSubsectorBreakdown
    this.updateSustainableSubsectorBreakdown();

    // Assuming a project is completed if it has no investment in the last year
    const completedProjects = this.filteredProjects.filter(
      (p) => !p.yearlyInvestment[this.endYear.toString()]
    ).length;
    this.projectCompletionRate =
      (completedProjects / this.totalProjects) * 100 || 0;
    // Assuming each project creates a random number of jobs between 100 and 1000
    this.jobsCreated = this.filteredProjects.reduce(
      (sum, p) => sum + Math.floor(Math.random() * 900 + 100),
      0
    );

    // Update the stats array
    this.stats = [
      {
        title: "Total Projects",
        value: this.totalProjects,
        icon: "bi-folder2-open",
        description: `from ${this.regions.length - 1} Regions`,
        format: "1.0-0",
      },
      {
        title: "Project Completion",
        value: this.projectCompletionRate,
        icon: "bi-graph-up",
        description: "of projects completed",
        format: "1.0-0",
      },
      {
        title: "Jobs Created",
        value: this.jobsCreated,
        icon: "bi-people",
        description: "estimated new jobs",
        format: "1.0-0",
      },
      {
        title: "Risk Assessment",
        value: this.climateRiskAssessmentPercentage,
        icon: "bi-clipboard-check",
        description: "projects with published assessment",
        format: "1.0-0",
      },
    ];
  }
}
