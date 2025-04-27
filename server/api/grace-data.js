import { createError } from 'h3';
import fetch from 'node-fetch';

// NASA PO.DAAC API base URL
const API_BASE_URL = 'https://podaac-tools.jpl.nasa.gov/drive/files';

// NASA Earthdata API token
// For the hackathon, you'll need to generate a token in your Earthdata Login account
// https://urs.earthdata.nasa.gov/user_tokens
const NASA_API_TOKEN = process.env.NASA_API_TOKEN;

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { path } = query;
    
    if (!path) {
      return createError({
        statusCode: 400,
        statusMessage: 'Missing path parameter'
      });
    }
    
    // Check if token is configured
    if (!NASA_API_TOKEN) {
      return createError({
        statusCode: 500,
        statusMessage: 'NASA Earthdata API token not configured'
      });
    }
    
    // Construct the full URL
    const url = `${API_BASE_URL}/${path}`;
    
    // Fetch the data with token authentication
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${NASA_API_TOKEN}`
      }
    });
    
    if (!response.ok) {
      return createError({
        statusCode: response.status,
        statusMessage: `NASA API error: ${response.statusText}`
      });
    }
    
    // Get the data as an array buffer
    const data = await response.arrayBuffer();
    
    // Return the data
    return data;
  } catch (error) {
    console.error('Error fetching GRACE data:', error);
    return createError({
      statusCode: 500,
      statusMessage: `Server error: ${error.message}`
    });
  }
});