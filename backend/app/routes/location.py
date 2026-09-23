"""
WebSocket endpoint for live user location tracking.

URL: ws://<host>/api/location/ws/{session_id}

Protocol (JSON frames):
  Client → Server:
    { "type": "location", "lat": <float>, "lng": <float>, "accuracy": <float>, "timestamp": <iso-str> }
    { "type": "ping" }

  Server → Client:
    { "type": "ack", "received_at": <iso-str> }
    { "type": "pong" }
    { "type": "error", "detail": <str> }
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Dict

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)
router = APIRouter()

# In-memory store: session_id → latest location payload
# { session_id: { "lat": float, "lng": float, "accuracy": float, "timestamp": str, "updated_at": str } }
_latest_locations: Dict[str, dict] = {}

# Active WebSocket connections: session_id → WebSocket
# (one connection per session_id; a new connection replaces an old one)
_connections: Dict[str, WebSocket] = {}


@router.websocket("/ws/{session_id}")
async def location_ws(websocket: WebSocket, session_id: str) -> None:
    """
    Persistent WebSocket for a single browser session.
    The client sends location frames and receives acknowledgements.
    """
    await websocket.accept()
    logger.info("[WS] Connected — session_id=%s", session_id)

    # Register (replace any stale connection for the same session)
    _connections[session_id] = websocket

    try:
        while True:
            raw = await websocket.receive_text()

            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.send_json({"type": "error", "detail": "Invalid JSON"})
                continue

            msg_type = msg.get("type")

            if msg_type == "location":
                lat = msg.get("lat")
                lng = msg.get("lng")
                accuracy = msg.get("accuracy")
                timestamp = msg.get("timestamp")

                if lat is None or lng is None:
                    await websocket.send_json({"type": "error", "detail": "Missing lat/lng"})
                    continue

                received_at = datetime.now(timezone.utc).isoformat()

                _latest_locations[session_id] = {
                    "lat": lat,
                    "lng": lng,
                    "accuracy": accuracy,
                    "timestamp": timestamp,
                    "updated_at": received_at,
                }

                logger.debug(
                    "[WS] Location update — session=%s lat=%.6f lng=%.6f acc=%.1f",
                    session_id, lat, lng, accuracy or -1,
                )

                await websocket.send_json({"type": "ack", "received_at": received_at})

            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})

            else:
                await websocket.send_json(
                    {"type": "error", "detail": f"Unknown message type: {msg_type!r}"}
                )

    except WebSocketDisconnect:
        logger.info("[WS] Disconnected — session_id=%s", session_id)
    finally:
        _connections.pop(session_id, None)


@router.get("/latest/{session_id}")
async def get_latest_location(session_id: str):
    """REST fallback: get the last known location for a session."""
    loc = _latest_locations.get(session_id)
    if loc is None:
        return {"session_id": session_id, "location": None}
    return {"session_id": session_id, "location": loc}
