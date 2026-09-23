import { useState, useEffect } from 'react';
import { LocationState } from '@/lib/api';

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    permissionGranted: false,
    permissionDenied: false,
  });
  
  const [isRequesting, setIsRequesting] = useState(false);

  const requestLocation = () => {
    setIsRequesting(true);
    if (!navigator.geolocation) {
      setLocation(prev => ({ ...prev, permissionDenied: true }));
      setIsRequesting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          permissionGranted: true,
          permissionDenied: false,
        });
        setIsRequesting(false);
      },
      (error) => {
        setLocation(prev => ({ ...prev, permissionDenied: true }));
        setIsRequesting(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  return { location, requestLocation, isRequesting };
}
