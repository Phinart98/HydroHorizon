# DATASETS (related data - it's fragmented because of a change in satelite per my understanding)

## Dataset 1
Version	RL06v04
Processing Level	3
Start/Stop Date	2002-Apr-04 to 2017-Oct-18
Short Name	TELLUS_GRAC_L3_JPL_RL06_LND_v04
Description	The monthly land mass grids contain water mass anomalies given as equivalent water thickness derived from GRACE & GRACE-FO time-variable gravity observations during the specified timespan, and relative to the specified time-mean reference period. The Equivalent water thickness represents the total terrestrial water storage anomalies from soil moisture, snow, surface water (incl. rivers, lakes, reservoirs etc.), as well as groundwater and aquifers. A glacial isostatic adjustment (GIA) correction has been applied, and standard corrections for geocenter (degree-1), C20 (degree-20) and C30 (degree-30) are incorporated. Post-processing filters have been applied to reduce correlated errors. Version 04 (v04) of the terrestrial water storage data uses updated and consistent C20 and Geocenter corrections (i.e., Technical Notes TN-14 and TN-13), as well as an ellipsoidal correction to account for the non-spherical shape of the Earth when mapping gravity anomalies to surface mass change. Data grids are provided in ASCII/netCDF/GeoTIFF formats. For the RL06 version, all GRACE products in the ASCII format have adopted the YAML encoding header, which is in full compliance with the PODAAC metadata best practices.
DOI	10.5067/TELND-3AJ64
Measurement	TERRESTRIAL HYDROSPHERE > WATER BUDGET > TERRESTRIAL WATER STORAGE
Platform/Sensor	
Project	Gravity Recovery and Climate Experiment (GRACE)
Data Provider	Publisher: PO.DAAC
Creator: Felix Landerer
Release Place: JPL
Release Date: 2021-Jun-11
Resource: https://grace.jpl.nasa.gov/data/get-data/monthly-mass-grids-land/

Format	netCDF-4
Keyword(s)	GRACE, LWET, Gravity, JPL, LAND, TELLUS, RL06v04, Terrestrial Water Storage
Questions related to this dataset? Contact podaac@podaac.jpl.nasa.gov

Download Info:
PO.DAAC Data Subscriber
 [Information](https://github.com/podaac/data-subscriber?tab=readme-ov-file)
Simple: podaac-data-downloader -c TELLUS_GRAC_L3_JPL_RL06_LND_v04 -d ./data --start-date 2002-04-04T00:00:00Z --end-date 2002-04-11T00:00:00Z -e ""

Download by Spatial and Temporal Search: podaac-data-downloader -c TELLUS_GRAC_L3_JPL_RL06_LND_v04 -d ./data --start-date 2002-04-04T00:00:00Z --end-date 2002-04-11T00:00:00Z -b="-180,-89.5,180,89.5"

Download by Extension: podaac-data-downloader -c TELLUS_GRAC_L3_JPL_RL06_LND_v04 -d ./data --start-date 2002-04-04T00:00:00Z --end-date 2002-04-11T00:00:00Z -e .nc

Download recent data (360 min.): podaac-data-subscriber -c TELLUS_GRAC_L3_JPL_RL06_LND_v04 -d ./data -m 360

Download recent data (1440 min.): podaac-data-subscriber -c TELLUS_GRAC_L3_JPL_RL06_LND_v04 -d ./data -m 1440


### Dataset 2
Version	RL06.3v04
Processing Level	3
Start/Stop Date	2018-May-22 to Present
Short Name	TELLUS_GRFO_L3_JPL_RL06.3_LND_v04
Description	This data set is produced by the Jet Propulsion Laboratory (JPL) as part of the GRACE-FO (Gravity Recovery and Climate Experiment Follow-On) program and derives the terrestrial water storage anomaly given as equivalent water thickness. These monthly grids are derived from GRACE-FO time-variable gravity observations during the specified timespan, and relative to the specified time-mean reference period. This quantity represents the total terrestrial water storage anomalies from soil moisture, snow, surface water (incl. rivers, lakes, reservoirs etc.), as well as groundwater and aquifers. A glacial isostatic adjustment (GIA) correction has been applied, and standard corrections for geocenter (degree-1), C20 (degree-20) and C30 (degree-30) are incorporated. Post-processing filters have been applied to reduce correlated errors. Data grids are provided in ASCII/netCDF/GeoTIFF formats.

GRACE-FO was launched on 22 May 2018, and extends the original GRACE mission (2002 – 2017) and expands its legacy of scientific achievements in tracking earth surface mass changes. Version 04 (v04) of the terrestrial water storage data uses updated and consistent C20 and Geocenter corrections (i.e., Technical Notes TN-14 and TN-13), as well as an ellipsoidal correction to account for the non-spherical shape of the Earth when mapping gravity anomalies to surface mass change. Additionally, this RL06.3 is an updated release of the previous RL06.1. It differs from RL06.1 only in the Level-1B accelerometer transplant data that is used for the GF2 (GRACE-FO 2) satellite; see respective L-2 data descriptions. RL06.3 uses the ACX2-L1B data products. All GRACE-FO RL06.3 Level-3 fields are fully compatible with the GRACE RL06 data.
DOI	10.5067/GFLND-3J634
Measurement	TERRESTRIAL HYDROSPHERE > WATER BUDGET > TERRESTRIAL WATER STORAGE
Platform/Sensor	
GRACE-FO / GRACE-FO MWI
GRACE-FO / GRACE-FO LRI
GRACE-FO / GRACE-FO ACC
GRACE-FO / GRACE-FO SCA
Project	Gravity Recovery and Climate Experiment Follow-On (GRACE-FO)
Data Provider	Publisher: PO.DAAC
Creator: Felix Landerer
Release Place: JPL
Release Date: 2023-Feb-21

Format	netCDF-4
Keyword(s)	TELLUS, GRACE-FO, LWET, Gravity, JPL, TERRESTRIAL WATER STORAGE, RL06.3, Ground Water, Surface MASS
Questions related to this dataset? Contact podaac@podaac.jpl.nasa.gov

Download Info:
PO.DAAC Data Subscriber
[Information](https://github.com/podaac/data-subscriber?tab=readme-ov-file)
Simple: podaac-data-downloader -c TELLUS_GRFO_L3_JPL_RL06.3_LND_v04 -d ./data --start-date 2018-05-22T00:00:00Z --end-date 2018-05-29T00:00:00Z -e ""

Download by Spatial and Temporal Search: podaac-data-downloader -c TELLUS_GRFO_L3_JPL_RL06.3_LND_v04 -d ./data --start-date 2018-05-22T00:00:00Z --end-date 2018-05-29T00:00:00Z -b="-180,-89.5,180,89.5"

Download by Extension: podaac-data-downloader -c TELLUS_GRFO_L3_JPL_RL06.3_LND_v04 -d ./data --start-date 2018-05-22T00:00:00Z --end-date 2018-05-29T00:00:00Z -e .nc

Download recent data (360 min.): podaac-data-subscriber -c TELLUS_GRFO_L3_JPL_RL06.3_LND_v04 -d ./data -m 360

Download recent data (1440 min.): podaac-data-subscriber -c TELLUS_GRFO_L3_JPL_RL06.3_LND_v04 -d ./data -m 1440

### Dataset Variables
Name,	Long Name,	Unit
lat,	latitude,	degrees_north
lat_bounds,	latitude boundaries,	degrees_north
lon	longitude,	degrees_east,
lon_bounds,	longitude boundaries,	degrees_east
lwe_thickness,	Liquid_Water_Equivalent_Thickness,	m
time,	time,	days since 2002-01-01T00:00:00
time_bounds,	"time bounds for each time value, i.e. the first day and last day included in the monthly solution",	days since 2002-01-01T00:00:00
uncertainty,	uncertainty,	m