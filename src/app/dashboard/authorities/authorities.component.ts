import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AgencyService, Agency } from '../../services/agency.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-authorities',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './authorities.component.html',
  styleUrls: ['./authorities.component.scss']
})
export class AuthoritiesComponent implements OnInit {
  agencies: Agency[] = [];
  filteredAgencies: Agency[] = [];
  isLoading = true;
  error: string | null = null;
  searchTerm = '';
  filterStatus: 'all' | 'active' | 'inactive' = 'all';
  
  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  showDetailsModal = false;
  
  // Selected agency for operations
  selectedAgency: Agency | null = null;
  
  // Form data for create/edit
  agencyForm: Partial<Agency> = {
    name: '',
    code: '',
    description: '',
    status: 'active',
    address: {
      streetAddress: '',
      locality: '',
      region: '',
      postalCode: '',
      countryName: ''
    },
    contactInfo: {
      email: '',
      phone: '',
      website: ''
    }
  };
  
  // Operation states
  isCreating = false;
  isUpdating = false;
  isDeleting = false;
  
  constructor(
    private agencyService: AgencyService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.loadAgencies();
  }
  
  loadAgencies(): void {
    this.isLoading = true;
    this.error = null;
    
    this.agencyService.getAgencies().subscribe({
      next: (agencies) => {
        this.agencies = agencies;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading agencies:', error);
        this.error = 'Failed to load authorities. Please try again.';
        this.isLoading = false;
      }
    });
  }
  
  applyFilters(): void {
    let filtered = [...this.agencies];
    
    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(agency => 
        agency.name.toLowerCase().includes(term) ||
        agency.code.toLowerCase().includes(term) ||
        (agency.description && agency.description.toLowerCase().includes(term))
      );
    }
    
    // Apply status filter
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(agency => agency.status === this.filterStatus);
    }
    
    this.filteredAgencies = filtered;
  }
  
  onSearchChange(): void {
    this.applyFilters();
  }
  
  onStatusFilterChange(): void {
    this.applyFilters();
  }
  
  // Modal handlers
  openCreateModal(): void {
    this.resetForm();
    this.showCreateModal = true;
  }
  
  closeCreateModal(): void {
    this.showCreateModal = false;
    this.resetForm();
  }
  
  openEditModal(agency: Agency): void {
    this.selectedAgency = agency;
    this.agencyForm = {
      name: agency.name,
      code: agency.code,
      description: agency.description,
      status: agency.status,
      address: { ...agency.address },
      contactInfo: { ...agency.contactInfo }
    };
    this.showEditModal = true;
  }
  
  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedAgency = null;
    this.resetForm();
  }
  
  openDeleteModal(agency: Agency): void {
    this.selectedAgency = agency;
    this.showDeleteModal = true;
  }
  
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedAgency = null;
  }
  
  openDetailsModal(agency: Agency): void {
    this.selectedAgency = agency;
    this.showDetailsModal = true;
  }
  
  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedAgency = null;
  }
  
  // CRUD operations
  createAgency(): void {
    if (!this.validateForm()) {
      return;
    }
    
    this.isCreating = true;
    this.error = null;
    
    // Clean up empty fields
    const cleanedAgency = this.cleanAgencyData(this.agencyForm);
    
    this.agencyService.createAgency(cleanedAgency).subscribe({
      next: (newAgency) => {
        this.agencies.push(newAgency);
        this.applyFilters();
        this.closeCreateModal();
        this.isCreating = false;
      },
      error: (error) => {
        console.error('Error creating agency:', error);
        this.error = error.message || 'Failed to create authority';
        this.isCreating = false;
      }
    });
  }
  
  updateAgency(): void {
    if (!this.selectedAgency || !this.validateForm()) {
      return;
    }
    
    this.isUpdating = true;
    this.error = null;
    
    // Clean up empty fields
    const cleanedAgency = this.cleanAgencyData(this.agencyForm);
    
    this.agencyService.updateAgency(this.selectedAgency._id!, cleanedAgency).subscribe({
      next: (updatedAgency) => {
        const index = this.agencies.findIndex(a => a._id === updatedAgency._id);
        if (index !== -1) {
          this.agencies[index] = updatedAgency;
          this.applyFilters();
        }
        this.closeEditModal();
        this.isUpdating = false;
      },
      error: (error) => {
        console.error('Error updating agency:', error);
        this.error = error.message || 'Failed to update authority';
        this.isUpdating = false;
      }
    });
  }
  
  deleteAgency(): void {
    if (!this.selectedAgency?._id) {
      return;
    }
    
    this.isDeleting = true;
    this.error = null;
    
    this.agencyService.deleteAgency(this.selectedAgency._id).subscribe({
      next: () => {
        this.agencies = this.agencies.filter(a => a._id !== this.selectedAgency?._id);
        this.applyFilters();
        this.closeDeleteModal();
        this.isDeleting = false;
      },
      error: (error) => {
        console.error('Error deleting agency:', error);
        this.error = error.message || 'Failed to delete authority';
        this.isDeleting = false;
      }
    });
  }
  
  // Helper methods
  private validateForm(): boolean {
    if (!this.agencyForm.name || !this.agencyForm.code) {
      this.error = 'Name and Code are required fields';
      return false;
    }
    
    // Validate email if provided
    if (this.agencyForm.contactInfo?.email && !this.isValidEmail(this.agencyForm.contactInfo.email)) {
      this.error = 'Please enter a valid email address';
      return false;
    }
    
    // Validate website URL if provided
    if (this.agencyForm.contactInfo?.website && !this.isValidUrl(this.agencyForm.contactInfo.website)) {
      this.error = 'Please enter a valid website URL';
      return false;
    }
    
    return true;
  }
  
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  private cleanAgencyData(data: Partial<Agency>): Partial<Agency> {
    const cleaned: any = {};
    
    // Copy basic fields
    if (data.name) cleaned.name = data.name;
    if (data.code) cleaned.code = data.code;
    if (data.description) cleaned.description = data.description;
    if (data.status) cleaned.status = data.status;
    
    // Clean address
    if (data.address) {
      const address: any = {};
      if (data.address.streetAddress) address.streetAddress = data.address.streetAddress;
      if (data.address.locality) address.locality = data.address.locality;
      if (data.address.region) address.region = data.address.region;
      if (data.address.postalCode) address.postalCode = data.address.postalCode;
      if (data.address.countryName) address.countryName = data.address.countryName;
      
      if (Object.keys(address).length > 0) {
        cleaned.address = address;
      }
    }
    
    // Clean contact info
    if (data.contactInfo) {
      const contactInfo: any = {};
      if (data.contactInfo.email) contactInfo.email = data.contactInfo.email;
      if (data.contactInfo.phone) contactInfo.phone = data.contactInfo.phone;
      if (data.contactInfo.website) contactInfo.website = data.contactInfo.website;
      
      if (Object.keys(contactInfo).length > 0) {
        cleaned.contactInfo = contactInfo;
      }
    }
    
    return cleaned;
  }
  
  private resetForm(): void {
    this.agencyForm = {
      name: '',
      code: '',
      description: '',
      status: 'active',
      address: {
        streetAddress: '',
        locality: '',
        region: '',
        postalCode: '',
        countryName: ''
      },
      contactInfo: {
        email: '',
        phone: '',
        website: ''
      }
    };
    this.error = null;
  }
  
  getStatusBadgeClass(status: string): string {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  }
  
  getStatusText(status: string): string {
    return status === 'active' ? 'Active' : 'Inactive';
  }
}