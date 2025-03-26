import * as L from 'leaflet';

declare module 'leaflet' {
    interface MarkerClusterGroupOptions {
        chunkedLoading?: boolean;
        spiderfyOnMaxZoom?: boolean;
        showCoverageOnHover?: boolean;
        zoomToBoundsOnClick?: boolean;
        maxClusterRadius?: number;
        iconCreateFunction?: (cluster: MarkerCluster) => L.DivIcon;
    }

    interface MarkerCluster {
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