import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { useState, useRef, useEffect } from "react";

export const InputSection = ({
  onCenterClick,
  setDirectionResponse,
  directionResponse,
}) => {
  const [loadError, setLoadError] = useState(/** @type google.maps.Map */ (null));
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [navigationInterval, setNavigationInterval] = useState(null);

  /** @type React.MutableRefObject<HTMLInputElement> */
  const yourLocationRef = useRef(null);

  /** @type React.MutableRefObject<HTMLInputElement> */
  const destinationRef = useRef(null);

  const { isLoaded, loadError: apiLoadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API,
    libraries: ["places"],
    onError: (error) => setLoadError(error),
  });

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLocation);
          
          // If we're navigating, update the route
          if (isNavigating) {
            updateRouteFromCurrentLocation(newLocation);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, [isNavigating]);

  const updateRouteFromCurrentLocation = async (currentPosition) => {
    try {
      // eslint-disable-next-line no-undef
      const directionsService = new google.maps.DirectionsService();
      const results = await directionsService.route({
        origin: currentPosition,
        destination: destinationRef.current.value,
        // eslint-disable-next-line no-undef
        travelMode: google.maps.TravelMode.DRIVING,
      });
      setDirectionResponse(results);
      setDistance(results.routes[0].legs[0].distance.text);
      setDuration(results.routes[0].legs[0].duration.text);
    } catch (error) {
      console.error("Error updating route:", error);
    }
  };

  const calculateDirection = async () => {
    if (
      yourLocationRef.current.value === "" ||
      destinationRef.current.value === ""
    ) {
      alert("Please enter both location and destination");
      return;
    }

    try {
      // eslint-disable-next-line no-undef
      const directionsService = new google.maps.DirectionsService();
      const results = await directionsService.route({
        origin: yourLocationRef.current.value,
        destination: destinationRef.current.value,
        // eslint-disable-next-line no-undef
        travelMode: google.maps.TravelMode.DRIVING,
      });
      setDirectionResponse(results);
      setDistance(results.routes[0].legs[0].distance.text);
      setDuration(results.routes[0].legs[0].duration.text);
    } catch (error) {
      alert("Could not calculate directions: " + error.message);
    }
  };

  const startNavigation = async () => {
    if (!directionResponse) {
      alert("Please calculate direction first!");
      return;
    }

    try {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
      }

      setIsNavigating(true);

      // Set up interval to update route every 10 seconds
      const intervalId = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const currentPosition = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            updateRouteFromCurrentLocation(currentPosition);
          },
          (error) => {
            console.error("Error getting location:", error);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      }, 10000); // Update every 10 seconds

      setNavigationInterval(intervalId);
    } catch (error) {
      alert("Navigation error: " + error.message);
      setIsNavigating(false);
    }
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    if (navigationInterval) {
      clearInterval(navigationInterval);
      setNavigationInterval(null);
    }
    calculateDirection(); // Recalculate the original route
  };

  const handleUserLocation = () => {
    if (userLocation) {
      yourLocationRef.current.value = `${userLocation.lat},${userLocation.lng}`;
    }
  };

  const clearRoute = () => {
    setDirectionResponse(null);
    setDuration("");
    setDistance("");
    setIsNavigating(false);
    if (navigationInterval) {
      clearInterval(navigationInterval);
      setNavigationInterval(null);
    }
    yourLocationRef.current.value = "";
    destinationRef.current.value = "";
  };

  if (loadError || apiLoadError) {
    return (
      <div className="text-red-500 p-4">
        Error loading maps: {loadError?.message || apiLoadError?.message}
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading maps...
      </div>
    );
  }

  return (
    <div className="mainContainer flex flex-col justify-center items-center rounded-lg p-4">
      <h1 className="text-white text-2xl font-bold">Google Map Navigation</h1>
      <div className="innerContainer bg-gray-800 rounded-lg w-[50%] p-5 flex flex-col justify-between gap-1">
        <div className="placeInput rounded-lg p-2 w-full flex justify-between items-center gap-5">
          <div className="inputes flex justify-between w-full">
            <Autocomplete>
              <input
                type="text"
                ref={yourLocationRef}
                placeholder="Your Location"
                className="border w-full rounded-md px-2 py-1 border-gray-500"
              />
            </Autocomplete>
            <p>to</p>
            <Autocomplete>
              <input
                type="text"
                ref={destinationRef}
                placeholder="Destination"
                className="border w-full rounded-md px-2 py-1 border-gray-500"
              />
            </Autocomplete>
          </div>
          <div className="buttons flex gap-2">
            <button
              onClick={calculateDirection}
              className="btn btn-outline btn-sm text-white rounded-md px-5 py-1"
            >
              Direction
            </button>
            <button
              onClick={clearRoute}
              className="btn btn-outline btn-sm text-white rounded-md px-5 py-1"
            >
              Clear
            </button>
            {!isNavigating ? (
              <button
                onClick={startNavigation}
                className="btn btn-outline btn-sm text-white rounded-md px-5 py-1"
              >
                Navigate
              </button>
            ) : (
              <button
                onClick={stopNavigation}
                className="btn btn-error btn-sm text-white rounded-md px-5 py-1"
              >
                Stop
              </button>
            )}
          </div>
        </div>

        <div className="valueContainer rounded-lg p-2 w-full flex justify-between items-center gap-5">
          <div className="info">
            <p>Distance: {distance}</p>
            <p>Time: {duration}</p>
            {isNavigating && <p className="text-green-500">Navigation Active</p>}
          </div>

          <div className="buttons flex gap-2">
            <button
              onClick={handleUserLocation}
              className="btn btn-outline btn-sm px-5 text-white rounded-md py-1"
            >
              Your Location
            </button>
            <button
              className="btn btn-outline btn-sm px-5 text-white rounded-md py-1"
              onClick={onCenterClick}
            >
              Center
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
