<template>
  <div class="relative rounded-lg overflow-hidden shadow-md">
    <div id="map" ref="mapContainer" class="h-[500px] w-full"></div>
    <div v-if="loading" class="absolute inset-0 bg-white bg-opacity-70 flex justify-center items-center z-10">
      <div class="flex flex-col items-center">
        <i class="bi bi-arrow-repeat text-2xl animate-spin text-blue-600"></i>
        <p class="mt-2 text-gray-700">Loading map data...</p>
      </div>
    </div>
    
    <div class="absolute bottom-4 right-4 bg-white p-2 rounded-lg shadow-md z-[400]">
      <div class="text-sm font-semibold mb-1">Groundwater Anomaly</div>
      <div class="flex items-center gap-1">
        <div class="w-4 h-4 bg-red-600"></div>
        <span class="text-xs">Drier</span>
        <div class="w-4 h-4 bg-yellow-500 mx-1"></div>
        <span class="text-xs">Normal</span>
        <div class="w-4 h-4 bg-green-600"></div>
        <span class="text-xs">Wetter</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { getFallbackBoundary, getCountryCenter } from '~/utils/geoData';
import { processMapData, getColorScale } from '~/utils/mapDataProcessor';

const props = defineProps({
  country: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const mapContainer = ref(null);
let map = null;
let heatLayer = null;
let boundaryLayer = null;
const loading = ref(true);

// Function to check if a point is inside a polygon
const isPointInPolygon = (point, polygon) => {
  // Special case for Ghana - be more lenient
  if (props.country === 'ghana') {
    // For Ghana, use a simple bounding box check instead of precise polygon check
    const lat = point[0];
    const lon = point[1];
    return (lat >= 4.5 && lat <= 11.5 && lon >= -3.5 && lon <= 1.5);
  }
  
  if (!polygon || !polygon.geometry || polygon.geometry.type !== 'Polygon') {
    return true; // If no valid polygon, assume point is inside
  }
  
  const x = point[1]; // longitude
  const y = point[0]; // latitude
  
  // Get coordinates from the polygon
  const coords = polygon.geometry.coordinates[0];
  
  let inside = false;
  for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
    const xi = coords[i][0];
    const yi = coords[i][1];
    const xj = coords[j][0];
    const yj = coords[j][1];
    
    const intersect = ((yi > y) !== (yj > y)) && 
                      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  
  return inside;
};

const initMap = () => {
  // Only run on client-side
  if (process.client) {
    // Import Leaflet dynamically on client-side
    import('leaflet').then((L) => {
      if (map) {
        map.remove();
      }
      
      const center = getCountryCenter(props.country);
      // Adjust zoom levels for better fit
      const zoomLevels = {
        'ghana': 7,
        'kenya': 6,
        'india': 5
      };
      const zoom = zoomLevels[props.country] || 7;
      
      map = L.map(mapContainer.value).setView(center, zoom);
      
      // Add OpenStreetMap base layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // Add country boundary
      const boundary = getFallbackBoundary(props.country);
      if (boundary) {
        boundaryLayer = L.geoJSON(boundary, {
          style: {
            color: '#333',
            weight: 2,
            fillOpacity: 0.1
          }
        }).addTo(map);
        
        // Fit map to boundary
        try {
          map.fitBounds(boundaryLayer.getBounds());
        } catch (e) {
          console.error("Error fitting to bounds:", e);
        }
      }
      
      loading.value = false;
      
      // Update map data if available
      if (props.data) {
        updateMapData(L, boundary);
      }
    });
  }
};

const updateMapData = (L, boundary) => {
  if (!map || !props.data) return;
  
  loading.value = true;
  
  // Remove existing heat layer if it exists
  if (heatLayer) {
    map.removeLayer(heatLayer);
  }
  
  const processedData = processMapData(props.data);
  
  console.log(`Processing data for ${props.country}:`, processedData);
  
  if (!processedData || !processedData.heatmapData || processedData.heatmapData.length === 0) {
    console.warn(`No heatmap data available for ${props.country}`);
    loading.value = false;
    return;
  }
  
  console.log(`Heatmap data points: ${processedData.heatmapData.length}`);
  
  // Create a grid of rectangles for better visualization
  const gridLayer = L.layerGroup().addTo(map);
  
  // Adjust grid size based on country
  const gridSizes = {
    'ghana': 0.25,  // Smaller grid for Ghana
    'kenya': 0.4,
    'india': 0.5
  };
  const size = gridSizes[props.country] || 0.4;
  
  // Create a popup template function with enhanced details
  const createPopupContent = (lat, lon, value) => {
    const valueInCm = (value * 100).toFixed(1);
    const prefix = value > 0 ? '+' : '';
    
    let status, colorClass, impactText;
    if (value > 0.1) {
      status = 'Significantly higher than normal';
      colorClass = 'text-green-700';
      impactText = 'Potential for increased water availability, but possible flooding risk in low-lying areas.';
    } else if (value > 0.05) {
      status = 'Higher than normal';
      colorClass = 'text-green-600';
      impactText = 'Good water availability for agriculture and domestic use.';
    } else if (value > -0.05) {
      status = 'Near normal';
      colorClass = 'text-yellow-600';
      impactText = 'Typical groundwater conditions for this region and time of year.';
    } else if (value > -0.1) {
      status = 'Lower than normal';
      colorClass = 'text-red-600';
      impactText = 'Potential for water stress in agriculture and shallow wells.';
    } else {
      status = 'Significantly lower than normal';
      colorClass = 'text-red-700';
      impactText = 'High risk of water scarcity. Conservation measures recommended.';
    }
    
    return `
      <div class="p-3 max-w-xs">
        <div class="font-bold text-lg mb-2">Groundwater Insights</div>
        <div class="mb-2">
          <span class="font-semibold">Location:</span> ${lat.toFixed(2)}°, ${lon.toFixed(2)}°
        </div>
        <div class="mb-2">
          <span class="font-semibold">Anomaly:</span> 
          <span class="${colorClass} font-bold">${prefix}${valueInCm} cm</span>
        </div>
        <div class="mb-2">
          <span class="font-semibold">Status:</span> 
          <span class="${colorClass}">${status}</span>
        </div>
        <div class="mb-2">
          <span class="font-semibold">Potential Impact:</span>
          <p class="text-sm mt-1">${impactText}</p>
        </div>
        <div class="text-xs text-gray-500 mt-2">
          Data from GRACE/GRACE-FO satellites
        </div>
      </div>
    `;
  };
  
  // Create enhanced tooltip content
  const createTooltipContent = (value) => {
    const valueInCm = (value * 100).toFixed(1);
    const prefix = value > 0 ? '+' : '';
    
    let status;
    if (value > 0.05) {
      status = 'Higher than normal';
    } else if (value < -0.05) {
      status = 'Lower than normal';
    } else {
      status = 'Near normal';
    }
    
    return `<div class="font-semibold">${prefix}${valueInCm} cm</div><div class="text-xs">${status}</div>`;
  };
  
  // Filter points to only include those within the country boundary
  // For Ghana, we'll be more lenient and include all points in the general region
  let filteredData;
  if (props.country === 'ghana') {
    filteredData = processedData.heatmapData.filter(point => {
      const lat = point[0];
      const lon = point[1];
      return (lat >= 4.5 && lat <= 11.5 && lon >= -3.5 && lon <= 1.5);
    });
  } else {
    filteredData = processedData.heatmapData.filter(point => {
      return isPointInPolygon([point[0], point[1]], boundary);
    });
  }
  
  console.log(`Filtered data points: ${filteredData.length}`);
  
  // If no data points after filtering, try using all data points
  if (filteredData.length === 0 && props.country === 'ghana') {
    console.warn("No data points found for Ghana after filtering. Using all data points.");
    filteredData = processedData.heatmapData;
  }
  
  filteredData.forEach(point => {
    const [lat, lon, value] = point;
    
    // Create a rectangle for each data point
    const bounds = [
      [lat - size/2, lon - size/2],
      [lat + size/2, lon + size/2]
    ];
    
    const color = getColorScale(value);
    
    // Create rectangle with tooltip and popup
    const rectangle = L.rectangle(bounds, {
      color: 'rgba(0,0,0,0.2)',
      weight: 1,
      fillColor: color,
      fillOpacity: 0.7
    }).addTo(gridLayer);
    
    // Add tooltip with HTML content
    const tooltipContent = createTooltipContent(value);
    rectangle.bindTooltip(tooltipContent, { 
      permanent: false, 
      direction: 'top',
      className: 'custom-tooltip',
      opacity: 1.0
    });
    
    // Add popup with HTML content
    rectangle.bindPopup(createPopupContent(lat, lon, value), {
      maxWidth: 300
    });
  });
  
  heatLayer = gridLayer;
  loading.value = false;
};

onMounted(() => {
  initMap();
});

watch(() => props.country, () => {
  initMap();
});

watch(() => props.data, (newData) => {
  if (process.client && map) {
    import('leaflet').then((L) => {
      const boundary = getFallbackBoundary(props.country);
      
      // Debug log for data
      if (newData) {
        console.log(`Data received for ${props.country}:`, newData);
        if (newData.raw_data) {
          console.log("Raw data available:", {
            lats: newData.raw_data.lats?.length || 0,
            lons: newData.raw_data.lons?.length || 0,
            values: newData.raw_data.values?.length || 0
          });
        }
      }
      
      updateMapData(L, boundary);
    });
  }
});
</script>

<style>
/* Make sure these styles are applied globally */
.custom-tooltip {
  background-color: white !important;
  border: 1px solid #ccc !important;
  border-radius: 4px !important;
  padding: 4px 8px !important;
  font-size: 12px !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2) !important;
  opacity: 1 !important;
  z-index: 1000 !important;
}

/* Override Leaflet's default tooltip styles */
.leaflet-tooltip {
  background-color: white !important;
  border: 1px solid #ccc !important;
  border-radius: 4px !important;
  padding: 4px 8px !important;
  font-size: 12px !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2) !important;
  opacity: 1 !important;
  z-index: 1000 !important;
}

.leaflet-tooltip-top:before {
  border-top-color: #ccc !important;
}
</style>
