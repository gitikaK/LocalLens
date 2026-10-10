import { MapContainer, TileLayer, Polyline } from 'react-leaflet';

export default function MapComponent({ routeCoordinates }) {
  // Centers the map in West Bengal
  const center = [22.1187, 88.0325];

  return (
    <MapContainer center={center} zoom={9} style={{ height: '100vh', width: '100vw' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap'
      />
      {routeCoordinates && routeCoordinates.length > 0 && (
        <Polyline positions={routeCoordinates} color="#005C66" weight={6} />
      )}
    </MapContainer>
  );
}