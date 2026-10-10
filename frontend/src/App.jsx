import { useState } from 'react';
import MapComponent from './MapComponent';

export default function App() {
  const [startCity, setStartCity] = useState('');
  const [destCity, setDestCity] = useState('');
  const [route, setRoute] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault(); // Prevents the page from refreshing when you click submit
    setLoading(true);
    
    // Injecting the user's typed cities into the URL
    fetch(`http://localhost:5000/api/route?start=${startCity}&dest=${destCity}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "success" || data.status === "fallback") {
          setRoute(data.path);
        } else {
          alert("Could not find the route. Please try different cities.");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', margin: 0, fontFamily: 'sans-serif' }}>
      
      {/* The new left-side control panel */}
      <div style={{ width: '320px', padding: '24px', backgroundColor: '#f8f9fa', zIndex: 1000, boxShadow: '2px 0 10px rgba(0,0,0,0.1)' }}>
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
      </div>

      {/* The map takes up the rest of the screen space */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapComponent routeCoordinates={route} />
      </div>

    </div>
  );
}
