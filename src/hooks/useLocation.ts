import { useState, useEffect } from 'react';
import locationService, { LocationService } from '../services/locationService';
import { LocationData } from '../types';

interface UseLocationResult {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
}

const useLocation = (): UseLocationResult => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const requestLocation = () => {
    setLoading(true);
    setError(null);
    
    locationService.getCurrentLocation()
      .then(locationData => {
        setLocation(locationData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };
  
  useEffect(() => {
    // Request location on component mount
    requestLocation();
    
    // Set up position watcher
    let watchId: number;
    try {
      watchId = locationService.watchPosition((newLocation) => {
        setLocation(newLocation);
      });
    } catch (err) {
      setError((err as Error).message);
    }
    
    // Clean up watcher on unmount
    return () => {
      if (watchId) {
        locationService.clearWatch(watchId);
      }
    };
  }, []);
  
  return {
    location,
    loading,
    error,
    requestLocation
  };
};

export default useLocation;
