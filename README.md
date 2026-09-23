# CivicLens — See. Verify. Access.

CivicLens helps people find nearby public toilets and drinking-water points, verify their current usability, and easily report issues directly to simulated civic authorities. It is built to be resilient, maintaining core functionality even when network connectivity drops.

## Problem
Citizens often do not know where nearby public amenities are located. Even if they do, they frequently arrive to find the facility locked, broken, or lacking water. Furthermore, reporting these issues to local bodies is traditionally a fragmented and frustrating process.

## Solution
CivicLens provides a unified map interface to:
1. **See**: Discover nearby facilities using geospatial search.
2. **Verify**: Check real-time condition, accessibility, and confidence metrics before traveling.
3. **Report**: Seamlessly report issues (e.g., "No water") directly to local bodies.

Crucially, CivicLens features **offline functionality**, allowing users to view cached facilities and queue offline reports that automatically synchronize once internet access is restored.

## Features
- **Nearby Discovery**: Geolocation-based discovery of public toilets and drinking-water points.
- **Smart Filtering**: Filter by facility type, condition, wheelchair accessibility, and availability.
- **Confidence Indicator**: Real-time product metrics indicating the reliability of the facility's status.
- **Anonymous Reporting**: One-click civic issue reporting without requiring a login.
- **Automated Routing (Simulated)**: Reports are automatically converted into tickets routed to the correct Local Body and Department.
- **Offline Resilience**: Cached map data and an offline reporting queue using IndexedDB. Background sync with duplicate protection (Idempotency).

## Architecture & Technology
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, MapLibre GL JS, IndexedDB (`idb`).
- **Backend**: FastAPI, Python.
- **Database**: MongoDB (Motor async driver) with geospatial (`2dsphere`) indexing.

Read the detailed [ARCHITECTURE.md](ARCHITECTURE.md).

## Setup & Running Locally

### Prerequisites
- Node.js v18+
- Python 3.10+
- MongoDB instance (local or Atlas)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env from example and configure your MONGODB_URI
cp .env.example .env

# Seed the database with the initial dataset
python seed.py

# Run the server
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install

# Create .env.local from example
cp .env.example .env.local

# Run the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

## Testing Offline Mode
To manually test the offline capabilities:
1. Load the application normally on `http://localhost:3000`.
2. Open your browser DevTools -> Network -> Switch to "Offline".
3. Refresh the page. You will see a banner indicating you are viewing cached data.
4. Click on a facility and submit a report.
5. Notice the report is queued locally (`OFF-XXXX`).
6. Switch back to "Online" in DevTools.
7. The background sync manager will automatically upload the report and generate a real `CF-XXXX` ticket.

## Documentation Reference
- [Architecture](ARCHITECTURE.md)
- [Data Statement & Privacy](DATA.md)
- [AI Use Declaration](AI_USE.md)

## Limitations
- The routing of tickets to local body departments is currently simulated.
- MapLibre requires connectivity to download new vector tiles. If the user moves to a completely un-cached geographical area while offline, the background map will not render, although the facility markers will.
