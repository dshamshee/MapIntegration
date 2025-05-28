import { useJsApiLoader, GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { useState, useEffect, useCallback } from 'react';

export const MapComponent = ({ onMapLoad, directionResponse }) => {
    const [loadError, setLoadError] = useState(/** @type google.maps.Map */ (null));
    const [userLocation, setUserLocation] = useState(null);
    const [map, setMap] = useState(null);
    const [watchId, setWatchId] = useState(null);

    const { isLoaded, loadError: apiLoadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API,
        libraries: ['places'],
        onError: (error) => setLoadError(error)
    });

    // Handle map load
    const handleMapLoad = useCallback((map) => {
        setMap(map);
        if (onMapLoad) onMapLoad(map);
    }, [onMapLoad]);

    useEffect(() => {
        // Start watching user's position with high accuracy
        if (navigator.geolocation && !watchId) {
            const id = navigator.geolocation.watchPosition(
                (position) => {
                    const newLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setUserLocation(newLocation);
                    
                    // If map is loaded and we're following the user, center the map
                    if (map && directionResponse) {
                        map.panTo(newLocation);
                    }
                },
                (error) => {
                    console.error("Error tracking location:", error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
            setWatchId(id);
        }

        // Cleanup function to stop watching location
        return () => {
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
                setWatchId(null);
            }
        };
    }, [map, directionResponse]);

    const center = userLocation || {
        lat: 25.5941,
        lng: 85.1376
    };
    
    const zoom = 15;

    if (loadError || apiLoadError) {
        return <div className="text-red-500 p-4">Error loading maps: {loadError?.message || apiLoadError?.message}</div>;
    }

    if (!isLoaded) {
        return <div className="flex items-center justify-center h-full">Loading maps...</div>;
    }
    
    return (
        <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
            <GoogleMap
                mapContainerStyle={{
                    width: '100%',
                    height: '60%',
                    position: 'absolute',
                    top: 0,
                    left: 0
                }}
                center={center}
                zoom={zoom}
                options={{
                    zoomControl: true,
                    streetViewControl: true,
                    mapTypeControl: true,
                    fullscreenControl: true,
                    rotateControl: true,
                    scaleControl: true
                }}
                onLoad={handleMapLoad}
            >
                {userLocation && <Marker 
                    position={userLocation}
                    icon={{
                        // eslint-disable-next-line no-undef
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: "#4285F4",
                        fillOpacity: 1,
                        strokeColor: "#ffffff",
                        strokeWeight: 2,
                    }}
                />}
                {directionResponse && (
                    <DirectionsRenderer 
                        directions={directionResponse}
                        options={{
                            suppressMarkers: false,
                            polylineOptions: {
                                strokeColor: "#2196F3",
                                strokeWeight: 6
                            }
                        }}
                    />
                )}
            </GoogleMap>
        </div>
    );
};
