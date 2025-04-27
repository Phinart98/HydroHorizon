/**
 * Data service for HydroHorizon
 * 
 * This file provides mock data for the application.
 * In a production environment, this would be replaced with
 * actual API calls to fetch real data from a backend service.
 */

// Mock data for each country
const mockData = {
    ghana: {
      date: '2025-03-15',
      averageAnomaly: -3.2,
      trend: 'Slightly Decreasing',
      regions: [
        { name: 'Northern Region', anomaly: -8.7 },
        { name: 'Upper East', anomaly: -6.3 },
        { name: 'Volta Region', anomaly: -4.1 },
        { name: 'Greater Accra', anomaly: -2.8 },
        { name: 'Western Region', anomaly: 1.4 }
      ],
      points: [
        { name: 'Accra', lat: 5.6037, lng: -0.1870, value: -2.8 },
        { name: 'Kumasi', lat: 6.6885, lng: -1.6244, value: -1.5 },
        { name: 'Tamale', lat: 9.4075, lng: -0.8533, value: -8.7 },
        { name: 'Sekondi-Takoradi', lat: 4.9348, lng: -1.7041, value: 1.4 },
        { name: 'Sunyani', lat: 7.3349, lng: -2.3268, value: -0.9 },
        { name: 'Cape Coast', lat: 5.1053, lng: -1.2466, value: 0.3 },
        { name: 'Koforidua', lat: 6.0946, lng: -0.2575, value: -3.2 },
        { name: 'Wa', lat: 10.0601, lng: -2.5099, value: -5.6 },
        { name: 'Ho', lat: 6.6010, lng: 0.4712, value: -4.1 },
        { name: 'Bolgatanga', lat: 10.7867, lng: -0.8486, value: -6.3 }
      ]
    },
    
    kenya: {
      date: '2025-03-15',
      averageAnomaly: -7.8,
      trend: 'Decreasing',
      regions: [
        { name: 'Northern Kenya', anomaly: -12.4 },
        { name: 'Eastern Kenya', anomaly: -9.6 },
        { name: 'Rift Valley', anomaly: -7.2 },
        { name: 'Central Kenya', anomaly: -5.3 },
        { name: 'Western Kenya', anomaly: -3.1 }
      ],
      points: [
        { name: 'Nairobi', lat: -1.2921, lng: 36.8219, value: -5.3 },
        { name: 'Mombasa', lat: -4.0435, lng: 39.6682, value: -6.8 },
        { name: 'Kisumu', lat: -0.1022, lng: 34.7617, value: -3.1 },
        { name: 'Nakuru', lat: -0.3031, lng: 36.0800, value: -7.2 },
        { name: 'Eldoret', lat: 0.5143, lng: 35.2698, value: -4.5 },
        { name: 'Garissa', lat: -0.4536, lng: 39.6401, value: -12.4 },
        { name: 'Nyeri', lat: -0.4246, lng: 36.9517, value: -4.9 },
        { name: 'Machakos', lat: -1.5176, lng: 37.2634, value: -9.6 },
        { name: 'Malindi', lat: -3.2138, lng: 40.1169, value: -8.3 },
        { name: 'Kitale', lat: 1.0185, lng: 35.0020, value: -2.7 }
      ]
    },
    
    india: {
      date: '2025-03-15',
      averageAnomaly: -9.4,
      trend: 'Rapidly Decreasing',
      regions: [
        { name: 'Northern Plains', anomaly: -14.2 },
        { name: 'Western India', anomaly: -11.7 },
        { name: 'Central India', anomaly: -8.9 },
        { name: 'Southern Peninsula', anomaly: -6.3 },
        { name: 'Eastern India', anomaly: -4.8 }
      ],
      points: [
        { name: 'Delhi', lat: 28.6139, lng: 77.2090, value: -14.2 },
        { name: 'Mumbai', lat: 19.0760, lng: 72.8777, value: -11.7 },
        { name: 'Bangalore', lat: 12.9716, lng: 77.5946, value: -5.2 },
        { name: 'Chennai', lat: 13.0827, lng: 80.2707, value: -6.3 },
        { name: 'Kolkata', lat: 22.5726, lng: 88.3639, value: -4.8 },
        { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, value: -7.6 },
        { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, value: -10.3 },
        { name: 'Pune', lat: 18.5204, lng: 73.8567, value: -9.8 },
        { name: 'Jaipur', lat: 26.9124, lng: 75.7873, value: -12.5 },
        { name: 'Lucknow', lat: 26.8467, lng: 80.9462, value: -13.1 },
        { name: 'Bhopal', lat: 23.2599, lng: 77.4126, value: -8.9 },
        { name: 'Patna', lat: 25.5941, lng: 85.1376, value: -7.2 },
        { name: 'Kochi', lat: 9.9312, lng: 76.2673, value: -3.6 },
        { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185, value: -5.9 },
        { name: 'Surat', lat: 21.1702, lng: 72.8311, value: -11.2 }
      ]
    }
  };
  
  /**
   * Fetch data for a specific country
   * @param {string} country - Country code (ghana, kenya, india)
   * @returns {Object} Country data
   */
  export function fetchCountryData(country) {
    // In a real application, this would make an API call
    // For now, we return mock data
    return mockData[country.toLowerCase()] || null;
  }
  
  /**
   * Get all available countries
   * @returns {Array} List of country codes
   */
  export function getAvailableCountries() {
    return Object.keys(mockData);
  }
  
  /**
   * Get the latest data date
   * @returns {string} Date string
   */
  export function getLatestDataDate() {
    return mockData.ghana.date; // All mock data has the same date
  }
  