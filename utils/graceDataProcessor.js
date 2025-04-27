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
    console.log(`Loading data for ${country}...`);
    
    // Load the processed data from the JSON file
    const response = await fetch(`/data/${country}_groundwater.json`);
    
    if (!response.ok) {
      console.error(`Failed to fetch data for ${country}: ${response.statusText}`);
      throw new Error(`Failed to fetch data for ${country}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Loaded ${data.length} data points for ${country}`);
    
    // If no data is available
    if (!data || data.length === 0) {
      throw new Error(`No data available for ${country}`);
    }
    
    // Find the latest data point or the one closest to the requested date
    let dataPoint;
    
    if (date) {
      // Find the data point closest to the requested date
      const targetDate = date.getTime();
      dataPoint = data.reduce((closest, current) => {
        const currentDate = new Date(current.date).getTime();
        const closestDate = new Date(closest.date).getTime();
        return Math.abs(currentDate - targetDate) < Math.abs(closestDate - targetDate) ? current : closest;
      }, data[0]);
    } else {
      // Use the most recent data point
      dataPoint = data[data.length - 1];
    }
    
    console.log(`Selected data point from ${dataPoint.date}`);
    console.log(`Mean value: ${dataPoint.mean}`);
    
    // Transform the data into the format expected by the UI
    const points = [];
    
    // Create points from the raw data
    if (dataPoint.raw_data) {
      const { lats, lons, values } = dataPoint.raw_data;
      
      console.log(`Raw data dimensions: ${lats.length} x ${lons.length}`);
      
      // Check if values is a 2D array with the expected dimensions
      if (Array.isArray(values) && values.length === lats.length) {
        for (let i = 0; i < lats.length; i++) {
          if (Array.isArray(values[i]) && values[i].length === lons.length) {
            for (let j = 0; j < lons.length; j++) {
              const value = values[i][j];
              
              // Skip null values (which were NaN in the original data)
              if (value !== null) {
                points.push({
                  lat: lats[i],
                  lng: lons[j],
                  value: value,
                  name: getNearestLocationName(lats[i], lons[j], country)
                });
              }
            }
          } else {
            console.warn(`Values array at index ${i} is not as expected`);
          }
        }
      } else {
        console.warn(`Values array is not as expected: ${typeof values}, length: ${values.length}`);
        
        // Alternative approach if the data structure is different
        // This assumes values is a flattened array
        if (Array.isArray(values) && values.length > 0) {
          for (let i = 0; i < Math.min(lats.length * lons.length, values.length); i++) {
            const latIndex = Math.floor(i / lons.length);
            const lonIndex = i % lons.length;
            
            if (latIndex < lats.length && lonIndex < lons.length) {
              const value = values[i];
              
              if (value !== null) {
                points.push({
                  lat: lats[latIndex],
                  lng: lons[lonIndex],
                  value: value,
                  name: getNearestLocationName(lats[latIndex], lons[lonIndex], country)
                });
              }
            }
          }
        }
      }
    }
    
    console.log(`Generated ${points.length} data points`);
    
    // Define regions based on actual administrative divisions
    const regions = getActualRegions(country, points);
    
    console.log(`Generated ${regions.length} regions`);
    
    return {
      date: dataPoint.date,
      averageAnomaly: dataPoint.mean,
      trend: classifyTrend(dataPoint.mean),
      regions: regions,
      points: points
    };
  } catch (error) {
    console.error('Error processing GRACE data:', error);
    throw new Error(`Failed to process GRACE data: ${error.message}`);
  }
}

/**
 * Get actual administrative regions for each country
 * @param {string} country - Country name
 * @param {Array} points - Data points
 * @returns {Array} Regional data
 */
function getActualRegions(country, points) {
  // Define actual administrative regions for each country
  const countryRegions = {
    ghana: [
      { name: 'Northern Region', bounds: { lat: [8.5, 10.5], lng: [-2.5, 0.5] } },
      { name: 'Upper East Region', bounds: { lat: [10.0, 11.2], lng: [-0.5, 1.5] } },
      { name: 'Upper West Region', bounds: { lat: [9.5, 11.0], lng: [-3.0, -1.5] } },
      { name: 'Savannah Region', bounds: { lat: [8.0, 9.5], lng: [-2.5, -0.5] } },
      { name: 'North East Region', bounds: { lat: [9.5, 10.5], lng: [-0.5, 0.5] } },
      { name: 'Bono Region', bounds: { lat: [7.0, 8.5], lng: [-3.0, -1.5] } },
      { name: 'Bono East Region', bounds: { lat: [7.0, 8.5], lng: [-1.5, -0.5] } },
      { name: 'Ahafo Region', bounds: { lat: [6.5, 7.5], lng: [-3.0, -2.0] } },
      { name: 'Ashanti Region', bounds: { lat: [6.0, 7.5], lng: [-2.5, -0.5] } },
      { name: 'Western Region', bounds: { lat: [4.5, 6.0], lng: [-3.5, -1.5] } },
      { name: 'Western North Region', bounds: { lat: [5.5, 7.0], lng: [-3.5, -2.5] } },
      { name: 'Central Region', bounds: { lat: [5.0, 6.5], lng: [-2.0, -0.5] } },
      { name: 'Eastern Region', bounds: { lat: [5.5, 7.0], lng: [-1.0, 0.5] } },
      { name: 'Greater Accra Region', bounds: { lat: [5.5, 6.0], lng: [-0.5, 0.5] } },
      { name: 'Volta Region', bounds: { lat: [5.5, 8.0], lng: [0.0, 1.0] } },
      { name: 'Oti Region', bounds: { lat: [7.0, 9.0], lng: [0.0, 0.5] } }
    ],
    kenya: [
      { name: 'Nairobi County', bounds: { lat: [-1.4, -1.1], lng: [36.7, 37.0] } },
      { name: 'Central Kenya', bounds: { lat: [-1.0, 1.0], lng: [36.5, 38.0] } },
      { name: 'Rift Valley', bounds: { lat: [-1.0, 4.0], lng: [34.5, 36.5] } },
      { name: 'Western Kenya', bounds: { lat: [-1.0, 1.0], lng: [34.0, 35.5] } },
      { name: 'Nyanza', bounds: { lat: [-1.0, 0.5], lng: [33.5, 35.0] } },
      { name: 'Eastern Kenya', bounds: { lat: [-2.0, 2.0], lng: [37.0, 39.0] } },
      { name: 'Coast', bounds: { lat: [-4.5, -1.5], lng: [38.5, 41.0] } },
      { name: 'North Eastern', bounds: { lat: [0.0, 4.0], lng: [38.0, 41.5] } }
    ],
    india: [
      { name: 'Northern India', bounds: { lat: [28.0, 35.0], lng: [72.0, 88.0] } },
      { name: 'Western India', bounds: { lat: [15.0, 28.0], lng: [68.0, 76.0] } },
      { name: 'Central India', bounds: { lat: [15.0, 28.0], lng: [76.0, 85.0] } },
      { name: 'Eastern India', bounds: { lat: [15.0, 28.0], lng: [85.0, 97.0] } },
      { name: 'Southern India', bounds: { lat: [8.0, 15.0], lng: [72.0, 85.0] } },
      { name: 'North Eastern India', bounds: { lat: [22.0, 28.0], lng: [88.0, 97.0] } }
    ]
  };
  
  const regions = [];
  const regionDefs = countryRegions[country.toLowerCase()] || [];
  
  // Calculate average anomaly for each region
  regionDefs.forEach(region => {
    const regionPoints = points.filter(p => 
      p.lat >= region.bounds.lat[0] && 
      p.lat <= region.bounds.lat[1] && 
      p.lng >= region.bounds.lng[0] && 
      p.lng <= region.bounds.lng[1]
    );
    
    if (regionPoints.length > 0) {
      const regionAvg = regionPoints.reduce((sum, p) => sum + p.value, 0) / regionPoints.length;
      regions.push({
        name: region.name,
        anomaly: Math.round(regionAvg * 10) / 10 // Round to 1 decimal place
      });
    }
  });
  
  // Sort regions by anomaly (most negative first)
  return regions.sort((a, b) => a.anomaly - b.anomaly);
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
      { name: 'Sekondi-Takoradi', lat: 4.9348, lon: -1.7041 },
      { name: 'Sunyani', lat: 7.3349, lon: -2.3268 },
      { name: 'Koforidua', lat: 6.0941, lon: -0.2612 },
      { name: 'Ho', lat: 6.6016, lon: 0.4717 },
      { name: 'Wa', lat: 10.0601, lon: -2.5099 },
      { name: 'Bolgatanga', lat: 10.7867, lon: -0.8486 }
    ],
    kenya: [
      { name: 'Nairobi', lat: -1.2921, lon: 36.8219 },
      { name: 'Mombasa', lat: -4.0435, lon: 39.6682 },
      { name: 'Kisumu', lat: -0.1022, lon: 34.7617 },
      { name: 'Nakuru', lat: -0.3031, lon: 36.0800 },
      { name: 'Eldoret', lat: 0.5143, lon: 35.2698 },
      { name: 'Thika', lat: -1.0396, lon: 37.0900 },
      { name: 'Malindi', lat: -3.2138, lon: 40.1169 },
      { name: 'Garissa', lat: -0.4536, lon: 39.6401 },
      { name: 'Kakamega', lat: 0.2827, lon: 34.7519 },
      { name: 'Nyeri', lat: -0.4246, lon: 36.9517 }
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
      { name: 'Lucknow', lat: 26.8467, lon: 80.9462 },
      { name: 'Kanpur', lat: 26.4499, lon: 80.3319 },
      { name: 'Nagpur', lat: 21.1458, lon: 79.0882 },
      { name: 'Indore', lat: 22.7196, lon: 75.8577 },
      { name: 'Bhopal', lat: 23.2599, lon: 77.4126 },
      { name: 'Visakhapatnam', lat: 17.6868, lon: 83.2185 }
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
