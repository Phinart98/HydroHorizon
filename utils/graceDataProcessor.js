/**
 * GRACE/GRACE-FO Data Processor
 * 
 * This utility processes data from the GRACE and GRACE-FO satellite missions
 * to extract groundwater storage anomalies.
 */

import { getFallbackBoundary } from './geoData';

/**
 * Process GRACE/GRACE-FO data for a specific country
 * @param {string} country - Country name (ghana, kenya, india)
 * @param {Date} date - Date to retrieve data for (defaults to latest available)
 * @returns {Promise<Object>} Processed data
 */
export async function processGraceData(country, date = null) {
  try {
    // For the hackathon, we'll use mock data from JSON files
    // instead of fetching from the NASA API
    const response = await fetch(`/data/${country.toLowerCase()}_groundwater.json`);
    
    if (!response.ok) {
      throw new Error(`Failed to load data for ${country}`);
    }
    
    const allData = await response.json();
    
    // Find the appropriate data point based on date
    let dataPoint;
    
    if (date) {
      // If a specific date is requested, find the closest one
      const targetDate = date instanceof Date ? date : new Date(date);
      dataPoint = findNearestDateData(allData, targetDate);
    } else {
      // Default to the most recent data
      dataPoint = allData[allData.length - 1];
    }
    
    if (!dataPoint) {
      throw new Error(`No data available for ${country}`);
    }
    
    // Process the data for visualization
    return extractCountryData(dataPoint, country);
  } catch (error) {
    console.error('Error processing GRACE data:', error);
    throw new Error(`Failed to process GRACE data: ${error.message}`);
  }
}

/**
 * Find the data point closest to the target date
 * @param {Array} data - Array of data points
 * @param {Date} targetDate - Target date
 * @returns {Object} Data point closest to the target date
 */
function findNearestDateData(data, targetDate) {
  if (!data || data.length === 0) return null;
  
  let closestData = data[0];
  let minDiff = Math.abs(new Date(closestData.date) - targetDate);
  
  for (const item of data) {
    const diff = Math.abs(new Date(item.date) - targetDate);
    if (diff < minDiff) {
      minDiff = diff;
      closestData = item;
    }
  }
  
  return closestData;
}

/**
 * Extract data for a specific country from a data point
 * @param {Object} dataPoint - Data point
 * @param {string} country - Country name
 * @returns {Object} Extracted country data
 */
function extractCountryData(dataPoint, country) {
  try {
    // Extract grid data
    const { lats, lons, values } = dataPoint.raw_data;
    
    // Get country boundary for filtering
    const countryBoundary = getFallbackBoundary(country);
    
    if (!countryBoundary) {
      throw new Error(`Boundary not found for country: ${country}`);
    }
    
    // Generate points for the map
    const points = [];
    const allValues = [];
    
    for (let i = 0; i < lats.length; i++) {
      for (let j = 0; j < lons.length; j++) {
        const lat = lats[i];
        const lon = lons[j];
        
        // Check if point is within country boundary
        if (isPointInCountry(lat, lon, countryBoundary)) {
          // Convert value from meters to centimeters
          const value = values[i][j] * 100;
          
          if (!isNaN(value)) {
            points.push({
              lat,
              lng: lon,
              value,
              name: getNearestLocationName(lat, lon, country)
            });
            
            allValues.push(value);
          }
        }
      }
    }
    
    // Calculate average anomaly (in cm)
    const averageAnomaly = allValues.length > 0 
      ? allValues.reduce((sum, val) => sum + val, 0) / allValues.length 
      : 0;
    
    // Extract regional data
    const regions = extractRegionalData(points, country);
    
    // Determine trend
    const trend = classifyTrend(averageAnomaly);
    
    return {
      date: dataPoint.date,
      averageAnomaly,
      trend,
      regions,
      points
    };
  } catch (error) {
    console.error('Error extracting country data:', error);
    throw new Error(`Failed to extract country data: ${error.message}`);
  }
}

/**
 * Check if a point is within a country's boundary
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {Object} boundary - GeoJSON boundary
 * @returns {boolean} True if point is in country
 */
function isPointInCountry(lat, lon, boundary) {
  // Simple point-in-polygon algorithm
  const coordinates = boundary.geometry.coordinates[0];
  let inside = false;
  
  for (let i = 0, j = coordinates.length - 1; i < coordinates.length; j = i++) {
    const xi = coordinates[i][0], yi = coordinates[i][1];
    const xj = coordinates[j][0], yj = coordinates[j][1];
    
    const intersect = ((yi > lat) !== (yj > lat)) &&
        (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  
  return inside;
}

/**
 * Get the nearest named location to a point
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} country - Country name
 * @returns {string} Location name
 */
function getNearestLocationName(lat, lon, country) {
  // For the hackathon, we'll use a simplified approach with major cities
  const cities = {
    ghana: [
      { name: 'Accra', lat: 5.6037, lon: -0.1870 },
      { name: 'Kumasi', lat: 6.6885, lon: -1.6244 },
      { name: 'Tamale', lat: 9.4075, lon: -0.8533 },
      { name: 'Cape Coast', lat: 5.1053, lon: -1.2466 },
      { name: 'Sekondi-Takoradi', lat: 4.9348, lon: -1.7041 }
    ],
    kenya: [
      { name: 'Nairobi', lat: -1.2921, lon: 36.8219 },
      { name: 'Mombasa', lat: -4.0435, lon: 39.6682 },
      { name: 'Kisumu', lat: -0.1022, lon: 34.7617 },
      { name: 'Nakuru', lat: -0.3031, lon: 36.0800 },
      { name: 'Eldoret', lat: 0.5143, lon: 35.2698 }
    ],
    india: [
      { name: 'New Delhi', lat: 28.6139, lon: 77.2090 },
      { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
      { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
      { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
      { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
      { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
      { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714 },
      { name: 'Pune', lat: 18.5204, lon: 73.8567 },
      { name: 'Jaipur', lat: 26.9124, lon: 75.7873 },
      { name: 'Lucknow', lat: 26.8467, lon: 80.9462 }
    ]
  };
  
  const countryCities = cities[country.toLowerCase()] || [];
  
  if (countryCities.length === 0) {
    return `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
  }
  
  // Find the nearest city
  let nearestCity = countryCities[0];
  let minDistance = calculateDistance(lat, lon, nearestCity.lat, nearestCity.lon);
  
  for (const city of countryCities) {
    const distance = calculateDistance(lat, lon, city.lat, city.lon);
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  }
  
  // If the point is very far from any city, just use coordinates
  if (minDistance > 200) { // 200km threshold
    return `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
  }
  
  // Add the distance information
  const distanceKm = Math.round(minDistance);
  return `${distanceKm}km from ${nearestCity.name}`;
}

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Extract regional data from country points
 * @param {Array} points - Data points
 * @param {string} country - Country name
 * @returns {Array} Regional data
 */
function extractRegionalData(points, country) {
  // Define regions for each country
  const countryRegions = {
    ghana: [
      { name: 'Northern Ghana', filter: p => p.lat > 8.0 },
      { name: 'Central Ghana', filter: p => p.lat > 6.0 && p.lat <= 8.0 },
      { name: 'Southern Ghana', filter: p => p.lat <= 6.0 },
      { name: 'Western Ghana', filter: p => p.lng < -1.0 },
      { name: 'Eastern Ghana', filter: p => p.lng >= -1.0 }
    ],
    kenya: [
      { name: 'Northern Kenya', filter: p => p.lat > 2.0 },
      { name: 'Central Kenya', filter: p => p.lat > -1.0 && p.lat <= 2.0 },
      { name: 'Southern Kenya', filter: p => p.lat <= -1.0 },
      { name: 'Western Kenya', filter: p => p.lng < 37.0 },
      { name: 'Eastern Kenya', filter: p => p.lng >= 37.0 }
    ],
    india: [
      { name: 'Northern India', filter: p => p.lat > 28.0 },
      { name: 'Central India', filter: p => p.lat > 20.0 && p.lat <= 28.0 },
      { name: 'Southern India', filter: p => p.lat <= 20.0 },
      { name: 'Western India', filter: p => p.lng < 78.0 },
      { name: 'Eastern India', filter: p => p.lng >= 78.0 }
    ]
  };
  
  const regions = [];
  const regionDefs = countryRegions[country.toLowerCase()] || [];
  
  // Calculate average anomaly for each region
  regionDefs.forEach(region => {
    const regionPoints = points.filter(region.filter);
    if (regionPoints.length > 0) {
      const regionAvg = regionPoints.reduce((sum, p) => sum + p.value, 0) / regionPoints.length;
      regions.push({
        name: region.name,
        anomaly: Math.round(regionAvg * 10) / 10 // Round to 1 decimal place
      });
    }
  });
  
  return regions;
}

/**
 * Classify trend based on anomaly value
 * @param {number} anomaly - Average anomaly value
 * @returns {string} Trend classification
 */
function classifyTrend(anomaly) {
  if (anomaly > 10) return 'Rapidly Increasing';
  if (anomaly > 5) return 'Increasing';
  if (anomaly > 1) return 'Slightly Increasing';
  if (anomaly >= -1 && anomaly <= 1) return 'Stable';
  if (anomaly >= -5) return 'Slightly Decreasing';
  if (anomaly >= -10) return 'Decreasing';
  return 'Rapidly Decreasing';
}
