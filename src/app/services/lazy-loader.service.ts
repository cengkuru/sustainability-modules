import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LazyLoaderService {
  private loadedLibraries = new Map<string, any>();
  private loadingPromises = new Map<string, Promise<any>>();

  /**
   * Lazy load ECharts library
   */
  async loadECharts(): Promise<typeof import('echarts')> {
    const libraryName = 'echarts';
    
    // Return if already loaded
    if (this.loadedLibraries.has(libraryName)) {
      return this.loadedLibraries.get(libraryName);
    }

    // Return existing loading promise if already loading
    if (this.loadingPromises.has(libraryName)) {
      return this.loadingPromises.get(libraryName);
    }

    // Start loading
    const loadingPromise = import('echarts').then(module => {
      this.loadedLibraries.set(libraryName, module);
      this.loadingPromises.delete(libraryName);
      return module;
    });

    this.loadingPromises.set(libraryName, loadingPromise);
    return loadingPromise;
  }

  /**
   * Lazy load XLSX library for Excel operations
   */
  async loadXLSX(): Promise<typeof import('xlsx')> {
    const libraryName = 'xlsx';
    
    if (this.loadedLibraries.has(libraryName)) {
      return this.loadedLibraries.get(libraryName);
    }

    if (this.loadingPromises.has(libraryName)) {
      return this.loadingPromises.get(libraryName);
    }

    const loadingPromise = import('xlsx').then(module => {
      this.loadedLibraries.set(libraryName, module);
      this.loadingPromises.delete(libraryName);
      return module;
    });

    this.loadingPromises.set(libraryName, loadingPromise);
    return loadingPromise;
  }

  /**
   * Lazy load jsPDF library for PDF generation
   */
  async loadJsPDF(): Promise<typeof import('jspdf')> {
    const libraryName = 'jspdf';
    
    if (this.loadedLibraries.has(libraryName)) {
      return this.loadedLibraries.get(libraryName);
    }

    if (this.loadingPromises.has(libraryName)) {
      return this.loadingPromises.get(libraryName);
    }

    const loadingPromise = import('jspdf').then(module => {
      this.loadedLibraries.set(libraryName, module);
      this.loadingPromises.delete(libraryName);
      return module;
    });

    this.loadingPromises.set(libraryName, loadingPromise);
    return loadingPromise;
  }

  /**
   * Lazy load Leaflet library
   */
  async loadLeaflet(): Promise<typeof import('leaflet')> {
    const libraryName = 'leaflet';
    
    if (this.loadedLibraries.has(libraryName)) {
      return this.loadedLibraries.get(libraryName);
    }

    if (this.loadingPromises.has(libraryName)) {
      return this.loadingPromises.get(libraryName);
    }

    const loadingPromise = import('leaflet').then(module => {
      this.loadedLibraries.set(libraryName, module);
      this.loadingPromises.delete(libraryName);
      return module;
    });

    this.loadingPromises.set(libraryName, loadingPromise);
    return loadingPromise;
  }

  /**
   * Lazy load Leaflet MarkerCluster plugin
   */
  async loadLeafletMarkerCluster(): Promise<void> {
    const libraryName = 'leaflet.markercluster';
    
    if (this.loadedLibraries.has(libraryName)) {
      return;
    }

    if (this.loadingPromises.has(libraryName)) {
      return this.loadingPromises.get(libraryName);
    }

    // First ensure Leaflet is loaded
    await this.loadLeaflet();

    const loadingPromise = import('leaflet.markercluster').then(() => {
      this.loadedLibraries.set(libraryName, true);
      this.loadingPromises.delete(libraryName);
    });

    this.loadingPromises.set(libraryName, loadingPromise);
    return loadingPromise;
  }

  /**
   * Check if a library is loaded
   */
  isLoaded(libraryName: string): boolean {
    return this.loadedLibraries.has(libraryName);
  }

  /**
   * Clear all loaded libraries (useful for testing)
   */
  clearCache(): void {
    this.loadedLibraries.clear();
    this.loadingPromises.clear();
  }
}