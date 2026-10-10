import { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Safely loads the default Leaflet map pins
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// The camera animation component
function RouteFramer({ coordinates }) {
  const map = useMap();

  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
    }
  }, [coordinates, map]);

  return null;
}

export default function MapComponent({ routeCoordinates }) {
  const center = [22.1187, 88.0325];

  const startPoint = routeCoordinates && routeCoordinates.length > 0 ? routeCoordinates[0] : null;
  const endPoint = routeCoordinates && routeCoordinates.length > 0 ? routeCoordinates[routeCoordinates.length - 1] : null;

  return (
    <MapContainer center={center} zoom={9} style={{ height: '100%', width: '100%', zIndex: 1 }}>
      {/* NEW: The Premium CartoDB Positron Theme */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap'
      />
      {routeCoordinates && routeCoordinates.length > 0 && (
        <>
          <Polyline positions={routeCoordinates} color="#005C66" weight={6} />
          <RouteFramer coordinates={routeCoordinates} />
          
          <Marker position={startPoint}>
            <Popup>Start Location</Popup>
          </Marker>
          
          <Marker position={endPoint}>
            <Popup>Destination</Popup>
          </Marker>
        </>
      )}
    </MapContainer>
  );
}