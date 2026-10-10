import { useState, useEffect } from 'react';
import MapComponent from './MapComponent';

export default function App() {
  const [route, setRoute] = useState([]);

  useEffect(() => {
    // This makes React ask your Python server for the directions
    fetch('http://localhost:5000/api/route')
      .then(res => res.json())
      .then(data => setRoute(data.path))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ margin: 0, padding: 0, height: "100vh", width: "100vw" }}>
      <MapComponent routeCoordinates={route} />
    </div>
  );
}
