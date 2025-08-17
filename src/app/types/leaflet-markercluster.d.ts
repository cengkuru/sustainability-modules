import * as L from 'leaflet';

declare module 'leaflet' {
    interface MarkerClusterGroupOptions extends L.LayerOptions {
        chunkedLoading?: boolean;
        spiderfyOnMaxZoom?: boolean;
        showCoverageOnHover?: boolean;
        zoomToBoundsOnClick?: boolean;
        maxClusterRadius?: number;
        iconCreateFunction?: (cluster: MarkerCluster) => L.DivIcon;
    }

    interface MarkerCluster extends L.Layer {
        getChildCount(): number;
        getAllChildMarkers(): L.Marker[];
        spiderfy(): void;
        unspiderfy(): void;
    }

    class MarkerClusterGroup extends L.FeatureGroup {
        constructor(options?: MarkerClusterGroupOptions);
        clearLayers(): this;
        addLayer(layer: L.Layer): this;
        addLayers(layers: L.Layer[]): this;
        removeLayers(layers: L.Layer[]): this;
        removeLayer(layer: L.Layer): this;
        getLayers(): L.Layer[];
    }
} 

// Provide module declaration to satisfy dynamic import typings
declare module 'leaflet.markercluster';