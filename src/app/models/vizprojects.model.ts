// projects.model.ts

export interface Region {
    name: string;
    code?: string;
    population?: number;
}

export interface Location {
    latitude: number;
    longitude: number;
}

export interface OC4IDS {
    climate_finance_decision_making: string;
    nationally_determined_contributions: string;
    paris_agreement: boolean;
    beneficiaries: number;
    amount_of_investment: number;
    funding_source: string;
    ratio_of_co_finance: string;
    public_consultation_meetings: number;
    abatement_cost: number;
    in_protected_area: boolean;
}

export interface YearlyInvestment {
    [year: string]: number;
}

export interface Project {
    id: string;
    name: string;
    budget: number;
    region: Region | string; // Can be either a Region object or a string
    location: Location;
    climateObjective: string;
    sector: string;
    subsector: string;
    subsector_total: string;
    subsector_label: string;
    projectType: string;
    date: string;
    yearlyInvestment: YearlyInvestment;
    climateAndDisasterRiskAssessmentPublished: boolean;
    sustainableSubsector: string;
    oc4ids: OC4IDS;
}

// Utility types for filtering and aggregation
export interface ProjectMetrics {
    totalProjects: number;
    totalBudget: number;
    averageProjectSize: number;
    projectsByRegion: { [key: string]: number };
    projectsBySector: { [key: string]: number };
    projectsByClimateObjective: { [key: string]: number };
}

export interface ProjectFilters {
    region?: string;
    sector?: string;
    climateObjective?: string;
    startYear?: number;
    endYear?: number;
    hasRiskAssessment?: boolean;
}

export interface SubsectorBreakdown {
    key: string;
    value: number;
    percentage: number;
}

export interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string[];
    }[];
}

// Constants for chart colors and styling
export const CHART_COLORS = {
    primary: '#FAFAFA',
    secondary: '#0066CC',
    accent: '#1D1D1F',
    accent1: '#86868B',
    accent2: '#E5E5E7',
    accent3: '#F5F5F7',
    accent4: '#004499',
    accent5: '#F0F0F2',
    accent6: '#FFFFFF',
};

// Utility functions for data processing
export class ProjectUtils {
    private static getRegionName(region: Region | string): string {
        return typeof region === 'string' ? region : region.name;
    }

    static calculateMetrics(projects: Project[]): ProjectMetrics {
        const metrics: ProjectMetrics = {
            totalProjects: projects.length,
            totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
            averageProjectSize: 0,
            projectsByRegion: {},
            projectsBySector: {},
            projectsByClimateObjective: {},
        };

        metrics.averageProjectSize = metrics.totalBudget / metrics.totalProjects;

        // Calculate breakdowns
        projects.forEach(project => {
            const regionName = this.getRegionName(project.region);
            metrics.projectsByRegion[regionName] = (metrics.projectsByRegion[regionName] || 0) + 1;
            metrics.projectsBySector[project.sector] = (metrics.projectsBySector[project.sector] || 0) + 1;
            metrics.projectsByClimateObjective[project.climateObjective] = 
                (metrics.projectsByClimateObjective[project.climateObjective] || 0) + 1;
        });

        return metrics;
    }

    static filterProjects(projects: Project[], filters: ProjectFilters): Project[] {
        return projects.filter(project => {
            const regionName = this.getRegionName(project.region);
            const regionMatch = !filters.region || filters.region === 'All' || 
                regionName === filters.region;
            const sectorMatch = !filters.sector || filters.sector === 'All' || 
                project.sector === filters.sector;
            const objectiveMatch = !filters.climateObjective || filters.climateObjective === 'All' || 
                project.climateObjective === filters.climateObjective;
            const yearMatch = !filters.startYear || !filters.endYear || 
                Object.keys(project.yearlyInvestment).some(
                    year => {
                        const y = Number(year);
                        return y >= filters.startYear! && y <= filters.endYear!;
                    }
                );
            const riskAssessmentMatch = filters.hasRiskAssessment === undefined || 
                project.climateAndDisasterRiskAssessmentPublished === filters.hasRiskAssessment;

            return regionMatch && sectorMatch && objectiveMatch && yearMatch && riskAssessmentMatch;
        });
    }

    static getYearRange(projects: Project[]): { min: number; max: number } {
        const years = projects.flatMap(p => Object.keys(p.yearlyInvestment).map(Number));
        return {
            min: Math.min(...years),
            max: Math.max(...years)
        };
    }

    static calculateSubsectorBreakdown(projects: Project[]): SubsectorBreakdown[] {
        const breakdown: { [key: string]: number } = {};
        const total = projects.length;

        projects.forEach(project => {
            if (project.sustainableSubsector) {
                breakdown[project.sustainableSubsector] = (breakdown[project.sustainableSubsector] || 0) + 1;
            }
        });

        return Object.entries(breakdown)
            .map(([key, value]) => ({
                key,
                value,
                percentage: (value / total) * 100
            }))
            .sort((a, b) => b.value - a.value);
    }

    static prepareChartData(projects: Project[], type: 'region' | 'sector' | 'objective'): ChartData {
        const data: { [key: string]: number } = {};
        
        projects.forEach(project => {
            const key = type === 'region' ? this.getRegionName(project.region) :
                        type === 'sector' ? project.sector :
                        project.climateObjective;
            data[key] = (data[key] || 0) + project.budget;
        });

        return {
            labels: Object.keys(data),
            datasets: [{
                label: `Total Investment by ${type}`,
                data: Object.values(data),
                backgroundColor: Object.keys(data).map((_, i) => 
                    Object.values(CHART_COLORS)[i % Object.keys(CHART_COLORS).length]
                )
            }]
        };
    }
}

// Example usage:
const exampleProject: Project = {
    id: "project001",
    name: "Solar Energy Farm",
    budget: 626122088.00,
    region: {
        name: "Northern Cape",
        code: "ZA-NC",
        population: 1292786,
    },
    location: {
        latitude: -29.0467,
        longitude: 21.8569,
    },
    climateObjective: "Mitigation",
    sector: "Energy",
    subsector: "Solar energy",
    projectType: "Solar Energy",
    date: "2024-01-13",
    yearlyInvestment: {
        "2019": 150000000,
        "2020": 200000000,
        "2021": 276122088,
        "2022": 0,
    },
    // New fields
    climateAndDisasterRiskAssessmentPublished: true,
    sustainableSubsector: "Solar",
    oc4ids: {
        climate_finance_decision_making: "Decision-making",
        nationally_determined_contributions: "Contributions",
        paris_agreement: true,
        beneficiaries: 1000000,
        amount_of_investment: 1000000000,
        funding_source: "Public",
        ratio_of_co_finance: "50:50",
        public_consultation_meetings: 10,
        abatement_cost: 50000000,
        in_protected_area: true,
    },
    subsector_total: "$6.8bn",
    subsector_label: "Solar energy: $6.8bn",
};
