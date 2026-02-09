# TransXChange Route Calculator Setup

## Installation

To use the TransXChange route calculator, you need to install the xml2js package:

```bash
npm install xml2js @types/xml2js
# or
pnpm add xml2js @types/xml2js
```

## How It Works

1. **Postcode Geocoding**: Converts postcodes to coordinates using a lookup database
2. **Stop Finding**: Finds nearest public transport stops to origin and destination
3. **Route Calculation**: Calculates travel time, distance, and cost using TransXChange data

## Data Processing

The system will:
- Parse TransXChange XML files from `public/data/transxchange_1/`
- Extract stop locations with coordinates
- Cache processed stops to `data/processed-stops.json` for faster loading

## First Run

On first use, the system will process TransXChange files (this may take a few minutes). 
Processed stops are cached for subsequent requests.

## Postcode Database

The geocoding system includes common NSW postcodes. For production, you should:
- Use a comprehensive postcode database (e.g., from Australia Post)
- Or integrate with a geocoding API (Google Maps, OpenStreetMap, etc.)

## University Coordinates

University locations are mapped to approximate postcodes:
- University of Sydney: 2052
- UNSW: 2050
- UTS: 2007
- Macquarie University: 2109
- Western Sydney University: 2751
- University of Wollongong: 2500
- University of Newcastle: 2308
