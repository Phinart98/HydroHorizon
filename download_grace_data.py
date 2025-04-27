import os
import subprocess
from datetime import datetime

# Create data directories
os.makedirs('data/grace', exist_ok=True)
os.makedirs('data/grace-fo', exist_ok=True)

# Download GRACE data (2002-2017)
grace_cmd = [
    'podaac-data-downloader',
    '-c', 'TELLUS_GRAC_L3_JPL_RL06_LND_v04',
    '-d', './data/grace',
    '-sd', '2002-04-04T00:00:00Z',
    '-ed', '2017-10-18T00:00:00Z',
    '-e', '.nc'
]

# Download GRACE-FO data (2018-Present)
grace_fo_cmd = [
    'podaac-data-downloader',
    '-c', 'TELLUS_GRFO_L3_JPL_RL06.3_LND_v04',
    '-d', './data/grace-fo',
    '-sd', '2018-05-22T00:00:00Z',
    '-ed', datetime.now().strftime('%Y-%m-%dT00:00:00Z'),
    '-e', '.nc'
]

print("Downloading GRACE data (2002-2017)...")
subprocess.run(grace_cmd)

print("Downloading GRACE-FO data (2018-Present)...")
subprocess.run(grace_fo_cmd)

print("Download complete!")
