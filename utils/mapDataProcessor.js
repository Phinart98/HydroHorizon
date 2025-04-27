/**
 * Processes GRACE data for map visualization
 */

export function processMapData(data) {
    if (!data || !data.raw_data) {
      console.warn("No raw data available to process");
      return null;
    }
    
    const { lats, lons, values } = data.raw_data;
    
    if (!lats || !lons || !values || lats.length === 0 || lons.length === 0) {
      console.warn("Raw data is missing required properties");
      return null;
    }
    
    console.log(`Processing map data with ${lats.length} latitude points and ${lons.length} longitude points`);
    
    // Create heatmap data in the format [lat, lon, value]
    const heatmapData = [];
    
    for (let i = 0; i < lats.length; i++) {
      for (let j = 0; j < lons.length; j++) {
        if (values[i] && values[i][j] !== null && values[i][j] !== undefined) {
          heatmapData.push([lats[i], lons[j], values[i][j]]);
        }
      }
    }
    
    console.log(`Generated ${heatmapData.length} heatmap data points`);
    
    return {
      heatmapData,
      min: data.min,
      max: data.max,
      mean: data.mean
    };
  }
  
  export function getColorScale(value) {
    // Red to Yellow to Green color scale
    if (value < -0.1) return '#b91c1c'; // Dark red
    if (value < -0.05) return '#dc2626'; // Red
    if (value < -0.025) return '#ef4444'; // Light red
    if (value < 0) return '#f59e0b'; // Dark yellow
    if (value < 0.025) return '#fcd34d'; // Yellow
    if (value < 0.05) return '#84cc16'; // Light green
    if (value < 0.1) return '#65a30d'; // Green
    return '#166534'; // Dark green
  }
  
  
  /**
   * Get the last 12 months of data for trend analysis
   */
  export function getRecentTrend(data, months = 12) {
    if (!data || data.length === 0) return null;
    
    // Sort by date
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Get the last N months of data
    const recentData = sortedData.slice(-months);
    
    // Calculate trend (simple linear regression)
    const xValues = recentData.map((_, i) => i);
    const yValues = recentData.map(d => d.mean);
    
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((a, b, i) => a + b * yValues[i], 0);
    const sumXX = xValues.reduce((a, b) => a + b * b, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    return {
      slope,
      data: recentData,
      trend: slope > 0.001 ? "increasing" : slope < -0.001 ? "decreasing" : "stable"
    };
  }
  
  /**
   * Format a value for display with proper units and sign
   */
  export function formatAnomalyValue(value) {
    if (value === null || value === undefined) return 'N/A';
    // Convert to cm and add plus sign for positive values
    const valueInCm = (value * 100).toFixed(1);
    return value > 0 ? `+${valueInCm} cm` : `${valueInCm} cm`;
  }
  