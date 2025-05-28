import { useJsApiLoader, GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { useState } from 'react';

export const MapComponent = ({ onMapLoad, directionResponse }) => {
    const [loadError, setLoadError] = useState(/** @type google.maps.Map */ (null));

    const { isLoaded, loadError: apiLoadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API,
        libraries: ['places'],
        onError: (error) => setLoadError(error)
    });

    const center = {
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
                <Marker position={center} />
                {directionResponse && <DirectionsRenderer directions={directionResponse}/>}
            </GoogleMap>
        </div>
    );
};
