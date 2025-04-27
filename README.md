# HydroHorizon

A web application that visualizes groundwater storage anomalies from NASA's GRACE and GRACE-FO satellite missions for Kenya and India.


## About

HydroHorizon makes it easy to understand groundwater conditions at a glance. It displays groundwater storage anomalies (changes compared to the long-term average) on an interactive map, along with insights and trends.

This application was developed for the Hackathon for the People's Data 2025, addressing the challenge of making critical climate data accessible and understandable to communities.

## Features

- Interactive map showing groundwater storage anomalies
- Country-specific insights and trends
- Regional breakdown of groundwater conditions
- Data sourced directly from NASA's GRACE and GRACE-FO missions
- Downloadable data for further analysis

## How It Works

HydroHorizon processes satellite data from NASA's Gravity Recovery and Climate Experiment (GRACE) and GRACE Follow-On (GRACE-FO) missions. These satellites measure tiny changes in Earth's gravity field, which can be used to estimate changes in groundwater storage.

The application:
1. Downloads raw satellite data
2. Processes it to extract groundwater anomalies for specific regions
3. Visualizes the data on an interactive map
4. Provides insights and trends based on the data

## Data Pipeline

### 1. Data Sources
- **GRACE (2002-2017)**: [Gravity Recovery and Climate Experiment](https://podaac.jpl.nasa.gov/dataset/TELLUS_GRAC_L3_JPL_RL06_LND_v04#)
  - Dataset ID: `TELLUS_GRAC_L3_JPL_RL06_LND_v04`
- **GRACE-FO (2018-Present)**: [GRACE Follow-On mission](https://podaac.jpl.nasa.gov/dataset/TELLUS_GRFO_L3_JPL_RL06.3_LND_v04)
  - Dataset ID: `TELLUS_GRFO_L3_JPL_RL06.3_LND_v04`
- Provider: NASA JPL / PO.DAAC

---

This script:
- Opens each NetCDF file
- Extracts the liquid water equivalent thickness data
- Filters data for specific country boundaries
- Calculates statistics (mean, min, max, etc.)
- Saves processed data as JSON files for the web application

## Setup

### Prerequisites

- Node.js (v18 or later)
- Python 3.8 or later
- NASA Earthdata Login account (register at https://urs.earthdata.nasa.gov/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Phinart98/HydroHorizon.git
   cd HydroHorizon
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Install Python dependencies:
   ```bash
   pip install numpy xarray pandas netCDF4 podaac-data-subscriber
   ```

4. Create a `.netrc` file in your home directory with your NASA Earthdata credentials:
   ```
   machine urs.earthdata.nasa.gov
       login your_username
       password your_password
   ```

### Data Download and Processing

1. Download the GRACE and GRACE-FO data:
   ```bash
   python download_grace_data.py
   ```

2. Process the downloaded data:
   ```bash
   python process_grace_data.py
   ```

This will create processed JSON files in the `public/data` directory.
You can choose to isolate the Python files outside the project to act as a "mini backend"

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

## Understanding the Data

### Groundwater Anomalies

The data shown in HydroHorizon represents **groundwater storage anomalies**, which are deviations from the long-term average. These are measured in meters of equivalent water thickness. We convert to centimeters:

- **Positive values (blue/green)**: More groundwater than average
- **Near-zero values (yellow)**: Normal groundwater levels
- **Negative values (orange/red)**: Less groundwater than average

### Trends

The application also calculates trends based on the last 12 months of data:

- **Increasing**: Groundwater levels are trending upward
- **Stable**: Groundwater levels are relatively constant
- **Decreasing**: Groundwater levels are trending downward

## Technical Architecture

HydroHorizon is built with:

- **Frontend**: Vue.js with Nuxt.js framework
- **Mapping**: Leaflet.js for interactive maps
- **Styling**: Tailwind CSS for responsive design
- **Data Processing**: Python with xarray and numpy for scientific data processing

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- NASA JPL and PO.DAAC for providing the GRACE and GRACE-FO data
- The Hackathon for the People's Data 2025 for the opportunity to develop this application
- All contributors and team members who made this project possible (Laura, Rishi, Diksha)

