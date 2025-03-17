import { createContext, useState, useEffect, useContext, useRef } from 'react';

import { AppState, AppStateStatus } from 'react-native';

import * as Location from 'expo-location';

import { requestLocationPermission } from '@util/location';


const LOCATION_OPTIONS: Location.LocationOptions = {
    accuracy: Location.Accuracy.Highest,
    timeInterval: 5 * 10000, // Update every 5 minutes
    distanceInterval: 10 // Update if device moves by 10 meters
}



interface LocationData {
    granted: boolean;
    location: Location.LocationObject | null;
}

interface LocationContextType {
    location: Location.LocationObject | null;
    loading: boolean;
    lastUpdated: number | null;
    hasPermission: boolean;
    requestPermission: () => Promise<boolean>;
    getCurrentLocation: () => Promise<LocationData>;
}



export const locationGlobal = {
    location: null as Location.LocationObject | null,
    lastUpdated: null as number | null,
    hasPermission: false,
}



const LocationContext = createContext<LocationContextType | undefined>(undefined);



export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [lastUpdated, setLastUpdated] = useState<number | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean>(false);
    
    const appState = useRef(AppState.currentState);
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);

    useEffect(() => {
        locationGlobal.location = location;
        locationGlobal.lastUpdated = lastUpdated;
        locationGlobal.hasPermission = hasPermission;
    }, [location, lastUpdated, hasPermission]);

    const requestPermission = async () => {
        setLoading(true);
        const granted = await requestLocationPermission();
        setHasPermission(granted);
        locationGlobal.hasPermission = granted;
        setLoading(false);
        return granted;
    }

    const getCurrentLocation = async () => {
        if (!hasPermission) {
            const granted = await requestPermission();
            if (!granted) return { granted: false, location: null };
        }
        setLoading(true);
        const currentLocation = await Location.getCurrentPositionAsync({ accuracy: 5 });
        setLocation(currentLocation);
        setLastUpdated(Date.now());
        locationGlobal.location = currentLocation;
        locationGlobal.lastUpdated = Date.now();
        setLoading(false);
        return { granted: true, location: currentLocation };
    }


    const startLocationUpdates = async () => {
        if (!hasPermission) {
            const granted = await requestPermission();
            if (!granted) return;
        }

        // Clean up any existing subscription
        if (locationSubscription.current) locationSubscription.current.remove();

        // Subscribe to location updates
        locationSubscription.current = await Location.watchPositionAsync(
            LOCATION_OPTIONS,
            (newLocation) => {
                setLocation(newLocation);
                setLastUpdated(Date.now());
                locationGlobal.location = newLocation;
                locationGlobal.lastUpdated = Date.now();
                setLoading(false);
            }
        );
    }

    const stopLocationUpdates = () => {
        if (locationSubscription.current) {
            locationSubscription.current.remove();
            locationSubscription.current = null;
        }
    }

    // Handle app state changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
            // App has come to the foreground: restart location updates
            startLocationUpdates();
        } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
            // App has gone to the background: stop updates to save battery
            stopLocationUpdates();
        }
        appState.current = nextAppState;
    }

    // Initial setup
    useEffect(() => {
        // Check for location permission on mount
        (async () => {
            const permissionGranted = await requestLocationPermission();
            setHasPermission(permissionGranted);
            locationGlobal.hasPermission = permissionGranted;
            if (permissionGranted) {
                getCurrentLocation();
                startLocationUpdates();
            }
        })();

        // Subscribe to app state changes
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        // Cleanup
        return () => {
            stopLocationUpdates();
            subscription.remove();
        };
    }, []);

    return (
        <LocationContext.Provider
            value={{
                location,
                loading,
                lastUpdated,
                hasPermission,
                requestPermission,
                getCurrentLocation
            }}
        >
            {children}
        </LocationContext.Provider>
    );
}



export const useLocation = () => {
    const context = useContext(LocationContext);
    if (context === undefined) throw new Error('useLocation must be used within a LocationProvider');
    return context;
}