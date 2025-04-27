import os
import json
import numpy as np
import xarray as xr
from datetime import datetime
import pandas as pd
import glob
import traceback  # For detailed error tracing

# Define country bounding boxes (approximate)
COUNTRY_BOUNDS = {
    'ghana': {'lon': (-3.5, 1.5), 'lat': (4.5, 11.5)},
    'kenya': {'lon': (33.5, 42.0), 'lat': (-5.0, 5.0)},
    'india': {'lon': (68.0, 98.0), 'lat': (6.0, 38.0)}
}

def process_netcdf_files(directory):
    """Process all NetCDF files in the given directory."""
    if not os.path.exists(directory):
        print(f"Directory {directory} does not exist!")
        return {country: [] for country in COUNTRY_BOUNDS.keys()}
    
    data_by_country = {country: [] for country in COUNTRY_BOUNDS.keys()}
    
    # Get all NetCDF files
    nc_files = glob.glob(os.path.join(directory, '*.nc'))
    if not nc_files:
        print(f"No NetCDF files found in {directory}")
        return data_by_country
    
    nc_files.sort()  # Sort by filename to ensure chronological order
    
    for nc_file in nc_files:
        try:
            print(f"Processing {nc_file}")
            
            # Open the NetCDF file
            ds = xr.open_dataset(nc_file)
            
            # Print dataset structure for debugging
            print(f"Dataset variables: {list(ds.variables.keys())}")
            print(f"Dataset dimensions: {ds.dims}")
            
            # Extract date from the file
            try:
                if 'time' in ds:
                    time_value = ds.time.values[0]
                    if isinstance(time_value, np.datetime64):
                        date_str = pd.to_datetime(time_value).strftime('%Y-%m-%d')
                    else:
                        # If time is stored as days since a reference date
                        ref_date = datetime(2002, 1, 1)
                        date = ref_date + pd.Timedelta(days=float(time_value))
                        date_str = date.strftime('%Y-%m-%d')
                else:
                    # Extract from filename
                    raise ValueError("No time variable found")
            except Exception as e:
                # Fallback: try to extract date from filename
                print(f"Could not extract date from time variable: {e}")
                try:
                    # Extract date parts from filename
                    parts = os.path.basename(nc_file).split('_')
                    if len(parts) > 1 and '-' in parts[1]:
                        date_part = parts[1].split('-')[0]  # Take the first date
                        if len(date_part) >= 7:  # YYYYDDD format
                            year = int(date_part[:4])
                            doy = int(date_part[4:7])
                            date = datetime(year, 1, 1) + pd.Timedelta(days=doy-1)
                            date_str = date.strftime('%Y-%m-%d')
                        else:
                            date_str = "2023-01-01"  # Default
                    else:
                        date_str = "2023-01-01"  # Default
                except Exception as e:
                    date_str = "2023-01-01"  # Default
                    print(f"Using default date for {nc_file}: {e}")
            
            # Check if lwe_thickness exists
            if 'lwe_thickness' not in ds:
                print(f"Warning: 'lwe_thickness' not found in {nc_file}. Available variables: {list(ds.variables.keys())}")
                continue
            
            # Extract data for each country
            for country, bounds in COUNTRY_BOUNDS.items():
                try:
                    print(f"Processing {country} data...")
                    
                    # Select data within country bounds
                    lat_min, lat_max = bounds['lat']
                    lon_min, lon_max = bounds['lon']
                    
                    # Print lat/lon ranges for debugging
                    print(f"Latitude range in dataset: {ds.lat.values.min()} to {ds.lat.values.max()}")
                    print(f"Longitude range in dataset: {ds.lon.values.min()} to {ds.lon.values.max()}")
                    print(f"Selecting data for {country}: lat={lat_min} to {lat_max}, lon={lon_min} to {lon_max}")
                    
                    # Use boolean indexing instead of slice for more explicit control
                    lat_mask = (ds.lat >= lat_min) & (ds.lat <= lat_max)
                    lon_mask = (ds.lon >= lon_min) & (ds.lon <= lon_max)
                    
                    # Check if we have any matching coordinates
                    if not np.any(lat_mask) or not np.any(lon_mask):
                        print(f"No coordinates found within bounds for {country}")
                        continue
                    
                    # Get the indices where the masks are True
                    lat_indices = np.where(lat_mask)[0]
                    lon_indices = np.where(lon_mask)[0]
                    
                    if len(lat_indices) == 0 or len(lon_indices) == 0:
                        print(f"No data points found for {country}")
                        continue
                    
                    # Extract the data using the indices
                    lats = ds.lat.values[lat_indices]
                    lons = ds.lon.values[lon_indices]
                    
                    # Create a mesh grid of values
                    values = np.full((len(lats), len(lons)), np.nan)
                    
                    # Fill in the values from the dataset
                    for i, lat_idx in enumerate(lat_indices):
                        for j, lon_idx in enumerate(lon_indices):
                            try:
                                # Handle different possible array structures
                                if len(ds.lwe_thickness.shape) == 3:  # [time, lat, lon]
                                    values[i, j] = ds.lwe_thickness.values[0, lat_idx, lon_idx]
                                elif len(ds.lwe_thickness.shape) == 2:  # [lat, lon]
                                    values[i, j] = ds.lwe_thickness.values[lat_idx, lon_idx]
                            except IndexError:
                                # Skip if index is out of bounds
                                pass
                    
                    # Check if we have any non-NaN values
                    if np.all(np.isnan(values)):
                        print(f"All values are NaN for {country}")
                        continue
                    
                    # Calculate statistics using numpy's nan functions
                    mean_val = np.nanmean(values)
                    min_val = np.nanmin(values)
                    max_val = np.nanmax(values)
                    std_val = np.nanstd(values)
                    
                    # Convert values to list for JSON serialization
                    values_list = []
                    for row in values:
                        row_list = []
                        for val in row:
                            if np.isnan(val):
                                row_list.append(None)
                            else:
                                row_list.append(float(val))
                        values_list.append(row_list)
                    
                    # Create country stats
                    country_stats = {
                        'date': date_str,
                        'mean': float(mean_val),
                        'min': float(min_val),
                        'max': float(max_val),
                        'std': float(std_val),
                        'raw_data': {
                            'lats': lats.tolist(),
                            'lons': lons.tolist(),
                            'values': values_list
                        }
                    }
                    
                    data_by_country[country].append(country_stats)
                    print(f"Successfully processed {country} data")
                    
                except Exception as e:
                    print(f"Error processing {country} data from {nc_file}: {e}")
                    print(traceback.format_exc())  # Print detailed traceback
            
            ds.close()
        except Exception as e:
            print(f"Error processing file {nc_file}: {e}")
            print(traceback.format_exc())  # Print detailed traceback
    
    return data_by_country

try:
    # Process both GRACE and GRACE-FO data
    print("Processing GRACE data...")
    grace_data = process_netcdf_files('./data/grace')
    
    print("Processing GRACE-FO data...")
    grace_fo_data = process_netcdf_files('./data/grace-fo')
    
    # Merge the data
    merged_data = {country: grace_data.get(country, []) + grace_fo_data.get(country, []) for country in COUNTRY_BOUNDS.keys()}
    
    # Sort by date
    for country in merged_data:
        merged_data[country].sort(key=lambda x: x['date'])
    
    # Save to JSON files
    os.makedirs('public/data', exist_ok=True)
    for country, data in merged_data.items():
        if not data:
            print(f"No data available for {country}")
            continue
        
        output_file = f'public/data/{country}_groundwater.json'
        with open(output_file, 'w') as f:
            json.dump(data, f)
        print(f"Saved data for {country} to {output_file}")
    
    print("Processing complete!")
except Exception as e:
    print(f"An error occurred during processing: {e}")
    print(traceback.format_exc())  # Print detailed traceback
