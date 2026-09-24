# CivicLens — See. Verify. Access.

[![Hackathon Track](https://img.shields.io/badge/ANAVANDI%202026-PS--08%20Track%203%3A%20Public%20Welfare%20%26%20Access-6366f1?style=for-the-badge)](problem-statement.txt)
[![Build Status](https://img.shields.io/badge/Build-Passing-emerald?style=for-the-badge)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=for-the-badge&logo=typescript)](frontend/tsconfig.json)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141-009688?style=for-the-badge&logo=fastapi)](backend/app/main.py)
[![Next.js](https://img.shields.io/badge/Next.js-16.3%20App%20Router-black?style=for-the-badge&logo=next.js)](frontend/package.json)
[![MongoDB](https://img.shields.io/badge/MongoDB-2dsphere%20Geospatial-47A248?style=for-the-badge&logo=mongodb)](backend/app/db/database.py)

**CivicLens** is an offline-first public sanitation and drinking-water facility discovery, verification, and crowdsourced reporting application built for the **ANAVANDI Hackathon 2026** (Problem Statement **PS-08 | Track 3: Public Welfare and Access**).

CivicLens empowers citizens, commuters, sanitation workers, older people, and persons with disabilities to locate clean and accessible facilities, verify their real-time usability, and report civic issues directly to local authorities—even in zero-connectivity environments like transit corridors and remote ghat routes.

---

## Table of Contents
- [Problem & Mission](#problem--mission)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Machine Learning & AI Overview](#machine-learning--ai-overview)
- [Demo Credentials](#demo-credentials)
- [Quick Start Guide](#quick-start-guide)
  - [Option A: Docker Compose (Recommended)](#option-a-docker-compose-recommended)
  - [Option B: Manual Local Setup](#option-b-manual-local-setup)
- [Testing & Verification Guide](#testing--verification-guide)
  - [1. Offline Resilience & Sync Flow](#1-offline-resilience--sync-flow)
  - [2. Issue Reporting & Admin Resolution Lifecycle](#2-issue-reporting--admin-resolution-lifecycle)
  - [3. CivicCare AI Assistant](#3-civiccare-ai-assistant)
- [API & WebSocket Reference](#api--websocket-reference)
- [Data Statement & Privacy Protection](#data-statement--privacy-protection)
- [AI Use Declaration](#ai-use-declaration)
- [Known Limitations](#known-limitations)
- [Project Documentation](#project-documentation)

---

## Problem & Mission

### The Challenge (PS-08)
Travellers, daily-wage workers, older citizens, and persons with disabilities frequently arrive at public toilets or drinking-water kiosks only to find them locked, damaged, dry, or inaccessible. Furthermore:
- Civic facilities in municipal databases are often out of date.
- Grievance reporting to municipal authorities is fragmented and slow.
- Internet connectivity frequently drops along highway corridors and hilly routes (e.g., Kochi to Munnar), leaving users stranded without facility information or the ability to file tickets.

### The CivicLens Solution
CivicLens solves this through three pillars:
1. **See**: Geospatial mapping with concentric radius discovery (<1 km to 50 km) and along-route corridor search.
2. **Verify**: ML-driven confidence scoring (0–100%), relative freshness indicators, wheelchair accessibility badges, and peer verifications.
3. **Access & Report**: One-click authenticated reporting with photo evidence, offline queuing with background idempotent sync, and a full municipal authority resolution portal (`/admin`).

---

## Key Features

### 1. Interactive Geospatial Discovery & Map Engine
- **Vector Basemap**: High-performance interactive map built using **MapLibre GL JS** and Carto Voyager vector tiles.
- **Concentric Radial Zones & Regional Coverage**: High-precision discovery spanning scalable zones:
  - *Zone 1*: Walkable (< 1 km)
  - *Zone 2*: Neighborhood (1 km – 5 km)
  - *Zone 3*: City (5 km – 10 km)
  - *Zone 4*: Regional Corridor (10 km – 50 km)
  - *Zone 5*: Extended Regional (100 km) and "All Facilities" view for cross-district search.
- **Along-Route Corridor Search (`/api/facilities/route`)**: Discovers accessible facilities along transit corridors and polylines.
- **Live Geolocation Tracking**: Continuous GPS tracking with client-side jitter dampening (~110m grid) and live WebSocket streaming to the backend (`/api/location/ws/{session_id}`).
- **Rich Multi-Filter Drawer**: Instant filtering by facility type (`toilet`, `drinking_water`), operational condition (`clean`, `usable`, `broken`, `locked`, `no_water`), 24/7 availability, wheelchair access, and high-frequency hotspots.

### 2. Machine Learning & Real-Time Intelligence
- **ML Confidence Scoring**: A Scikit-Learn Random Forest model (`confidence_model.pkl`) trained on historical report frequency, community upvotes/downvotes, temporal freshness decay, and condition ratings to output an objective confidence score (0–100%) and level (`high`, `moderate`, `low`).
- **ML Recommendation Utility Model**: Gradient Boosting regressor (`recommendation_model.pkl`) balancing distance penalty, condition rating, and verification probability to rank the most viable facilities.
- **CivicCare AI Assistant**: Floating conversational AI powered by **Groq Cloud SDK (`qwen/qwen3.8-27b`)** with dynamic server-side RAG context injection of live nearby facilities (2-minute TTL cache).

### 3. Civic Grievance Reporting & Ticket Lifecycle
- **Categorized Issue Reporting**: Rapid submission for broken fixtures, lack of water, locked facilities, or unsanitary conditions.
- **Photo Evidence**: Support for real-time photo uploads via camera/file attachment stored on local backend storage.
- **Automated Routing**: Generates unique municipal ticket numbers (`CF-XXXX`) automatically routed to simulated local bodies (e.g., *Kochi Municipal Corporation & Thrikkakara Municipality*) and responsible departments (*Public Health & Sanitation*, *Kerala Water Authority*, *Municipal Works*).
- **Ticket Tracking & Claiming**: Real-time modal to inspect ticket statuses, expected response SLAs, resolution photos, and inspector notes, with ticket claiming to link tickets to citizen accounts.

### 4. Municipal Officer Administration Portal (`/admin`)
- **Authority Dashboard**: Role-protected portal for municipal sanitation inspectors, featuring dedicated tabs for Ticket Management, Facility Directory, and Analytics & Data Reports.
- **Bulk CSV Import**: Import hundreds of facilities at once via the intuitive CSV bulk upload modal on the dashboard.
- **Status Lifecycle**: Manage tickets through `open` &rarr; `in_progress` &rarr; `resolved`.
- **Verified Resolution & Audit**: Officers can enter custom or preset inspection notes, upload post-repair verification photos, and digitally sign off.
- **Automated Amenity Reset**: When an officer resolves a ticket, CivicLens automatically restores the facility's condition to `clean` and updates its `lastUpdated` timestamp across the map.

### 5. Resilient Offline-First Architecture
- **Local Storage Layer**: Browser **IndexedDB (`idb`)** caches facilities, tickets, and offline reports.
- **Offline Report Queue**: Submissions generated without network access receive local identifiers (`OFF-XXXX`) and are queued safely in the browser.
- **Idempotent Background Synchronization**: When internet connectivity resumes, the `SyncManager` transmits queued reports using a unique `X-Idempotency-Key` (UUIDv4) header. The MongoDB sparse index guarantees that no duplicate tickets are generated, converting local `OFF-XXXX` tickets into verified `CF-XXXX` municipal tickets.

### 6. Crowdsourced Community Verifications & Contributions
- **Community "Still Here?" Verification**: Users can affirm facility operational status, rewarding community accuracy and boosting the ML confidence score.
- **Ratings & Reviews**: 1-to-5 star ratings with citizen feedback.
- **Propose New Facility**: Form to submit unmapped public toilets and drinking-water stations.

---

## System Architecture

```
[ Citizen / Commuter ]          [ Municipal Officer ]
          │                               │
          ▼                               ▼
┌────────────────────────────────────────────────────────┐
│              Next.js 16 (React 19, TypeScript)         │
│  - MapLibre GL JS / Carto Voyager Vector Tiles         │
│  - Tailwind CSS v4 UI + Lucide React                   │
│  - SWR Data Caching & Jitter Throttle                  │
│  - CivicCare AI (Groq SDK RAG Assistant)               │
│  - IndexedDB (idb) Offline Cache & SyncManager         │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / WebSockets
                           ▼
┌────────────────────────────────────────────────────────┐
│                   Nginx Reverse Proxy                  │
│       (Routes /api/chat to Next.js, others to FastAPI)  │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│               FastAPI (Python 3.10+) Backend           │
│  - /api/facilities (Geospatial $geoNear & Polyline)    │
│  - /api/reports (Idempotent Grievance Reporting)       │
│  - /api/tickets (Lifecycle Management & Dispatch)      │
│  - /api/location/ws (Live WebSocket Location Stream)   │
│  - /api/auth (Citizen & Municipal Role Security)       │
│  - /api/uploads (Photo Evidence Storage)               │
│  - ML Engine: confidence_model.pkl & rec_model.pkl     │
└──────────────────────────┬─────────────────────────────┘
                           │ Motor (Async Driver)
                           ▼
┌────────────────────────────────────────────────────────┐
│                      MongoDB 6.0                       │
│  - facilities (2dsphere geospatial index)              │
│  - reports (sparse unique idempotencyKey index)        │
│  - tickets, users, ratings, local_bodies               │
└────────────────────────────────────────────────────────┘
```

For detailed sequence diagrams, offline caching state machines, and routing pipelines, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## Machine Learning & AI Overview

CivicLens implements practical, transparent Artificial Intelligence:

| Component | Architecture | Purpose |
| :--- | :--- | :--- |
| **Confidence Scoring Model** | Scikit-Learn `RandomForestClassifier` | Predicts operational confidence probability (0–100%) based on reports count, net upvotes, time elapsed since last report, and condition. |
| **Recommendation Engine** | Scikit-Learn `GradientBoostingRegressor` | Predicts overall utility score combining geospatial Euclidean distance, accessibility, and confidence probability. |
| **CivicCare AI Assistant** | Groq Cloud SDK (`qwen/qwen3.8-27b`) | Context-aware RAG assistant answering citizen queries regarding nearby amenities, water potability, and ticket status. |

The training pipeline and dataset generator are fully inspectable at [backend/ai/train_models.py](backend/ai/train_models.py) and [backend/ai/generate_dataset.py](backend/ai/generate_dataset.py).

---

## Demo Credentials

CivicLens comes pre-seeded with dedicated test accounts for hackathon evaluation:

| Role | Email | Password | Scope & Privileges |
| :--- | :--- | :--- | :--- |
| **Municipal Officer (Admin)** | `admin@civiclens.com` | `admin123` | Full access to `/admin` dashboard, ticket status dispatch, resolution photo upload, officer sign-off. |
| **Citizen Reporter** | `user@civiclens.com` | `user123` | Facility discovery, issue reporting with photo upload, ticket tracking and claiming, community reviews. |

---

## Quick Start Guide

### Prerequisites
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (for Option A)
- **OR** Node.js v18+, Python 3.10+, and a local MongoDB instance (for Option B)

---

### Option A: Docker Compose (Recommended)

Run the entire stack (MongoDB, FastAPI backend, Next.js frontend, and Nginx reverse proxy) with one command:

```bash
# 1. Clone the repository
git clone https://github.com/callmesidhu/FastAPI-CivicLens-hackathon.git
cd FastAPI-CivicLens-hackathon

# 2. Configure environment (optional: add your GROQ_API_KEY for CivicCare AI)
cp .env.example .env

# 3. Build and launch all containers
docker-compose up --build
```

- **Frontend Portal**: Open [http://localhost:8888](http://localhost:8888) (or [http://localhost:3000](http://localhost:3000))
- **Admin Dashboard**: Open [http://localhost:8888/admin](http://localhost:8888/admin)
- **FastAPI OpenAPI Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

*To populate seed facilities and test accounts inside Docker:*
```bash
docker exec -it civiclens_backend python seed.py
```

---

### Option B: Manual Local Setup

#### 1. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# (Optional) Retrain or verify ML models
python ai/train_models.py

# Seed the database with 60 Kochi facilities, local bodies, and demo users
python seed.py

# Start the FastAPI development server
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Run the Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing & Verification Guide

### 1. Offline Resilience & Sync Flow
1. Open [http://localhost:3000/map](http://localhost:3000/map). Notice facilities load around Kochi / Kakkanad.
2. Open your browser Developer Tools &rarr; **Network** tab &rarr; Toggle Throttling to **Offline**.
3. Reload or navigate the map:
   - Notice the amber notification banner: *"Offline Mode — Serving cached facilities from IndexedDB"*.
   - All previously viewed facilities remain interactive and searchable.
4. Click on any facility and click **"Report Problem"**.
5. Fill out the report form and click **Submit Report**.
6. The report is instantly accepted offline and assigned a local ticket number: `OFF-XXXX`.
7. Switch the DevTools Network back to **Online**:
   - The `SyncManager` background engine immediately triggers.
   - The report syncs via `POST /api/reports` with its `X-Idempotency-Key`.
   - The local ticket converts into a verified municipal ticket (e.g., `CF-1042`).

### 2. Issue Reporting & Admin Resolution Lifecycle
1. Log in as a citizen using `user@civiclens.com` (`user123`).
2. Search for a facility (e.g., *"Infopark Express Public Restroom"*) on `/map`.
3. Submit a report flagging it as **Broken** or **No Water**, optionally attaching a photo.
4. Notice the facility marker condition updates to alert users.
5. In another tab or after logging in as `admin@civiclens.com` (`admin123`), navigate to [http://localhost:3000/admin](http://localhost:3000/admin).
6. View the new ticket under the **Open** column.
7. Click **"Dispatch Crew"** &rarr; Ticket moves to **In Progress**.
8. Select a preset resolution note (e.g., *"Water tap leak repaired, valve replaced and water tested safe"*), attach a resolution verification photo, and click **"Mark as Resolved"**.
9. Revisit `/map`: The facility status has automatically returned to **Clean / Usable** and its last-updated timestamp is refreshed!

### 3. CivicCare AI Assistant
1. Click the floating **CivicCare AI** chat button in the bottom right.
2. Ask questions such as:
   - *"Where is the nearest wheelchair accessible toilet?"*
   - *"Is there drinking water available near Kakkanad?"*
3. CivicCare AI reads real-time nearby facility context from the backend and provides concise, factual guidance.

---

## API & WebSocket Reference

### Key Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/facilities` | List facilities with optional query filters (`type`, `condition`, `wheelchairAccessible`, `availability`). |
| `GET` | `/api/facilities/nearby` | Geospatial `$geoNear` query returning sorted facilities within a radius (`lat`, `lng`, `radius`). |
| `GET` | `/api/facilities/search` | Full-text search across facility names, addresses, and landmarks (`q`). |
| `POST` | `/api/facilities/route` | Along-route polyline corridor search discovering amenities along a journey path. |
| `POST` | `/api/facilities` | Propose and create a new crowdsourced facility. |
| `POST` | `/api/facilities/{id}/verify`| Submit peer community verification ("Still functional?"). |
| `POST` | `/api/reports` | Submit a problem report. Supports `X-Idempotency-Key` header for duplicate protection. |
| `GET` | `/api/tickets` | Query tickets with filters for status, citizen email, or ticket numbers list. |
| `GET` | `/api/tickets/{ticket_number}`| Retrieve comprehensive ticket history, SLA, department, and resolution evidence. |
| `PATCH`| `/api/tickets/{ticket_number}/status`| Update ticket status (`open`, `in_progress`, `resolved`), notes, and photo evidence. |
| `POST` | `/api/tickets/{ticket_number}/claim` | Link an existing ticket number to an authenticated citizen account. |
| `POST` | `/api/auth/login` | Authenticate citizen or municipal officer. |
| `POST` | `/api/uploads` | Upload image evidence (JPEG, PNG) to backend `/storage/`. |
| `POST` | `/api/ratings` | Submit a 1–5 star facility rating and feedback. |
| `WS` | `/api/location/ws/{session_id}` | Persistent WebSocket stream for client coordinate streaming and real-time positioning. |
| `POST` | `/api/chat` (Next.js) | CivicCare AI conversational route calling Groq Cloud SDK with cached RAG context. |

---

## Data Statement & Privacy Protection

In accordance with Hackathon Rule 6 and Problem Statement PS-08:
- **Zero Movement Tracking**: CivicLens processes GPS coordinates strictly in transient memory for real-time proximity calculation; historical user movement trajectories are never permanently logged or sold.
- **Reporter Privacy**: Ticket reporting and tracking protect citizen identity. Citizen phone numbers and exact real-time coordinates are never publicly rendered on map markers.
- **Sample Dataset**: Facility coordinates, municipal department mappings, and tickets are simulated around Kochi and Kakkanad for demonstration purposes.

Read the comprehensive [DATA.md](DATA.md) for full data schema specifications and ethical safeguards.

---

## AI Use Declaration

In strict compliance with **ANAVANDI Hackathon 2026 Rule 4**:
- **Tools Used**: Google Antigravity IDE (Agentic AI Assistant) and Groq Cloud LLM SDK (`qwen/qwen3.8-27b`).
- **Assistance Scope**:
  - Initial scaffolding of Next.js App Router and FastAPI project layout.
  - Mathematical formulation of Scikit-Learn training pipelines in `backend/ai/`.
  - Design of IndexedDB caching wrapper schemas and idempotent HTTP header handlers.
  - Tailwind CSS layout drafting for Map bottom sheet and Admin dashboard.
- **Verification & Understanding**: Every line of code, Pydantic schema, ML feature pipeline, MapLibre tile handler, and offline sync mechanism was manually reviewed, verified, tested via CLI/unit checks, and is fully understood and defendable by both team members. No black-box or prompt-to-app autonomous tools were used.

Read the complete [AI_USE.md](AI_USE.md) declaration.

---

## Known Limitations

1. **Vector Basemap Caching**: While facility markers, details, and tickets are 100% cached and operable in zero-connectivity environments via IndexedDB, MapLibre GL JS requires network connectivity to download new vector tiles if the user pans into an area of the map that has never been loaded.
2. **Municipal Integration**: Dispatch notifications to the Kerala Water Authority and Kochi Municipal Corporation are currently simulated within the platform's embedded ticket lifecycle engine.

---

## Project Documentation

- [Architecture Design & Diagrams](ARCHITECTURE.md)
- [Data Statement & Privacy Controls](DATA.md)
- [AI Use Declaration](AI_USE.md)
      

---

*Built with ❤️ during the ANAVANDI Hackathon 2026.*
