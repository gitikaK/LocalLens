import { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// This tiny invisible component controls the camera animation
function RouteFramer({ coordinates }) {
  const map = useMap();

  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      // Calculates the boundary box that fits the entire route
      const bounds = L.latLngBounds(coordinates);
      // The "flyToBounds" method creates the swooping animation
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
    }
  }, [coordinates, map]);

  return null;
}

export default function MapComponent({ routeCoordinates }) {
  const center = [22.1187, 88.0325];

  return (
    // Width changed to 100% so it perfectly hugs your new sidebar
    <MapContainer center={center} zoom={9} style={{ height: '100%', width: '100%', zIndex: 1 }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap'
      />
      {routeCoordinates && routeCoordinates.length > 0 && (
        <>
          <Polyline positions={routeCoordinates} color="#005C66" weight={6} />
          <RouteFramer coordinates={routeCoordinates} />
        </>
      )}
    </MapContainer>
  );
}