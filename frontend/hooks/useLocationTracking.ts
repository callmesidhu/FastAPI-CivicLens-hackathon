'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

/** Shape sent to the server on each GPS update */
export interface LocationFrame {
  lat: number;
  lng: number;
  accuracy: number | null;
  timestamp: string;
}

interface UseLocationTrackingOptions {
  sessionId: string;
  /** Whether to open the socket at all. Default: true */
  enabled?: boolean;
}

interface UseLocationTrackingReturn {
  /** True while the WebSocket is in the OPEN state */
  isConnected: boolean;
  /** Send a location frame to the server (no-op if socket not open) */
  send: (frame: LocationFrame) => void;
}

const WS_BASE =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_WS_URL) ||
  'ws://localhost:8000';

const MAX_RECONNECT_DELAY_MS = 30_000;
const INITIAL_RECONNECT_DELAY_MS = 1_000;

/**
 * Manages a persistent WebSocket connection to the backend location tracking
 * endpoint at `<WS_BASE>/api/location/ws/<sessionId>`.
 *
 * Features:
 * - Automatic reconnection with exponential back-off (capped at 30 s)
 * - Ping/pong heartbeat every 20 s to keep the connection alive through proxies
 * - Graceful cleanup on unmount
 */
export function useLocationTracking({
  sessionId,
  enabled = true,
}: UseLocationTrackingOptions): UseLocationTrackingReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY_MS);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);
  const [isConnected, setIsConnected] = useState(false);

  const clearPing = () => {
    if (pingTimerRef.current) {
      clearInterval(pingTimerRef.current);
      pingTimerRef.current = null;
    }
  };

  const clearReconnect = () => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  };

  const connect = useCallback(() => {
    if (!isMountedRef.current || !enabled || !sessionId) return;
    if (typeof window === 'undefined') return;

    const url = `${WS_BASE}/api/location/ws/${sessionId}`;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMountedRef.current) { ws.close(); return; }
        setIsConnected(true);
        reconnectDelayRef.current = INITIAL_RECONNECT_DELAY_MS;

        // Heartbeat ping every 20 s
        clearPing();
        pingTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 20_000);
      };

      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data as string);
          if (msg.type === 'error') {
            console.warn('[LocationWS] Server error:', msg.detail);
          }
        } catch {
          // ignore non-JSON frames
        }
      };

      ws.onclose = () => {
        clearPing();
        setIsConnected(false);
        if (!isMountedRef.current || !enabled) return;

        // Exponential back-off reconnect
        const delay = reconnectDelayRef.current;
        reconnectDelayRef.current = Math.min(delay * 2, MAX_RECONNECT_DELAY_MS);
        reconnectTimerRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        // onclose fires after onerror — reconnect logic lives there
        ws.close();
      };
    } catch (err) {
      console.error('[LocationWS] Failed to create WebSocket:', err);
    }
  }, [sessionId, enabled]);

  useEffect(() => {
    isMountedRef.current = true;
    connect();

    return () => {
      isMountedRef.current = false;
      clearPing();
      clearReconnect();
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on intentional close
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsConnected(false);
    };
  }, [connect]);

  const send = useCallback((frame: LocationFrame) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'location', ...frame }));
    }
  }, []);

  return { isConnected, send };
}
