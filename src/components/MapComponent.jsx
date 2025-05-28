import { useJsApiLoader, GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { useState, useEffect } from 'react';

export const MapComponent = ({ onMapLoad, directionResponse }) => {
    const [loadError, setLoadError] = useState(/** @type google.maps.Map */ (null));
    const [userLocation, setUserLocation] = useState(null);

    const { isLoaded, loadError: apiLoadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API,
        libraries: ['places'],
        onError: (error) => setLoadError(error)
    });

    useEffect(() => {
        // Get user's current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        }
    }, [userLocation]);

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
                    fullscreenControl: true
                }}
                onLoad={onMapLoad}
            >
                {userLocation && <Marker 
                    position={userLocation}
                    icon={{
                        url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
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
