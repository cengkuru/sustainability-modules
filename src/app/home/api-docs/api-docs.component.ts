import { Component, OnInit, Renderer2 } from '@angular/core';
import { ApiEndpoint } from "../../models/api-endpoint.model";
import { ApiService } from "../../services/api.service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
    selector: 'app-api-docs',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule
    ],
    templateUrl: './api-docs.component.html',
    styleUrls: ['./api-docs.component.scss'],
    animations: [
        trigger('fadeInOut', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('300ms', style({ opacity: 1 })),
            ]),
            transition(':leave', [
                animate('300ms', style({ opacity: 0 })),
            ]),
        ]),
        trigger('listAnimation', [
            transition('* <=> *', [
                query(':enter',
                    [style({ opacity: 0, transform: 'translateY(50px)' }),
                        stagger('50ms', animate('500ms ease', style({ opacity: 1, transform: 'translateY(0)' })))],
                    { optional: true }
                ),
            ]),
        ]),
    ]
})
export class ApiDocsComponent implements OnInit {
    apiEndpoints: ApiEndpoint[] = [];
    activeEndpoint: string = '';
    searchTerm: string = '';
    isSidebarOpen: boolean = false;
    isDarkMode: boolean = false;
    showApiInfoModal: boolean = false;

    constructor(private apiService: ApiService, private renderer: Renderer2) {}

    ngOnInit(): void {
        this.loadApiEndpoints();
        this.initializeDarkMode();
    }

    loadApiEndpoints(): void {
        this.apiService.getApiEndpoints().subscribe(
            (endpoints: ApiEndpoint[]) => {
                this.apiEndpoints = endpoints;
                if (this.apiEndpoints.length > 0) {
                    this.activeEndpoint = this.apiEndpoints[0].title;
                }
            },
            (error) => {
                console.error('Error fetching API endpoints:', error);
                // TODO: Implement error handling (e.g., show error message to user)
            }
        );
    }

    setActiveEndpoint(title: string): void {
        this.activeEndpoint = title;
        if (window.innerWidth < 768) {
            this.toggleSidebar();
        }
    }

    toggleSidebar(): void {
        this.isSidebarOpen = !this.isSidebarOpen;
    }

    toggleDarkMode(): void {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('darkMode', this.isDarkMode.toString());
        this.updateDarkMode();
    }

    initializeDarkMode(): void {
        const savedDarkMode = localStorage.getItem('darkMode');
        this.isDarkMode = savedDarkMode === 'true';
        this.updateDarkMode();
    }

    updateDarkMode(): void {
        if (this.isDarkMode) {
            this.renderer.addClass(document.body, 'dark');
        } else {
            this.renderer.removeClass(document.body, 'dark');
        }
    }

    get filteredEndpoints(): ApiEndpoint[] {
        if (!this.searchTerm) return this.apiEndpoints;
        return this.apiEndpoints.filter(endpoint =>
            endpoint.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            endpoint.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            endpoint.parameters?.some((param) =>
                param.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                param.description.toLowerCase().includes(this.searchTerm.toLowerCase())
            ) ||
            endpoint.responses?.some((response) =>
                response.status.toString().includes(this.searchTerm.toLowerCase()) ||
                response.description.toLowerCase().includes(this.searchTerm.toLowerCase())
            )
        );
    }

    copyToClipboard(text: string | undefined): void {
        if (text) {
            navigator.clipboard.writeText(text).then(() => {
                // TODO: Show a brief success message to the user
                console.log('Text copied to clipboard');
            }, (err) => {
                console.error('Could not copy text: ', err);
            });
        } else {
            console.warn('Attempted to copy undefined text');
        }
    }

    getCopyableText(text: string | undefined): string {
        return text || 'N/A';
    }

    toggleApiInfoModal(): void {
        this.showApiInfoModal = !this.showApiInfoModal;
    }

}
