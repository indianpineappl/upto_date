import { LocationData } from '../types';

export class LocationService {
  private static instance: LocationService;
  private watchers: number[] = [];
  
  private constructor() {}
  
  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }
  
  /**
   * Get current location with high accuracy
   */
  public getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error(`Unable to retrieve location: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }
  
  /**
   * Watch position changes
   */
  public watchPosition(callback: (location: LocationData) => void): number {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser');
    }
    
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Error watching position:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
    
    this.watchers.push(watchId);
    return watchId;
  }
  
  /**
   * Stop watching a specific position
   */
  public clearWatch(watchId: number): void {
    navigator.geolocation.clearWatch(watchId);
    this.watchers = this.watchers.filter(id => id !== watchId);
  }
  
  /**
   * Stop watching all positions
   */
  public clearAllWatches(): void {
    this.watchers.forEach(id => navigator.geolocation.clearWatch(id));
    this.watchers = [];
  }
  
  /**
   * Reverse geocode coordinates to get city/country
   */
  public async reverseGeocode(lat: number, lng: number): Promise<{ city?: string; country?: string }> {
    // In a real implementation, this would call a geocoding API
    // For now, we'll return mock data
    console.warn('Reverse geocoding not implemented - returning mock data');
    return {
      city: 'San Francisco',
      country: 'USA'
    };
  }
}

export default LocationService.getInstance();
