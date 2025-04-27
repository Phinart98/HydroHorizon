/**
 * Simplified country boundaries for faster loading
 * In a production app, these would be loaded from GeoJSON files
 * or a geospatial database
 */

// Simplified Ghana boundary
const ghanaBoundary = {
  "type": "Feature",
  "properties": { "name": "Ghana" },
  "geometry": {
    "type": "Polygon",
    "coordinates": [[
      [-2.7, 4.7], [-0.1, 5.0], [0.1, 6.0], [0.5, 6.4], [0.5, 9.5],
      [0.2, 10.7], [-0.5, 11.0], [-2.8, 11.0], [-3.2, 10.0], [-3.0, 7.5],
      [-2.7, 4.7]
    ]]
  }
};

// Simplified Kenya boundary
const kenyaBoundary = {
  "type": "Feature",
  "properties": { "name": "Kenya" },
  "geometry": {
    "type": "Polygon",
    "coordinates": [[
      [41.9, 3.9], [40.9, -1.5], [40.0, -4.1], [39.2, -4.7], [37.6, -3.5],
      [33.9, -1.0], [34.0, 1.0], [34.5, 4.2], [36.0, 4.5], [38.0, 3.5],
      [41.9, 3.9]
    ]]
  }
};

// Simplified India boundary
const indiaBoundary = {
  "type": "Feature",
  "properties": { "name": "India" },
  "geometry": {
    "type": "Polygon",
    "coordinates": [[
      [77.0, 35.0], [80.0, 34.0], [82.0, 30.0], [88.0, 28.0], [90.0, 28.0],
      [92.0, 27.0], [96.0, 20.0], [97.0, 17.0], [94.0, 15.0], [80.0, 8.0],
      [77.0, 8.0], [72.0, 20.0], [69.0, 23.0], [70.0, 28.0], [77.0, 35.0]
    ]]
  }
};

/**
 * Get a simplified boundary for a country
 * @param {string} country - Country code (ghana, kenya, india)
 * @returns {Object} GeoJSON feature
 */
export function getFallbackBoundary(country) {
  const boundaries = {
    ghana: ghanaBoundary,
    kenya: kenyaBoundary,
    india: indiaBoundary
  };
  
  return boundaries[country.toLowerCase()] || null;
}

/**
 * Get the center coordinates for a country
 * @param {string} country - Country code
 * @returns {Array} [latitude, longitude]
 */
export function getCountryCenter(country) {
  const centers = {
    ghana: [7.9465, -1.0232],
    kenya: [0.0236, 37.9062],
    india: [20.5937, 78.9629]
  };
  
  return centers[country.toLowerCase()] || [0, 0];
}

/**
 * Get the default zoom level for a country
 * @param {string} country - Country code
 * @param {boolean} isMobile - Whether the device is mobile
 * @returns {number} Zoom level
 */
export function getDefaultZoom(country, isMobile = false) {
  const baseZoom = {
    ghana: 6,
    kenya: 6,
    india: 5
  };
  
  // Use a lower zoom on mobile
  const zoom = baseZoom[country.toLowerCase()] || 5;
  return isMobile ? Math.max(zoom - 1, 3) : zoom;
}

/**
 * Get the bounding box for a country
 * @param {string} country - Country code
 * @returns {Array} [minLon, minLat, maxLon, maxLat]
 */
export function getCountryBoundingBox(country) {
  const boxes = {
    ghana: [-3.3, 4.5, 1.2, 11.2],
    kenya: [33.8, -4.8, 42.0, 5.0],
    india: [68.0, 6.5, 98.0, 36.0]
  };
  
  return boxes[country.toLowerCase()] || null;
}
