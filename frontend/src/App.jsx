import { useState } from 'react';
import MapComponent from './MapComponent';

export default function App() {
  const [startCity, setStartCity] = useState('');
  const [destCity, setDestCity] = useState('');
  const [route, setRoute] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tripDetails, setTripDetails] = useState(null); 
  const [steps, setSteps] = useState([]); 
  const [scenicStops, setScenicStops] = useState([]); 

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setError("Your browser does not support geolocation.");
      return;
    }
    setStartCity("Locating...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`)
          .then(res => res.json())
          .then(data => {
            setStartCity(data.address.city || data.address.town || data.address.state || "My Location");
            setError('');
          })
          .catch(() => {
            setStartCity("");
            setError("Could not pinpoint exact location.");
          });
      },
      () => {
        setStartCity("");
        setError("Location access denied.");
      }
    );
  };

  const handleSearch = (e) => {
    e.preventDefault(); 
    setLoading(true);
    setError('');
    setTripDetails(null);
    setSteps([]); 
    setScenicStops([]);
    
    fetch(`http://localhost:5000/api/route?start=${startCity}&dest=${destCity}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          setRoute(data.path);
          setTripDetails({ distance: data.distance, time: data.time }); 
          setSteps(data.steps || []); 
          setScenicStops(data.scenic_stops || []); 
        } else {
          setError(data.message || "Could not find route.");
          setRoute([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Server error. Ensure Python backend is running.");
        setLoading(false);
      });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', margin: 0, fontFamily: 'sans-serif' }}>
      
      <div style={{ width: '340px', padding: '24px', backgroundColor: '#f8f9fa', zIndex: 1000, boxShadow: '2px 0 10px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ color: '#005C66', margin: '0 0 24px 0', fontSize: '28px', flexShrink: 0 }}>LocalLens</h1>
        
        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexShrink: 0 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontWeight: '600', color: '#333' }}>Start</label>
              <span onClick={handleGeolocate} style={{ color: '#005C66', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>📍 Locate Me</span>
            </div>
            <input type="text" value={startCity} onChange={(e) => setStartCity(e.target.value)} style={{ width: '92%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} required />
          </div>
          <div>
            <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px', color: '#333' }}>Destination</label>
            <input type="text" value={destCity} onChange={(e) => setDestCity(e.target.value)} style={{ width: '92%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} required />
          </div>

          {error && <div style={{ backgroundColor: '#fde8e8', color: '#c81e1e', padding: '10px', borderRadius: '6px', fontSize: '14px', border: '1px solid #f8b4b4' }}>{error}</div>}

          <button type="submit" disabled={loading} style={{ backgroundColor: loading ? '#66b2b8' : '#005C66', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', cursor: loading ? 'wait' : 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' }}>
            {loading ? 'Routing...' : 'Find Route'}
          </button>
        </form>

        <div style={{ flex: 1, overflowY: 'auto', marginTop: '24px', paddingRight: '8px' }}>
          
          {tripDetails && (
            <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '16px' }}>Trip Summary</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '15px' }}><span style={{ color: '#666', fontWeight: '500' }}>Distance:</span><span style={{ color: '#005C66', fontWeight: 'bold' }}>{tripDetails.distance}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}><span style={{ color: '#666', fontWeight: '500' }}>Est. Time:</span><span style={{ color: '#005C66', fontWeight: 'bold' }}>{tripDetails.time}</span></div>
            </div>
          )}

          {scenicStops.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#005C66', fontSize: '15px' }}>✨ Traveler Stories on Route</h4>
              {scenicStops.map((stop, index) => (
                <div key={index} style={{ backgroundColor: '#fff8f0', padding: '12px', borderRadius: '8px', marginBottom: '12px', borderLeft: '4px solid #ff9f1c' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{stop.emoji} {stop.name}</div>
                  <div style={{ fontSize: '13px', color: '#555', fontStyle: 'italic' }}>{stop.story}</div>
                </div>
              ))}
            </div>
          )}

          {steps.length > 0 && (
            <div>
              <h4 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '15px' }}>Directions</h4>
              <ol style={{ paddingLeft: '20px', margin: 0, color: '#444', fontSize: '13px', lineHeight: '1.6' }}>
                {steps.map((step, index) => (
                  <li key={index} style={{ marginBottom: '8px' }}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <MapComponent routeCoordinates={route} scenicStops={scenicStops} />
      </div>

    </div>
  );
}