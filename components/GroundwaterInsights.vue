<template>
    <div class="bg-white rounded-lg p-5 shadow-md h-full relative">
      <h2 class="text-xl font-bold mb-4">Groundwater Insights</h2>
      
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="flex flex-col items-center">
          <i class="bi bi-arrow-repeat text-2xl animate-spin text-blue-600"></i>
          <p class="mt-2 text-gray-700">Loading insights...</p>
        </div>
      </div>
      
      <div v-else-if="!data" class="text-center py-10">
        <i class="bi bi-exclamation-circle text-3xl text-gray-400 mb-2"></i>
        <p class="text-gray-600">No data available for {{ formatCountryName(country) }}</p>
      </div>
      
      <div v-else>
        <div class="mb-6">
          <div class="font-semibold mb-1">Average Groundwater Anomaly</div>
          <div class="text-3xl font-bold mb-1" :class="getAnomalyColorClass(data.mean)">
            {{ formatValue(data.mean) }} cm
          </div>
          <div class="text-sm text-gray-700">
            Compared to long-term average
          </div>
        </div>
        
        <div class="p-4 rounded-lg mb-6" :class="getAnomalyBgClass(data.mean)">
          <div class="flex items-center mb-2">
            <div class="w-3 h-3 rounded-full mr-2" :class="getAnomalyIndicatorClass(data.mean)"></div>
            <div class="font-semibold">Current Status</div>
          </div>
          <div class="text-gray-700 text-sm">
            {{ getAnomalyDescription(data.mean) }}
          </div>
        </div>
        
        <div class="bg-gray-100 p-4 rounded-lg" :class="getTrendBgClass(trend)">
          <div class="font-semibold mb-1 flex items-center justify-between">
            <span>12-Month Trend</span>
            <button @click="showTrendModal = true" class="text-gray-500 hover:text-blue-600">
              <i class="bi bi-question-circle"></i>
            </button>
          </div>
          <div class="text-2xl font-bold" :class="getTrendColorClass(trend)">
            {{ formatTrend(trend) }}
            <i :class="getTrendIconClass(trend)"></i>
          </div>
          <div class="text-sm text-gray-700 mt-1">
            {{ getTrendDescription(trend) }}
          </div>
        </div>
        
        <div class="mt-6" v-if="getRegionalData().length > 0">
          <div class="font-semibold mb-2">Regional Breakdown</div>
          <div class="space-y-2">
            <div 
              v-for="(region, index) in getRegionalData()" 
              :key="index"
              class="p-3 rounded-lg bg-gray-50 flex justify-between items-center"
            >
              <span>{{ region.name }}</span>
              <span class="font-semibold" :class="getAnomalyColorClass(region.value)">
                {{ formatValue(region.value) }} cm
              </span>
            </div>
          </div>
        </div>
        
        <div class="mt-6 pt-4 border-t border-gray-200">
          <button 
            @click="downloadData" 
            class="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            <i class="bi bi-download mr-2"></i>
            Download Data
          </button>
        </div>
      </div>
      
      <!-- Trend Classification Modal - Fixed positioning -->
      <div v-if="showTrendModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
        <div class="bg-white rounded-lg max-w-lg w-full p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold">Trend Classification Methodology</h3>
            <button @click="showTrendModal = false" class="text-gray-500 hover:text-gray-700">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          
          <div class="mb-4">
            <p class="mb-3">Trends are calculated using a simple linear regression on the last 12 months of groundwater data. The classification is based on the slope of this regression line:</p>
            
            <div class="bg-green-50 p-3 rounded-lg mb-2 border-l-4 border-green-500">
              <div class="font-semibold text-green-700">Increasing</div>
              <p class="text-sm text-gray-700">Slope > 0.001 m/month</p>
              <p class="text-sm text-gray-700">Groundwater levels are showing a consistent upward trend.</p>
            </div>
            
            <div class="bg-yellow-50 p-3 rounded-lg mb-2 border-l-4 border-yellow-500">
              <div class="font-semibold text-yellow-700">Stable</div>
              <p class="text-sm text-gray-700">-0.001 ≤ Slope ≤ 0.001 m/month</p>
              <p class="text-sm text-gray-700">Groundwater levels are relatively constant with minor fluctuations.</p>
            </div>
            
            <div class="bg-red-50 p-3 rounded-lg mb-2 border-l-4 border-red-500">
              <div class="font-semibold text-red-700">Decreasing</div>
              <p class="text-sm text-gray-700">Slope < -0.001 m/month</p>
              <p class="text-sm text-gray-700">Groundwater levels are showing a consistent downward trend.</p>
            </div>
          </div>
          
          <div class="text-sm text-gray-600 mb-4">
            <p>This classification helps identify long-term patterns in groundwater storage that may not be immediately apparent from monthly data.</p>
          </div>
          
          <div class="flex justify-end">
            <button 
              @click="showTrendModal = false" 
              class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  
  <script setup>
  import { ref } from 'vue';
  
  const props = defineProps({
    country: {
      type: String,
      required: true
    },
    data: {
      type: Object,
      default: null
    },
    trend: {
      type: String,
      default: 'stable'
    },
    loading: {
      type: Boolean,
      default: false
    }
  });
  
  const showTrendModal = ref(false);
  
  function formatCountryName(country) {
    const names = {
      'ghana': 'Ghana',
      'kenya': 'Kenya',
      'india': 'India'
    };
    return names[country] || country;
  }
  
  function formatDate(dateStr) {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  function formatValue(value) {
    if (value === null || value === undefined) return 'N/A';
    // Add plus sign for positive values
    const formattedValue = (value * 100).toFixed(1);
    return value > 0 ? `+${formattedValue}` : formattedValue;
  }
  
  function getAnomalyColorClass(value) {
    if (!value) return 'text-gray-600';
    if (value > 0.1) return 'text-green-700';
    if (value > 0.05) return 'text-green-600';
    if (value > -0.05 && value < 0.05) return 'text-yellow-600';
    if (value > -0.1) return 'text-red-600';
    return 'text-red-700';
  }
  
  function getAnomalyBgClass(value) {
    if (!value) return '';
    if (value > 0.1) return 'bg-green-50 border-l-4 border-green-500';
    if (value > 0.05) return 'bg-green-50';
    if (value > -0.05 && value < 0.05) return 'bg-yellow-50';
    if (value > -0.1) return 'bg-red-50';
    return 'bg-red-50 border-l-4 border-red-500';
  }
  
  function getAnomalyIndicatorClass(value) {
    if (!value) return 'bg-gray-400';
    if (value > 0.1) return 'bg-green-700';
    if (value > 0.05) return 'bg-green-500';
    if (value > -0.05 && value < 0.05) return 'bg-yellow-500';
    if (value > -0.1) return 'bg-red-500';
    return 'bg-red-700';
  }
  
  function getAnomalyDescription(value) {
    if (!value) return 'No data available';
    if (value > 0.1) return 'Significantly higher than normal - potential flooding risk';
    if (value > 0.05) return 'Higher than normal groundwater levels';
    if (value > -0.05 && value < 0.05) return 'Near normal groundwater levels';
    if (value > -0.1) return 'Lower than normal groundwater levels';
    return 'Significantly lower than normal - potential drought conditions';
  }
  
  function getTrendColorClass(trend) {
    if (trend === 'increasing') return 'text-green-600';
    if (trend === 'decreasing') return 'text-red-600';
    return 'text-yellow-600';
  }
  
  function getTrendBgClass(trend) {
    if (trend === 'increasing') return 'bg-green-50';
    if (trend === 'decreasing') return 'bg-red-50';
    return 'bg-yellow-50';
  }
  
  function getTrendIconClass(trend) {
    if (trend === 'increasing') return 'bi bi-arrow-up';
    if (trend === 'decreasing') return 'bi bi-arrow-down';
    return 'bi bi-arrow-right';
  }
  
  function formatTrend(trend) {
    return trend.charAt(0).toUpperCase() + trend.slice(1);
  }
  
  function getTrendDescription(trend) {
    if (trend === 'increasing') {
      return 'Groundwater levels have been increasing over the past year, which may indicate improved recharge or reduced extraction.';
    }
    if (trend === 'decreasing') {
      return 'Groundwater levels have been decreasing over the past year, which may indicate reduced recharge or increased extraction.';
    }
    return 'Groundwater levels have been stable over the past year, indicating a balance between recharge and extraction.';
  }
  
  function getRegionalData() {
    // Create simplified regional breakdown based on the raw data
    if (!props.data || !props.data.raw_data) return [];
    
    const { lats, lons, values } = props.data.raw_data;
    const regions = [];
    
    // Divide the country into regions (North, Central, South)
    const latSorted = [...lats].sort((a, b) => a - b);
    const latThresholds = [
      latSorted[0], // min
      latSorted[Math.floor(latSorted.length / 3)], // 1/3
      latSorted[Math.floor(2 * latSorted.length / 3)], // 2/3
      latSorted[latSorted.length - 1] // max
    ];
    
    // Calculate regional averages
    const regionNames = ['Southern', 'Central', 'Northern'];
    for (let r = 0; r < 3; r++) {
      let sum = 0;
      let count = 0;
      
      for (let i = 0; i < lats.length; i++) {
        if (lats[i] >= latThresholds[r] && lats[i] <= latThresholds[r+1]) {
          for (let j = 0; j < lons.length; j++) {
            if (values[i][j] !== null) {
              sum += values[i][j];
              count++;
            }
          }
        }
      }
      
      if (count > 0) {
        regions.push({
          name: `${regionNames[r]} ${formatCountryName(props.country)}`,
          value: sum / count
        });
      }
    }
    
    return regions;
  }
  
  function downloadData() {
    if (!props.data || !props.data.raw_data) return;
    
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Latitude,Longitude,Groundwater Anomaly (m)\n";
    
    const { lats, lons, values } = props.data.raw_data;
    
    for (let i = 0; i < lats.length; i++) {
      for (let j = 0; j < lons.length; j++) {
        if (values[i][j] !== null) {
          csvContent += `${lats[i]},${lons[j]},${values[i][j]}\n`;
        }
      }
    }
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${props.country}_groundwater_data_${props.data.date}.csv`);
    document.body.appendChild(link);
    
    // Trigger download and clean up
    link.click();
    document.body.removeChild(link);
  }
  </script>
  