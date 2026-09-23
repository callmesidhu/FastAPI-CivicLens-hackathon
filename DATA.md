# CivicLens Data Statement

This document outlines the data sources, transformations, and privacy considerations for CivicLens.

## 1. Data Source
CivicLens utilizes a simulated sample dataset for the purpose of the ANAVANDI Hackathon 2026. This data includes sample public toilets and drinking-water points. 
**Note:** The facility locations and their associated conditions are simulated for demonstration purposes.

## 2. Facility Fields
Each facility contains the following primary data points:
- `id`: Unique identifier.
- `name`: Descriptive name of the facility.
- `type`: Either `toilet` or `drinking_water`.
- `location`: GeoJSON Point (longitude and latitude).
- `address`: Human-readable street address.

## 3. Accessibility Fields
The application surfaces accessibility options, prominently highlighting whether a facility is `wheelchairAccessible`.

## 4. Local-Body Mapping
**Simulated Mapping:** Facilities are assigned to a fictional "Local Body" (e.g., "City Municipal Corporation"). 
When a report is filed, it is automatically routed to this local body and directed to a specific department (e.g., "Water & Sanitation Dept") based on the type of facility and the nature of the report. This backend routing simulates an official civic integration.

## 5. Condition Categories
Facilities can be reported under the following categories:
- `clean` (or `usable`)
- `broken`
- `locked`
- `no_water` (specific to drinking water facilities)

## 6. Transformations
- **Confidence Score**: The backend maintains a dynamic "Confidence Score" (0-100%). This score decays when a user reports a negative condition and increases when verified. It is explicitly labeled as a product indicator, not an official government seal of approval.
- **Geospatial Queries**: MongoDB's `$geoNear` aggregation pipeline transforms raw coordinates into ordered distances in meters.

## 7. Cached Data
To support offline functionality, CivicLens caches non-sensitive facility data, read-only ticket states, and anonymous pending reports in the browser's IndexedDB.

## 8. Limitations
- The routing and ticket assignment times are simulated for the prototype.
- The map relies on MapLibre and requires connectivity to fetch raw vector/raster tiles, though facility markers are cached locally.

## 9. Privacy Considerations
- **No Personal Identifiers**: CivicLens does not ask for, require, or store reporter names, phone numbers, or email addresses.
- **No Movement History**: We only use the user's location at the moment of a nearby search. We do not track or store historical location data in the backend or frontend databases.
