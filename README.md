# HydroHorizon

A web application that visualizes groundwater storage anomalies from NASA's GRACE and GRACE-FO satellite missions for Ghana, Kenya, and India.

## About

HydroHorizon makes it easy to understand groundwater conditions at a glance. It displays groundwater storage anomalies (changes compared to the long-term average) on an interactive map, along with insights and trends.

This application was developed for the Hackathon for the People's Data 2025.

## Features

- Interactive map showing groundwater storage anomalies
- Country-specific insights and trends
- Regional breakdown of groundwater conditions
- Data sourced directly from NASA's GRACE and GRACE-FO missions

## Setup

### Prerequisites

- Node.js (v16 or later)
- NASA Earthdata Login account (register at https://urs.earthdata.nasa.gov/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Phinart98/HydroHorizon.git
   cd HydroHorizon
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your NASA Earthdata credentials:
   ```
   NASA_USERNAME=your_username
   NASA_PASSWORD=your_password
   ```

### Development

Run the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000.

### Production

Build the application for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Data Sources

- GRACE (2002-2017): Gravity Recovery and Climate Experiment
- GRACE-FO (2018-Present): GRACE Follow-On mission
- Dataset IDs: TELLUS_GRAC_L3_JPL_RL06_LND_v04 and TELLUS_GRFO_L3_JPL_RL06.3_LND_v04
- Provider: NASA JPL / PO.DAAC
