import { Component, AfterViewInit } from '@angular/core';
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
export class DataAnalysisComponent implements AfterViewInit {
    projects$: Observable<any[]> | undefined;

    constructor(private firestore: AngularFirestore) {}

    ngOnInit(): void {
        this.projects$ = this.firestore.collection('projects').snapshotChanges().pipe(
            map(actions => actions.map(a => {
                const data = a.payload.doc.data() as object;
                const id = a.payload.doc.id;
                return { id, ...data };
            }))
        );
    }

    ngAfterViewInit(): void {
        this.projects$?.subscribe(projects => {
            this.initCharts(projects);
        });
    }

    initCharts(projects: any[]): void {
        setTimeout(() => {
            const projectLocationsChart = echarts.init(document.getElementById('projectLocationsChart') as HTMLDivElement);
            const completionTimelineChart = echarts.init(document.getElementById('completionTimelineChart') as HTMLDivElement);
            const climateFinanceChart = echarts.init(document.getElementById('climateFinanceChart') as HTMLDivElement);
            const jobsAndBeneficiariesChart = echarts.init(document.getElementById('jobsAndBeneficiariesChart') as HTMLDivElement);
            const sustainabilityMeasuresChart = echarts.init(document.getElementById('sustainabilityMeasuresChart') as HTMLDivElement);
            const informationRequestsChart = echarts.init(document.getElementById('informationRequestsChart') as HTMLDivElement);

            // Project Locations and Investment Amounts
            const projectLocations = projects.map(project => project.location.name);
            const investmentAmounts = projects.map(project => project.amountOfInvestment);

            const projectLocationsOption = {
                title: { text: 'Project Locations and Investment Amounts' },
                tooltip: { trigger: 'item', formatter: '{b}: {c}' },
                xAxis: { type: 'category', data: projectLocations },
                yAxis: { type: 'value' },
                series: [
                    { type: 'bar', data: investmentAmounts, itemStyle: { color: '#2c4143' }, animationDuration: 1000, animationEasing: 'cubicOut' }
                ],
                legend: { bottom: 0, data: ['Investment Amount'] }
            };
            projectLocationsChart.setOption(projectLocationsOption);

            // Project Completion Timeline
            const projectNames = projects.map(project => project.name);
            const completionDates = projects.map(project => project.completionDate);

            const completionTimelineOption = {
                title: { text: 'Project Completion Timeline' },
                tooltip: { trigger: 'axis' },
                xAxis: { type: 'category', data: projectNames },
                yAxis: { type: 'time', name: 'Completion Date' },
                series: [
                    { type: 'line', data: completionDates, itemStyle: { color: '#58707b' }, animationDuration: 1000, animationEasing: 'cubicOut' }
                ],
                legend: { bottom: 0, data: ['Completion Date'] }
            };
            completionTimelineChart.setOption(completionTimelineOption);

            // Climate Finance Breakdown
            const climateFinanceSources = projects.flatMap(project => project.fundingSources);
            const climateFinanceCounts = climateFinanceSources.reduce((acc, source) => {
                acc[source] = (acc[source] || 0) + 1;
                return acc;
            }, {});

            const climateFinanceOption = {
                title: { text: 'Climate Finance Breakdown' },
                tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
                series: [
                    {
                        name: 'Climate Finance',
                        type: 'pie',
                        radius: '50%',
                        data: Object.entries(climateFinanceCounts).map(([name, value]) => ({ name, value })),
                        itemStyle: {
                            color: (params: any) => {
                                const colorPalette = ['#2c4143', '#58707b', '#d60000', '#61a8bd', '#628ea0', '#ffce32'];
                                return colorPalette[params.dataIndex % colorPalette.length];
                            }
                        },
                        animationDuration: 1000,
                        animationEasing: 'cubicOut'
                    }
                ],
                legend: { bottom: 0, data: Object.keys(climateFinanceCounts) }
            };
            climateFinanceChart.setOption(climateFinanceOption);

            // Job Creation and Beneficiaries
            const jobsGenerated = projects.map(project => project.jobsGenerated);
            const numberOfBeneficiaries = projects.map(project => project.numberOfBeneficiaries);

            const jobsAndBeneficiariesOption = {
                title: { text: 'Job Creation and Beneficiaries' },
                tooltip: { trigger: 'axis' },
                xAxis: { type: 'category', data: projectNames },
                yAxis: { type: 'value' },
                series: [
                    { name: 'Jobs Generated', type: 'bar', data: jobsGenerated, itemStyle: { color: '#2c4143' }, animationDuration: 1000, animationEasing: 'cubicOut' },
                    { name: 'Number of Beneficiaries', type: 'bar', data: numberOfBeneficiaries, itemStyle: { color: '#58707b' }, animationDuration: 1000, animationEasing: 'cubicOut' }
                ],
                legend: { bottom: 0, data: ['Jobs Generated', 'Number of Beneficiaries'] }
            };
            jobsAndBeneficiariesChart.setOption(jobsAndBeneficiariesOption);

            // Environmental and Climate Sustainability Measures
            const sustainabilityMeasures = projects.map(project => project.climateMeasures);
            const sustainabilityMeasureCounts = sustainabilityMeasures.reduce((acc, measure) => {
                acc[measure] = (acc[measure] || 0) + 1;
                return acc;
            }, {});

            const sustainabilityMeasuresOption = {
                title: { text: 'Environmental and Climate Sustainability Measures' },
                tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c}' },
                series: [
                    {
                        name: 'Sustainability Measures',
                        type: 'pie',
                        radius: '50%',
                        data: Object.entries(sustainabilityMeasureCounts).map(([name, value]) => ({ name, value })),
                        itemStyle: {
                            color: (params: any) => {
                                const colorPalette = ['#2c4143', '#58707b', '#d60000', '#61a8bd', '#628ea0', '#ffce32'];
                                return colorPalette[params.dataIndex % colorPalette.length];
                            }
                        },
                        animationDuration: 1000,
                        animationEasing: 'cubicOut'
                    }
                ],
                legend: { bottom: 0, data: Object.keys(sustainabilityMeasureCounts) }
            };
            sustainabilityMeasuresChart.setOption(sustainabilityMeasuresOption);

            // Freedom of Information Requests and Answers
            const informationRequests = projects.map(project => project.numberOfFreedomOfInformationRequests);
            const informationAnswers = projects.map(project => project.numberOfFreedomOfInformationAnswers);

            const informationRequestsOption = {
                title: { text: 'Freedom of Information Requests and Answers' },
                tooltip: { trigger: 'axis' },
                xAxis: { type: 'category', data: projectNames },
                yAxis: { type: 'value' },
                series: [
                    { name: 'Requests', type: 'line', data: informationRequests, itemStyle: { color: '#d60000' }, animationDuration: 1000, animationEasing: 'cubicOut' },
                    { name: 'Answers', type: 'line', data: informationAnswers, itemStyle: { color: '#ffce32' }, animationDuration: 1000, animationEasing: 'cubicOut' }
                ],
                legend: { bottom: 0, data: ['Requests', 'Answers'] }
            };
            informationRequestsChart.setOption(informationRequestsOption);

            // Resize charts when window size changes
            window.addEventListener('resize', () => {
                projectLocationsChart.resize();
                completionTimelineChart.resize();
                climateFinanceChart.resize();
                jobsAndBeneficiariesChart.resize();
                sustainabilityMeasuresChart.resize();
                informationRequestsChart.resize();
            });
        }, 0);
    }
}
