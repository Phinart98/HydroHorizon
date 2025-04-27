<template>
  <div class="bg-white p-4 rounded-lg shadow-md">
    <h2 class="text-lg font-semibold mb-3">Groundwater Insights</h2>
    
    <client-only>
      <div v-if="data" class="space-y-4">
        <!-- Country Overview -->
        <div class="p-3 bg-blue-50 rounded-md">
          <h3 class="font-medium text-blue-800 capitalize">
            <i class="bi bi-geo-alt-fill mr-1"></i>
            {{ country }} Overview
          </h3>
          <p class="mt-1 text-sm">{{ formatDate(data.date) }}</p>
        </div>
        
        <!-- Average Anomaly -->
        <div class="flex items-center justify-between p-3 border-b">
          <span class="text-gray-600">
            <i class="bi bi-water mr-1"></i>
            Average Groundwater Change:
          </span>
          <span 
            :class="[
              'font-semibold', 
              data.averageAnomaly > 0 ? 'text-green-600' : 'text-red-600'
            ]"
          >
            {{ formatAnomaly(data.averageAnomaly) }}
            <i v-if="data.averageAnomaly > 0" class="bi bi-arrow-up-circle-fill ml-1"></i>
            <i v-else class="bi bi-arrow-down-circle-fill ml-1"></i>
          </span>
        </div>
        
        <!-- Trend -->
        <div class="p-3 border-b">
          <div class="flex items-center justify-between mb-2">
            <span class="text-gray-600">
              <i class="bi bi-graph-up mr-1"></i>
              12-Month Trend:
            </span>
            <div class="flex items-center">
              <span class="font-semibold mr-2" :class="getTrendColor(data.trend)">
                {{ data.trend }}
              </span>
              <button 
                @click="showTrendInfo = true" 
                class="text-gray-500 hover:text-blue-600 transition-colors"
                title="Show trend classification"
              >
                <i class="bi bi-question-circle"></i>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Regional Insights -->
        <div v-if="data.regions && data.regions.length > 0">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-medium">
              <i class="bi bi-pin-map-fill mr-1"></i>
              Regional Insights
            </h3>
            <span class="text-xs text-gray-500">Top {{ data.regions.length }} regions by change</span>
          </div>
          <div 
            v-for="(region, index) in sortedRegions" 
            :key="index"
            class="p-2 mb-2 rounded-md"
            :class="getRegionBackgroundColor(region.anomaly)"
          >
            <div class="flex justify-between">
              <span class="font-medium">{{ region.name }}</span>
              <span :class="getAnomalyTextColor(region.anomaly)">
                {{ formatAnomaly(region.anomaly) }}
                <i v-if="region.anomaly > 0" class="bi bi-arrow-up-circle-fill ml-1"></i>
                <i v-else class="bi bi-arrow-down-circle-fill ml-1"></i>
              </span>
            </div>
          </div>
        </div>
        
        <!-- What This Means -->
        <div class="p-3 bg-gray-50 rounded-md mt-4">
          <h3 class="font-medium mb-2">
            <i class="bi bi-lightbulb mr-1"></i>
            What This Means
          </h3>
          <p class="text-sm text-gray-700">
            {{ getInsightSummary() }}
          </p>
        </div>
        
        <!-- Download Button -->
        <button 
          class="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center"
          @click="downloadData"
        >
          <i class="bi bi-download mr-2"></i>
          Download Data
        </button>
      </div>
      
      <div v-else class="py-8 text-center text-gray-500">
        <i class="bi bi-globe2 text-4xl block mb-3"></i>
        <p>Select a country to view insights</p>
      </div>
    </client-only>
    
    <!-- Trend Classification Modal -->
    <div 
      v-if="showTrendInfo" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
      @click.self="showTrendInfo = false"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold">Trend Classification</h3>
          <button @click="showTrendInfo = false" class="text-gray-500 hover:text-gray-700">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        
        <ul class="space-y-2">
          <li class="flex items-center">
            <i class="bi bi-arrow-up-circle-fill text-green-600 mr-2"></i>
            <span class="text-green-600 font-medium">Rapidly Increasing:</span> 
            <span class="ml-1">&gt;10cm/year gain</span>
          </li>
          <li class="flex items-center">
            <i class="bi bi-arrow-up text-green-600 mr-2"></i>
            <span class="text-green-600">Increasing:</span> 
            <span class="ml-1">5-10cm/year gain</span>
          </li>
          <li class="flex items-center">
            <i class="bi bi-arrow-up text-green-500 mr-2"></i>
            <span class="text-green-500">Slightly Increasing:</span> 
            <span class="ml-1">0-5cm/year gain</span>
          </li>
          <li class="flex items-center">
            <i class="bi bi-dash-circle text-yellow-600 mr-2"></i>
            <span class="text-yellow-600">Stable:</span> 
            <span class="ml-1">-1 to +1cm/year change</span>
          </li>
          <li class="flex items-center">
            <i class="bi bi-arrow-down text-red-500 mr-2"></i>
            <span class="text-red-500">Slightly Decreasing:</span> 
            <span class="ml-1">0-5cm/year loss</span>
          </li>
          <li class="flex items-center">
            <i class="bi bi-arrow-down text-red-600 mr-2"></i>
            <span class="text-red-600">Decreasing:</span> 
            <span class="ml-1">5-10cm/year loss</span>
          </li>
          <li class="flex items-center">
            <i class="bi bi-arrow-down-circle-fill text-red-700 mr-2"></i>
            <span class="text-red-700 font-medium">Rapidly Decreasing:</span> 
            <span class="ml-1">&gt;10cm/year loss</span>
          </li>
        </ul>
        
        <div class="mt-6 text-sm text-gray-600">
          <p class="flex items-center">
            <i class="bi bi-info-circle mr-2"></i>
            These classifications are based on annual groundwater level changes measured in centimeters.
          </p>
        </div>
        
        <button 
          @click="showTrendInfo = false"
          class="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

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

const showTrendInfo = ref(false);

// Sort regions by anomaly (most negative first)
const sortedRegions = computed(() => {
  if (!props.data || !props.data.regions) return [];
  return [...props.data.regions].sort((a, b) => a.anomaly - b.anomaly);
});

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long'
  });
}

function formatAnomaly(value) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)} cm`;
}

function getTrendColor(trend) {
  if (trend.includes('Rapidly Increasing')) return 'text-green-600';
  if (trend.includes('Increasing')) return 'text-green-500';
  if (trend.includes('Slightly Increasing')) return 'text-green-400';
  if (trend.includes('Stable')) return 'text-yellow-600';
  if (trend.includes('Slightly Decreasing')) return 'text-red-400';
  if (trend.includes('Decreasing')) return 'text-red-500';
  if (trend.includes('Rapidly Decreasing')) return 'text-red-600';
  return 'text-gray-600';
}

function getRegionBackgroundColor(anomaly) {
  if (anomaly > 5) return 'bg-green-100';
  if (anomaly > 0) return 'bg-green-50';
  if (anomaly > -5) return 'bg-red-50';
  return 'bg-red-100';
}

function getAnomalyTextColor(anomaly) {
  return anomaly >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold';
}

function getInsightSummary() {
  if (!props.data) return '';
  
  const { averageAnomaly, trend } = props.data;
  const countryName = props.country.charAt(0).toUpperCase() + props.country.slice(1);
  
  if (averageAnomaly <= -10) {
    return `${countryName} is experiencing severe groundwater depletion. This may lead to water scarcity, affecting agriculture and drinking water supplies. Immediate conservation measures and water management strategies are recommended.`;
  } else if (averageAnomaly <= -5) {
    return `${countryName} is showing significant groundwater decline. This trend could impact water availability for agriculture and domestic use in the coming months. Water conservation measures should be considered.`;
  } else if (averageAnomaly < 0) {
    return `${countryName} is experiencing a mild decrease in groundwater levels. While not critical, continued monitoring is recommended, especially in regions showing larger declines.`;
  } else if (averageAnomaly < 5) {
    return `${countryName} is maintaining stable to slightly positive groundwater levels. This indicates good water resource management or favorable precipitation patterns.`;
  } else {
    return `${countryName} is showing healthy groundwater recharge. This positive trend suggests good water resource availability for agriculture, industry, and domestic use.`;
  }
}

function downloadData() {
  if (!props.data) return;
  
  // Create CSV content
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Region,Groundwater Anomaly (cm)\n";
  
  // Add country average
  csvContent += `${props.country.toUpperCase()} AVERAGE,${props.data.averageAnomaly}\n`;
  
  // Add regions
  if (props.data.regions) {
    props.data.regions.forEach(region => {
      csvContent += `${region.name},${region.anomaly}\n`;
    });
  }
  
  // Create download link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${props.country}_groundwater_data.csv`);
  document.body.appendChild(link);
  
  // Trigger download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
}
</script>
