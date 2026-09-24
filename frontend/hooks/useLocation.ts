import { useState, useEffect, useRef, useCallback } from 'react';
import { LocationState } from '@/lib/api';
import { useLocationTracking } from './useLocationTracking';

/** Returns a stable session ID for this browser tab. */
function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';
  let id = sessionStorage.getItem('civicLensSessionId');
  if (!id) {
    id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem('civicLensSessionId', id);
  }
  return id;
}

export interface LocationStateExtended extends LocationState {
  accuracy: number | null;
}

interface UseLocationReturn {
  location: LocationStateExtended;
  requestLocation: () => void;
  isRequesting: boolean;
  /** True while the WebSocket to the backend is open */
  isTracking: boolean;
  /** Stop continuous GPS watching and close the WebSocket */
  stopTracking: () => void;
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<LocationStateExtended>({
    latitude: null,
    longitude: null,
    accuracy: null,
    permissionGranted: false,
    permissionDenied: false,
  });

  const [isRequesting, setIsRequesting] = useState(false);
  const [trackingEnabled, setTrackingEnabled] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const sessionId = useRef<string>('');

  // Resolve session ID once on the client (avoid SSR mismatch)
  useEffect(() => {
    sessionId.current = getSessionId();
  }, []);

  // WebSocket — only open once we have permission
  const { isConnected, send } = useLocationTracking({
    sessionId: sessionId.current,
    enabled: trackingEnabled,
  });

  const lastUpdateRef = useRef<number>(0);
  const lastCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  /** Called for every GPS position update */
  const handlePosition = useCallback(
    (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;
      const now = Date.now();
      const last = lastCoordsRef.current;

      // Update state if first fix, moved > ~50m, or at least 60 seconds have passed
      const movedSignificantly = !last || (Math.hypot(latitude - last.lat, longitude - last.lng) > 0.0005);
      const oneMinutePassed = now - lastUpdateRef.current >= 60_000;

      if (movedSignificantly || oneMinutePassed) {
        lastUpdateRef.current = now;
        lastCoordsRef.current = { lat: latitude, lng: longitude };

        setLocation({
          latitude,
          longitude,
          accuracy: accuracy ?? null,
          permissionGranted: true,
          permissionDenied: false,
        });

        setIsRequesting(false);
      }

      // Stream to backend
      send({
        lat: latitude,
        lng: longitude,
        accuracy: accuracy ?? null,
        timestamp: new Date(position.timestamp).toISOString(),
      });
    },
    [send],
  );

  const handleError = useCallback((_err: GeolocationPositionError) => {
    setLocation((prev) => ({ ...prev, permissionDenied: true }));
    setIsRequesting(false);
    setTrackingEnabled(false);
  }, []);

  /** Start (or re-start) continuous GPS watching */
  const startWatch = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({ ...prev, permissionDenied: true }));
      setIsRequesting(false);
      return;
    }

    // Clear any existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      handleError,
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 },
    );

    setTrackingEnabled(true);
  }, [handlePosition, handleError]);

  const requestLocation = useCallback(() => {
    setIsRequesting(true);
    startWatch();
  }, [startWatch]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTrackingEnabled(false);
  }, []);

  // Auto-start on mount (same behaviour as before)
  useEffect(() => {
    requestLocation();

    return () => {
      // Cleanup watch on unmount; WebSocket cleanup is handled inside useLocationTracking
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    location,
    requestLocation,
    isRequesting,
    isTracking: isConnected,
    stopTracking,
  };
}
