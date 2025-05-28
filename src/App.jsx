import { InputSection } from "./components/InputSection";
import { MapComponent } from "./components/MapComponent";
import { useState } from "react";

function App() {
  const [map, setMap] = useState(null);
  const [directionResponse, setDirectionResponse] = useState(null);

  const handleSetCenter = () => {
    if (map) {
      const center = {
        lat: 25.5941,
        lng: 85.1376
      };
      map.panTo(center);
    }
  };

  return (
    <div data-theme="dark">
      <InputSection 
        setDirectionResponse={setDirectionResponse} 
        directionResponse={directionResponse}
        onCenterClick={handleSetCenter} 
      />
      <MapComponent onMapLoad={setMap} directionResponse={directionResponse} />
    </div>
  );
}

export default App;
