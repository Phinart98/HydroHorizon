<template>
  <div class="container mx-auto px-4 py-8">
    <header class="mb-8 text-center">
      <h1 class="text-3xl font-bold text-blue-800 mb-2">HydroHorizon</h1>
      <p class="text-gray-600">Groundwater Monitoring & Insights Platform</p>
    </header>
    
    <div class="mb-6">
      <label for="country-select" class="block text-sm font-medium text-gray-700 mb-2">Select a Country:</label>
      <select 
        id="country-select"
        v-model="selectedCountry"
        class="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
        @change="loadCountryData"
      >
        <option value="">-- Select a Country --</option>
        <!-- Removed Ghana from options -->
        <option value="kenya">Kenya</option>
        <option value="india">India</option>
      </select>
    </div>
    
    <div v-if="selectedCountry" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <GroundwaterMap 
          :country="selectedCountry" 
          :data="currentData"
          :loading="loading"
        />
      </div>
      <div>
        <GroundwaterInsights 
          :country="selectedCountry" 
          :data="currentData"
          :trend="trend"
          :loading="loading"
        />
      </div>
    </div>
    
    <div v-else class="bg-white rounded-lg shadow-md p-8 text-center">
      <!-- Removed the image that was causing the error -->
      <h2 class="text-2xl font-bold text-gray-800 mb-2">Welcome to HydroHorizon</h2>
      <p class="text-gray-600 mb-6">Select a country above to view groundwater insights and monitoring data.</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <div class="bg-blue-50 p-4 rounded-lg">
          <h3 class="font-semibold text-blue-800 mb-2">Real-time Monitoring</h3>
          <p class="text-sm text-gray-700">Access up-to-date groundwater data from GRACE satellites</p>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <h3 class="font-semibold text-green-800 mb-2">Visual Insights</h3>
          <p class="text-sm text-gray-700">Understand groundwater trends through intuitive visualizations</p>
        </div>
      </div>
    </div>
    
    <footer class="mt-12 text-center text-gray-500 text-sm">
      <p>Data source: NASA GRACE and GRACE-FO Missions</p>
      <p class="mt-1">© 2025 Visual Wizards | Developed for the Hackathon for the People's Data organized by Equitech Futures</p>
      <p class="mt-1">Rishi | Laura | Diksha | Philip</p>
    </footer>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';

const selectedCountry = ref('');
const countryData = ref({});
const currentData = ref(null);
const loading = ref(false);
const trend = ref('stable');

// Load data for a specific country
const loadCountryData = async () => {
  if (!selectedCountry.value) return;
  
  loading.value = true;
  currentData.value = null;
  
  try {
    // Check if we already have data for this country
    if (!countryData.value[selectedCountry.value]) {
      // Fetch data from the JSON file
      const response = await fetch(`/data/${selectedCountry.value}_groundwater.json`);
      if (!response.ok) {
        throw new Error(`Failed to load data for ${selectedCountry.value}`);
      }
      const data = await response.json();
      countryData.value[selectedCountry.value] = data;
    }
    
    // Get the most recent data point
    const countryDataArray = countryData.value[selectedCountry.value];
    if (countryDataArray && countryDataArray.length > 0) {
      // Sort by date (newest first)
      countryDataArray.sort((a, b) => new Date(b.date) - new Date(a.date));
      currentData.value = countryDataArray[0];
      
      // Calculate trend based on last 12 months of data
      calculateTrend(countryDataArray);
    }
  } catch (error) {
    console.error('Error loading country data:', error);
  } finally {
    loading.value = false;
  }
};

// Calculate trend based on last 12 months of data
const calculateTrend = (data) => {
  if (!data || data.length < 2) {
    trend.value = 'stable';
    return;
  }
  
  // Get up to 12 most recent months
  const recentData = data.slice(0, Math.min(12, data.length));
  
  // Simple linear regression to determine trend
  const n = recentData.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  
  for (let i = 0; i < n; i++) {
    const x = i; // Time index
    const y = recentData[n - 1 - i].mean; // Mean value (most recent first)
    
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  
  // Classify trend based on slope
  if (slope > 0.001) {
    trend.value = 'increasing';
  } else if (slope < -0.001) {
    trend.value = 'decreasing';
  } else {
    trend.value = 'stable';
  }
};

onMounted(() => {
  // If URL has a country parameter, select it
  const urlParams = new URLSearchParams(window.location.search);
  const country = urlParams.get('country');
  if (country && ['kenya', 'india'].includes(country)) {
    selectedCountry.value = country;
    loadCountryData();
  }
});
</script>
