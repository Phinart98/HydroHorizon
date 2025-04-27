<template>
  <div class="h-full w-full relative">
    <client-only>
      <div class="h-full w-full" ref="mapContainer"></div>
      
      <!-- Loading Overlay -->
      <div v-if="!mapLoaded" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
        <div class="text-center p-4 max-w-md">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-3 text-gray-600">{{ loadingMessage }}</p>
          <p v-if="loadingTime > 5" class="mt-2 text-sm text-gray-500">
            This is taking longer than expected. Please wait...
          </p>
        </div>
      </div>
    </client-only>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { getFallbackBoundary } from '~/utils/geoData';
import { useRuntimeConfig } from '#app';

const config = useRuntimeConfig();

const props = defineProps({
  country: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    default: null
  }
});

const mapContainer = ref(null);
const map = ref(null);
const mapLoaded = ref(false);
const countryLayer = ref(null);
const markerGroup = ref(null);
const loadingTime = ref(0);
const loadingMessage = ref('Loading map data...');
const leafletLoading = ref(false);

let loadingTimer;

// Initialize map on client side only
onMounted(() => {
  if (process.client) {
    // Start the loading timer
    loadingTimer = setInterval(() => {
      loadingTime.value++;
      
      // Update loading message based on time elapsed
      if (loadingTime.value > 10) {
        loadingMessage.value = 'Still loading map resources...';
      }
      if (loadingTime.value > 20) {
        loadingMessage.value = 'Almost there! Finalizing map setup...';
      }
    }, 1000);
    
    // Check if Leaflet is already loaded
    if (window.L) {
      initMap();
    } else {
      // Set loading flag
      leafletLoading.value = true;
      
      // Wait for Leaflet script to load
      const checkLeaflet = setInterval(() => {
        if (window.L) {
          clearInterval(checkLeaflet);
          leafletLoading.value = false;
          initMap();
        }
      }, 100);
      
      // Increase timeout to 10 seconds for slower connections
      setTimeout(() => {
        if (!window.L) {
          clearInterval(checkLeaflet);
          console.log("Leaflet failed to load from CDN, loading manually");
          loadLeafletManually();
        }
      }, 10000);
    }
  }
});

// Clean up on unmount
onUnmounted(() => {
  if (loadingTimer) {
    clearInterval(loadingTimer);
  }
  
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
});

function loadLeafletManually() {
  // Add console logging to track loading process
  console.log("Starting manual Leaflet load");
  
  const leafletScript = document.createElement('script');
  leafletScript.src = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';
  leafletScript.crossOrigin = '';
  
  const leafletCss = document.createElement('link');
  leafletCss.rel = 'stylesheet';
  leafletCss.href = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';
  leafletCss.crossOrigin = '';
  
  document.head.appendChild(leafletCss);
  
  leafletScript.onload = () => {
    console.log("Manual Leaflet load successful");
    leafletLoading.value = false;
    initMap();
  };
  
  leafletScript.onerror = (error) => {
    console.error("Manual Leaflet load failed:", error);
    leafletLoading.value = false;
    loadingMessage.value = 'Failed to load map. Please refresh the page.';
  };
  
  document.head.appendChild(leafletScript);
}

function initMap() {
  if (!window.L || !mapContainer.value) return;
  
  try {
    // Clear the loading timer
    if (loadingTimer) {
      clearInterval(loadingTimer);
    }
    
    // Check if we're on a mobile device
    const isMobile = window.innerWidth < 768;
    
    // Create map using global L with mobile-specific settings
    map.value = window.L.map(mapContainer.value, {
      preferCanvas: true, // Better performance for many markers
      updateWhenIdle: true, // Only update when user stops interacting
      updateWhenZooming: false, // Don't update while zooming for better performance
      zoomSnap: isMobile ? 1 : 0.5, // Less smooth zooming on mobile for performance
      zoomDelta: isMobile ? 1 : 0.5, // Less smooth zooming on mobile for performance
      wheelPxPerZoomLevel: 120, // Less sensitive mouse wheel
      tap: true, // Enable tap for mobile
      tapTolerance: 15, // Increase tap tolerance for mobile
      bounceAtZoomLimits: false // Disable bounce for better performance
    }).setView([7.9465, -1.0232], isMobile ? 5 : 6); // Start at a slightly lower zoom on mobile
    
    // Add tile layer
    window.L.tileLayer(config.public.mapTileProvider || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(map.value);
    
    // Create marker group for better performance
    markerGroup.value = window.L.layerGroup().addTo(map.value);
    
    // Add legend - make it collapsible on mobile
    addLegend(isMobile);
    
    // Update map with initial country data
    updateMap();
    
    mapLoaded.value = true;
  } catch (error) {
    console.error("Error initializing map:", error);
    loadingMessage.value = 'Error loading map. Please refresh the page.';
  }
}

// Update the legend to be collapsible on mobile
function addLegend(isMobile = false) {
  if (!window.L || !map.value) return;
  
  const legend = window.L.control({ position: 'bottomright' });
  
  legend.onAdd = function() {
    const div = window.L.DomUtil.create('div', 'legend bg-white p-3 rounded-md shadow-md');
    
    if (isMobile) {
      // Collapsible legend for mobile
      div.innerHTML = `
        <div class="legend-toggle flex items-center justify-between cursor-pointer">
          <h4 class="text-sm font-semibold">Groundwater Legend</h4>
          <span class="legend-icon">▼</span>
        </div>
        <div class="legend-content hidden mt-2">
          <div class="flex items-center mb-1">
            <div class="w-4 h-4 rounded-full bg-blue-700 mr-2"></div>
            <span class="text-xs">Very High (>10cm)</span>
          </div>
          <div class="flex items-center mb-1">
            <div class="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
            <span class="text-xs">High (5-10cm)</span>
          </div>
          <div class="flex items-center mb-1">
            <div class="w-4 h-4 rounded-full bg-blue-300 mr-2"></div>
            <span class="text-xs">Slightly High (0-5cm)</span>
          </div>
          <div class="flex items-center mb-1">
            <div class="w-4 h-4 rounded-full bg-yellow-300 mr-2"></div>
            <span class="text-xs">Slightly Low (0 to -5cm)</span>
          </div>
          <div class="flex items-center mb-1">
            <div class="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
            <span class="text-xs">Low (-5 to -10cm)</span>
          </div>
          <div class="flex items-center">
            <div class="w-4 h-4 rounded-full bg-red-600 mr-2"></div>
            <span class="text-xs">Very Low (<-10cm)</span>
          </div>
        </div>
      `;
      
      // Add click handler after the legend is added to the map
      setTimeout(() => {
        const toggle = div.querySelector('.legend-toggle');
        const content = div.querySelector('.legend-content');
        const icon = div.querySelector('.legend-icon');
        
        if (toggle && content && icon) {
          toggle.addEventListener('click', function() {
            if (content.classList.contains('hidden')) {
              content.classList.remove('hidden');
              icon.textContent = '▲';
            } else {
              content.classList.add('hidden');
              icon.textContent = '▼';
            }
          });
        }
      }, 0);
    } else {
      // Regular legend for desktop
      div.innerHTML = `
        <h4 class="text-sm font-semibold mb-2">Groundwater Anomaly</h4>
        <div class="flex items-center mb-1">
          <div class="w-4 h-4 rounded-full bg-blue-700 mr-2"></div>
          <span class="text-xs">Very High (>10cm)</span>
        </div>
        <div class="flex items-center mb-1">
          <div class="w-4 h-4 rounded-full bg-blue-700 mr-2"></div>
          <span class="text-xs">Very High (>10cm)</span>
        </div>
        <div class="flex items-center mb-1">
          <div class="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
          <span class="text-xs">High (5-10cm)</span>
        </div>
        <div class="flex items-center mb-1">
          <div class="w-4 h-4 rounded-full bg-blue-300 mr-2"></div>
          <span class="text-xs">Slightly High (0-5cm)</span>
        </div>
        <div class="flex items-center mb-1">
          <div class="w-4 h-4 rounded-full bg-yellow-300 mr-2"></div>
          <span class="text-xs">Slightly Low (0 to -5cm)</span>
        </div>
        <div class="flex items-center mb-1">
          <div class="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
          <span class="text-xs">Low (-5 to -10cm)</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 rounded-full bg-red-600 mr-2"></div>
          <span class="text-xs">Very Low (<-10cm)</span>
        </div>
      `;
    }
    
    return div;
  };
  
  legend.addTo(map.value);
}

// Update map when country or data changes
watch([() => props.country, () => props.data], () => {
  if (map.value) {
    updateMap();
  }
}, { deep: true });

function updateMap() {
  if (!map.value || !window.L || !props.country) return;
  
  try {
    // Clear previous layers
    if (countryLayer.value) {
      map.value.removeLayer(countryLayer.value);
    }
    
    if (markerGroup.value) {
      markerGroup.value.clearLayers();
    }
    
    // Use simplified boundaries for faster loading
    const boundary = getFallbackBoundary(props.country);
    
    if (boundary) {
      countryLayer.value = window.L.geoJSON(boundary, {
        style: {
          weight: 2,
          color: '#4a83ec',
          opacity: 1,
          fillColor: '#4a83ec',
          fillOpacity: 0.1
        }
      }).addTo(map.value);
      
      // Fit map to boundary
      map.value.fitBounds(countryLayer.value.getBounds());
    }
    
    // Add data points
    updateDataPoints();
  } catch (error) {
    console.error("Error updating map:", error);
  }
}

function updateDataPoints() {
  if (!map.value || !window.L || !props.data || !props.data.points || !markerGroup.value) return;
  
  // Check if we're on a mobile device
  const isMobile = window.innerWidth < 768;
  
  // Add data points
  props.data.points.forEach(point => {
    try {
      // Make circles slightly smaller on mobile
      const radius = isMobile ? 6 : 8;
      
      const marker = window.L.circleMarker([point.lat, point.lng], {
        radius: radius,
        color: getPointColor(point.value),
        fillColor: getPointColor(point.value),
        fillOpacity: 0.7,
        weight: 1
      });
      
      // Enhanced tooltip with more information
      const tooltipContent = `
        <div class="tooltip-content">
          <h4 class="font-bold">${point.name}</h4>
          <div class="mt-1">
            <span class="font-medium">Groundwater anomaly:</span> 
            <span class="${point.value >= 0 ? 'text-green-600' : 'text-red-600'}">
              ${formatValue(point.value)} cm
            </span>
          </div>
          <div class="mt-1">
            <span class="font-medium">Status:</span> 
            <span class="${getStatusColor(point.value)}">
              ${getStatusText(point.value)}
            </span>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            ${getRecommendation(point.value)}
          </div>
        </div>
      `;
      
      // On mobile, make tooltips open on click instead of hover
      if (isMobile) {
        marker.bindPopup(tooltipContent, { 
          className: 'custom-tooltip',
          maxWidth: 220
        });
      } else {
        marker.bindTooltip(tooltipContent, { 
          className: 'custom-tooltip',
          permanent: false,
          direction: 'top',
          offset: [0, -10]
        });
      }
      
      marker.addTo(markerGroup.value);
    } catch (error) {
      console.error("Error adding marker:", error);
    }
  });
  
  // Add window resize handler to update points
  window.addEventListener('resize', () => {
    // Only update if the mobile/desktop state changes
    const newIsMobile = window.innerWidth < 768;
    if (newIsMobile !== isMobile) {
      // Clear and redraw points
      if (markerGroup.value) {
        markerGroup.value.clearLayers();
        updateDataPoints();
      }
    }
  });
}

function getPointColor(value) {
  if (value > 10) return '#1d4ed8'; // blue-700
  if (value > 5) return '#3b82f6'; // blue-500
  if (value >= 0) return '#93c5fd'; // blue-300
  if (value > -5) return '#fde047'; // yellow-300
  if (value > -10) return '#f97316'; // orange-500
  return '#dc2626'; // red-600
}

function formatValue(value) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}`;
}

function getStatusText(value) {
  if (value > 10) return 'Very High';
  if (value > 5) return 'High';
  if (value >= 0) return 'Slightly High';
  if (value > -5) return 'Slightly Low';
  if (value > -10) return 'Low';
  return 'Very Low';
}

function getStatusColor(value) {
  if (value > 0) return 'text-green-600';
  return 'text-red-600';
}

function getRecommendation(value) {
  if (value > 10) {
    return 'Potential flooding risk. Monitor water levels.';
  } else if (value > 5) {
    return 'Good water availability. Consider water storage.';
  } else if (value >= 0) {
    return 'Normal conditions. Maintain regular water usage.';
  } else if (value > -5) {
    return 'Slight deficit. Consider minor conservation.';
  } else if (value > -10) {
    return 'Moderate deficit. Implement water conservation.';
  } else {
    return 'Severe deficit. Urgent water conservation needed.';
  }
}
</script>

<style scoped>
/* Custom tooltip styles */
:deep(.custom-tooltip) {
  border: none;
  border-radius: 0.375rem;
  padding: 0.5rem;
  font-size: 0.875rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

:deep(.tooltip-content) {
  min-width: 200px;
}

/* Make sure the legend has proper z-index */
:deep(.legend) {
  z-index: 1000;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  :deep(.tooltip-content) {
    min-width: 150px;
  }
}
</style>
