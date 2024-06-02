import { Component, OnInit, AfterViewChecked, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as echarts from 'echarts';

@Component({
    selector: 'app-data-analysis',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './data-analysis.component.html',
    styleUrls: ['./data-analysis.component.scss']
})
export class DataAnalysisComponent implements OnInit, AfterViewInit {
    projects$: Observable<any[]> | undefined;
    projects: any[] = [];
    chartsInitialized: boolean = false;

    constructor(private firestore: AngularFirestore) {}

    ngOnInit(): void {
        this.projects$ = this.firestore.collection('projects').snapshotChanges().pipe(
            map(actions => actions.map(a => {
                const data = a.payload.doc.data() as object;
                const id = a.payload.doc.id;
                return { id, ...data };
            }))
        );

        this.projects$.subscribe(projects => {
            this.projects = projects;
            console.log('Projects:', this.projects); // Log the projects to the console
            if (this.projects.length > 0) {
                this.initCharts();
            }
        });
    }

    ngAfterViewInit(): void {
        // Ensure charts are only initialized when the DOM is ready
        if (this.projects.length > 0 && !this.chartsInitialized) {
            this.initCharts();
        }
    }

    initCharts(): void {
        this.chartsInitialized = true;

        // Initialize each chart
        setTimeout(() => {
            this.initFundingSourcesChart();
            this.initCompletionTimelineChart();
            this.initClimateFinanceChart();
            this.initBudgetVsActualCostsChart();
            this.initProjectStatusOverviewChart();
        }, 0);
    }

    // Add this method to calculate the funding sources data
    calculateFundingSourcesData(projects: any[]): any[] {
        const fundingSources: { [key: string]: number } = {};
        projects.forEach(project => {
            const fundingSource = project.stages.identification?.climateFinanceData?.financialInstrument;
            if (fundingSource) {
                fundingSources[fundingSource] = (fundingSources[fundingSource] || 0) + 1;
            }
        });

        return Object.keys(fundingSources).map(source => ({ value: fundingSources[source], name: source }));
    }


// Add this method to initialize the funding sources chart
    initFundingSourcesChart(): void {
        const fundingSourcesChart = echarts.init(document.getElementById('fundingSourcesChart') as HTMLDivElement);
        const fundingSourcesData = this.calculateFundingSourcesData(this.projects);
        fundingSourcesChart.setOption({
            title: { text: 'Funding Sources Breakdown', left: 'center' },
            tooltip: { trigger: 'item' },
            series: [{
                name: 'Funding Sources',
                type: 'pie',
                radius: ['40%', '70%'], // Donut chart style
                data: fundingSourcesData,
                emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
            }]
        });
    }
    initCompletionTimelineChart(): void {
        const completionTimelineChart = echarts.init(document.getElementById('completionTimelineChart') as HTMLDivElement);
        const completionTimelineData = this.calculateCompletionTimelineData(this.projects);
        completionTimelineChart.setOption({
            title: { text: 'Project Completion Timeline', left: 'center' },
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: completionTimelineData.dates },
            yAxis: { type: 'value' },
            series: [{ name: 'Completion', type: 'line', data: completionTimelineData.completions }]
        });
    }



    calculateBudgetVsActualCostsData(projects: any[]): { names: string[], estimated: number[], actual: number[] } {
        const names: string[] = [];
        const estimated: number[] = [];
        const actual: number[] = [];

        projects.forEach(project => {
            const name = project.name;
            const estimatedBudgetString = project.stages.preparation?.basicData?.projectBudget;
            const actualCostString = project.stages.completion?.basicData?.estimatedCompletionCost;

            const estimatedBudget = estimatedBudgetString ? parseFloat(estimatedBudgetString.replace(/[^0-9.-]+/g, "")) : 0;
            const actualCost = actualCostString ? parseFloat(actualCostString.replace(/[^0-9.-]+/g, "")) : 0;

            if (name && (estimatedBudget || actualCost)) {
                names.push(name);
                estimated.push(estimatedBudget);
                actual.push(actualCost);
            }
        });

        return { names, estimated, actual };
    }


    initBudgetVsActualCostsChart(): void {
        const budgetVsActualCostsChart = echarts.init(document.getElementById('budgetVsActualCostsChart') as HTMLDivElement);
        const budgetVsActualCostsData = this.calculateBudgetVsActualCostsData(this.projects);

        budgetVsActualCostsChart.setOption({
            title: { text: 'Budget vs. Actual Costs', left: 'center' },
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            legend: { bottom: 10 },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { type: 'category', data: budgetVsActualCostsData.names },
            yAxis: { type: 'value' },
            series: [
                {
                    name: 'Estimated Budget',
                    type: 'bar',
                    data: budgetVsActualCostsData.estimated
                },
                {
                    name: 'Actual Cost',
                    type: 'bar',
                    data: budgetVsActualCostsData.actual
                }
            ]
        });
    }









    initClimateFinanceChart(): void {
        const climateFinanceChart = echarts.init(document.getElementById('climateFinanceChart') as HTMLDivElement);
        const climateFinanceData = this.calculateClimateFinanceData(this.projects);
        console.log('Climate Finance Data:', climateFinanceData); // Log data to check it
        climateFinanceChart.setOption({
            title: { text: 'Climate Finance Breakdown', left: 'center' },
            tooltip: { trigger: 'item' },
            series: [{
                name: 'Climate Finance',
                type: 'pie',
                radius: '50%',
                data: climateFinanceData,
                emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
            }]
        });
    }

    calculateClimateFinanceData(projects: any[]): any[] {
        const climateFinance: { [key: string]: number } = {};
        projects.forEach(project => {
            const financeSource = project.stages.identification?.climateFinanceData?.financialInstrument;
            const amount = project.stages.identification?.climateFinanceData?.amountOfInvestment || 0;
            if (financeSource) {
                const parsedAmount = parseFloat(amount.replace(/[^0-9.-]+/g, ""));
                climateFinance[financeSource] = (climateFinance[financeSource] || 0) + parsedAmount;
            }
        });

        console.log('Processed Climate Finance:', climateFinance); // Log to check processed data
        return Object.keys(climateFinance).map(source => ({ value: climateFinance[source], name: source }));
    }





    initProjectStatusOverviewChart(): void {
        const projectStatusChart = echarts.init(document.getElementById('projectStatusOverviewChart') as HTMLDivElement);
        const projectStatusData = this.calculateProjectStatusData(this.projects);

        projectStatusChart.setOption({
            title: { text: 'Project Status Overview', left: 'center' },
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            legend: { bottom: 10 },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { type: 'category', data: projectStatusData.stages },
            yAxis: { type: 'value' },
            series: [
                {
                    name: 'Upcoming',
                    type: 'bar',
                    stack: 'status',
                    data: projectStatusData.upcoming
                },
                {
                    name: 'Ongoing',
                    type: 'bar',
                    stack: 'status',
                    data: projectStatusData.ongoing
                },
                {
                    name: 'Completed',
                    type: 'bar',
                    stack: 'status',
                    data: projectStatusData.completed
                }
            ]
        });
    }

    calculateProjectStatusData(projects: any[]): { stages: string[], upcoming: number[], ongoing: number[], completed: number[] } {
        const stages = ['identification', 'preparation', 'tenderManagement', 'implementation', 'completion'];
        const statusData = {
            stages: stages.map(stage => stage.charAt(0).toUpperCase() + stage.slice(1)),
            upcoming: Array(stages.length).fill(0),
            ongoing: Array(stages.length).fill(0),
            completed: Array(stages.length).fill(0)
        };

        projects.forEach(project => {
            stages.forEach((stage, index) => {
                const stageData = project.stages[stage]?.basicData;
                if (stageData) {
                    const status = stageData.projectStatus;
                    if (status === 'Upcoming') {
                        statusData.upcoming[index]++;
                    } else if (status === 'Ongoing') {
                        statusData.ongoing[index]++;
                    } else if (status === 'Completed') {
                        statusData.completed[index]++;
                    }
                }
            });
        });

        return statusData;
    }


    calculateCompletionTimelineData(projects: any[]): { dates: string[], completions: number[] } {
        const completionData: { [key: string]: number } = {};
        projects.forEach(project => {
            const completionDate = project.stages.completion?.basicData?.estimatedCompletionDate;
            if (completionDate) {
                const date = new Date(completionDate).getFullYear().toString();
                completionData[date] = (completionData[date] || 0) + 1;
            }
        });

        const dates = Object.keys(completionData).sort();
        const completions = dates.map(date => completionData[date]);
        return { dates, completions };
    }







}
