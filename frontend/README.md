# CivicLens — Frontend (Next.js 16)

This is the web frontend for **CivicLens**, an offline-first public facility discovery, verification, and crowdsourced reporting application built for the **ANAVANDI Hackathon 2026**.

For complete system documentation, architecture diagrams, and hackathon declarations, refer to the root [README.md](../README.md).

---

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Library**: React 19, TypeScript
- **Styling**: Tailwind CSS v4, Lucide React icons
- **Mapping**: MapLibre GL JS, React Map GL, Carto Voyager vector basemap
- **State & Data Fetching**: SWR (with coordinate jitter stabilization)
- **Offline Engine**: IndexedDB (`idb`) caching facilities, tickets, and report sync queue
- **Conversational AI**: Groq Cloud SDK (`qwen/qwen3.8-27b`) via `/api/chat` with live RAG facility injection
- **Real-Time Geolocation**: Continuous GPS watching with live WebSocket streaming to the backend (`/api/location/ws/{session_id}`)

---

## Environment Configuration

Create a `.env.local` file in this directory based on `.env.example`:

```env
# Backend API Base URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Internal URL for server-side fetches (Docker networking)
INTERNAL_BACKEND_URL=http://backend:8000

# Basemap Style
NEXT_PUBLIC_MAP_STYLE_URL=https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json

# Live Location Tracking WebSocket
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# Groq Cloud API Key for CivicCare AI
GROQ_API_KEY=your_groq_api_key_here
```

---

## Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Main Map & Reporting**: [http://localhost:3000/map](http://localhost:3000/map)
- **Municipal Officer Admin Portal**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Login / Account Switcher**: [http://localhost:3000/login](http://localhost:3000/login)

---

## Production Build

```bash
npm run build
npm run start
```
