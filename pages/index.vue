<template>
  <div class="min-h-screen bg-gray-100 overflow-x-hidden">
    <header class="bg-blue-600 text-white p-4 shadow-md">
      <div class="container mx-auto px-2">
        <h1 class="text-2xl font-bold">HydroHorizon</h1>
        <p class="text-sm opacity-80">Groundwater Insights for Climate Resilience</p>
      </div>
    </header>
    
    <main class="container mx-auto px-2">
      <!-- Country Selection -->
      <div class="mb-6 bg-white p-4 rounded-lg shadow-md">
        <label for="country-select" class="block text-sm font-medium text-gray-700 mb-2">
          Select a Country:
        </label>
        <div class="flex items-center space-x-4">
          <select 
            id="country-select" 
            v-model="selectedCountry"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            :disabled="loading"
          >
            <option v-for="country in availableCountries" :key="country.code" :value="country.code">
              {{ country.name }}
            </option>
          </select>
          
          <button 
            @click="refreshData" 
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            :disabled="loading"
          >
            <span v-if="loading">Loading...</span>
            <span v-else>Refresh</span>
          </button>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="ml-3 text-gray-600">Loading groundwater data...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error loading data</h3>
            <p class="mt-2 text-sm text-red-700">{{ error }}</p>
            <button 
              @click="refreshData" 
              class="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
      
      <!-- Data Display -->
      <div v-else-if="countryData" class="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        <!-- Map Section (2/3 width on large screens) -->
        <div class="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden h-[500px]">
          <GroundwaterMap :country="selectedCountry" :data="countryData" />
        </div>
        
        <!-- Insights Panel (1/3 width on large screens) -->
        <div class="lg:col-span-1">
          <InsightsPanel :country="selectedCountry" :data="countryData" />
        </div>
      </div>
      
      <!-- No Data State -->
      <div v-else class="bg-white p-8 rounded-lg shadow-md text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No data available</h3>
        <p class="mt-1 text-sm text-gray-500">
          Select a country to view groundwater insights.
        </p>
      </div>
      
      <!-- About Section -->
      <div class="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-lg font-semibold mb-3">About HydroHorizon</h2>
        <p class="text-gray-700 mb-4">
          HydroHorizon visualizes groundwater storage anomalies derived from NASA's GRACE and GRACE-FO satellite missions.
          The data shows changes in groundwater levels compared to the long-term average, measured in centimeters of
          equivalent water thickness.
        </p>
        <div class="bg-blue-50 p-4 rounded-md">
          <h3 class="font-medium text-blue-800 mb-2">Data Sources</h3>
          <ul class="list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>
              <strong>GRACE (2002-2017):</strong> Gravity Recovery and Climate Experiment
            </li>
            <li>
              <strong>GRACE-FO (2018-Present):</strong> GRACE Follow-On mission
            </li>
            <li>
              <strong>Dataset IDs:</strong> TELLUS_GRAC_L3_JPL_RL06_LND_v04 and TELLUS_GRFO_L3_JPL_RL06.3_LND_v04
            </li>
            <li>
              <strong>Provider:</strong> NASA JPL / PO.DAAC
            </li>
          </ul>
        </div>
      </div>
    </main>
    
    <footer class="bg-gray-800 text-white p-4 mt-8">
      <div class="container mx-auto text-center text-sm px-2">
        <p>
          HydroHorizon - Developed for the Hackathon for the People's Data 2025
        </p>
        <p class="mt-1 text-gray-400">
          Data provided by NASA's GRACE and GRACE-FO missions
        </p>
      </div>
    </footer>
  </div>
</template>


<script setup>
import { ref, onMounted, watch } from 'vue';
import { processGraceData } from '~/utils/graceDataProcessor';

// State
const selectedCountry = ref('ghana');
const countryData = ref(null);
const loading = ref(false);
const error = ref(null);

// Available countries
const availableCountries = ref([
  { code: 'ghana', name: 'Ghana' },
  { code: 'kenya', name: 'Kenya' },
  { code: 'india', name: 'India' }
]);

// Fetch data when country changes
watch(selectedCountry, () => {
  fetchData();
});

// Initial data fetch
onMounted(() => {
  fetchData();
});

// Fetch data function
async function fetchData() {
  if (!selectedCountry.value) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    // Create mock data for testing
    const mockData = createMockData(selectedCountry.value);
    countryData.value = mockData;
    
    // In a real implementation, you would use:
    // const data = await processGraceData(selectedCountry.value);
    // countryData.value = data;
  } catch (e) {
    console.error('Error fetching data:', e);
    error.value = e.message || 'Failed to load groundwater data';
    countryData.value = null;
  } finally {
    loading.value = false;
  }
}

// Refresh data manually
function refreshData() {
  fetchData();
}

// Create mock data for testing
function createMockData(country) {
  const date = new Date().toISOString();
  const averageAnomaly = Math.random() * 20 - 10; // Random value between -10 and 10
  
  // Generate random points
  const points = [];
  const numPoints = 20;
  
  let centerLat, centerLng;
  
  switch(country) {
    case 'ghana':
      centerLat = 7.9465;
      centerLng = -1.0232;
      break;
    case 'kenya':
      centerLat = 0.0236;
      centerLng = 37.9062;
      break;
    case 'india':
      centerLat = 20.5937;
      centerLng = 78.9629;
      break;
    default:
      centerLat = 0;
      centerLng = 0;
  }
  
  for (let i = 0; i < numPoints; i++) {
    // Create points in a grid pattern around the center
    const latOffset = (Math.floor(i / 5) - 2) * 1.5;
    const lngOffset = (i % 5 - 2) * 1.5;
    
    const lat = centerLat + latOffset;
    const lng = centerLng + lngOffset;
    
    // Random value with some correlation to the average
    const value = averageAnomaly + (Math.random() * 10 - 5);
    
    points.push({
      lat,
      lng,
      value,
      name: `Location ${i+1}`
    });
  }
  
  // Generate regions
  const regions = [
    { name: 'Northern Region', anomaly: averageAnomaly + (Math.random() * 4 - 2) },
    { name: 'Southern Region', anomaly: averageAnomaly + (Math.random() * 4 - 2) },
    { name: 'Eastern Region', anomaly: averageAnomaly + (Math.random() * 4 - 2) },
    { name: 'Western Region', anomaly: averageAnomaly + (Math.random() * 4 - 2) },
    { name: 'Central Region', anomaly: averageAnomaly + (Math.random() * 4 - 2) }
  ];
  
  // Determine trend
  let trend;
  if (averageAnomaly > 10) trend = 'Rapidly Increasing';
  else if (averageAnomaly > 5) trend = 'Increasing';
  else if (averageAnomaly > 1) trend = 'Slightly Increasing';
  else if (averageAnomaly >= -1) trend = 'Stable';
  else if (averageAnomaly >= -5) trend = 'Slightly Decreasing';
  else if (averageAnomaly >= -10) trend = 'Decreasing';
  else trend = 'Rapidly Decreasing';
  
  return {
    date,
    averageAnomaly,
    trend,
    regions,
    points
  };
}
</script>
