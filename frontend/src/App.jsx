import { useState } from 'react';
import MapComponent from './MapComponent';

export default function App() {
  const [startCity, setStartCity] = useState('');
  const [destCity, setDestCity] = useState('');
  const [route, setRoute] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // NEW: State to hold our distance and time data
  const [tripDetails, setTripDetails] = useState(null); 

  const handleSearch = (e) => {
    e.preventDefault(); 
    setLoading(true);
    setError('');
    setTripDetails(null); // Clear old trip details on a new search
    
    fetch(`http://localhost:5000/api/route?start=${startCity}&dest=${destCity}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          setRoute(data.path);
          // NEW: Save the distance and time from the Python server
          setTripDetails({ distance: data.distance, time: data.time }); 
        } else {
          setError(data.message || "Could not find the route.");
          setRoute([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Server error. Ensure the Python backend is running.");
        setLoading(false);
      });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', margin: 0, fontFamily: 'sans-serif' }}>
      
      <div style={{ width: '320px', padding: '24px', backgroundColor: '#f8f9fa', zIndex: 1000, boxShadow: '2px 0 10px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ color: '#005C66', margin: '0 0 24px 0', fontSize: '28px' }}>LocalLens</h1>
        
        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px', color: '#333' }}>Start City</label>
            <input 
              type="text" 
              value={startCity}
              onChange={(e) => setStartCity(e.target.value)}
              placeholder="e.g. Mumbai"
              style={{ width: '92%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px' }}
              required
            />
          </div>
          
          <div>
            <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px', color: '#333' }}>Destination</label>
            <input 
              type="text" 
              value={destCity}
              onChange={(e) => setDestCity(e.target.value)}
              placeholder="e.g. Pune"
              style={{ width: '92%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px' }}
              required
            />
          </div>

          {error && (
            <div style={{ backgroundColor: '#fde8e8', color: '#c81e1e', padding: '10px', borderRadius: '6px', fontSize: '14px', border: '1px solid #f8b4b4', fontWeight: '500' }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              backgroundColor: loading ? '#66b2b8' : '#005C66', 
              color: 'white', 
              padding: '12px', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: loading ? 'wait' : 'pointer', 
              fontWeight: 'bold',
              fontSize: '16px',
              marginTop: '10px'
            }}>
            {loading ? 'Routing...' : 'Find Route'}
          </button>
        </form>

        {/* NEW: The Trip Summary Card. It only appears if we have data to show. */}
        {tripDetails && (
          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '16px' }}>Trip Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '15px' }}>
              <span style={{ color: '#666', fontWeight: '500' }}>Distance:</span>
              <span style={{ color: '#005C66', fontWeight: 'bold' }}>{tripDetails.distance}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
              <span style={{ color: '#666', fontWeight: '500' }}>Est. Time:</span>
              <span style={{ color: '#005C66', fontWeight: 'bold' }}>{tripDetails.time}</span>
            </div>
          </div>
        )}

      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <MapComponent routeCoordinates={route} />
      </div>

    </div>
  );
}
