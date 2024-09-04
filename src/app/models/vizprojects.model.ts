// projects.model.ts

export interface Region {
    name: string;
    code: string;
    population: number;
}

export interface Location {
    lat: number;
    lng: number;
}

export interface YearlyInvestment {
    [year: string]: number;
}

export interface Project {
    id: string;
    name: string;
    budget: number;
    region: { name: string; code: string; population: number };
    location: { lat: number; lng: number };
    climateObjective: string;
    sector: string;
    subsector: string;
    projectType: string;
    date: string;
    yearlyInvestment: { [key: string]: number };
    climateAndDisasterRiskAssessmentPublished: boolean;
    sustainableSubsector: string;
    // Remove the assetLifetime property
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
        lat: -29.0467,
        lng: 21.8569,
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
    sustainableSubsector: "Solar"
};
