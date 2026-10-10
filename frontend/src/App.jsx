import { useState } from 'react';
import MapComponent from './MapComponent';
import './App.css'; 

export default function App() {
  const [startCity, setStartCity] = useState('');
  const [destCity, setDestCity] = useState('');
  const [route, setRoute] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tripDetails, setTripDetails] = useState(null); 
  const [steps, setSteps] = useState([]); 
  const [scenicStops, setScenicStops] = useState([]); 
  const [isDarkMode, setIsDarkMode] = useState(true); // Defaulting to the cool dark mode

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
    <div className={`app-layout ${isDarkMode ? 'dark-mode' : ''}`}>
      
      {/* 1. Map is now the fullscreen background */}
      <div className="map-background">
        <MapComponent routeCoordinates={route} scenicStops={scenicStops} />
      </div>

      {/* 2. UI is a floating glass panel hovering on top */}
      <div className="floating-panel">
        
        <div className="panel-header">
          <div className="mobile-handle"></div>
          <div className="header-row">
            <h1 className="brand-title">LocalLens</h1>
            <button 
              type="button" 
              className="theme-toggle" 
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
          
          <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="input-label">
              <span>Start City</span>
              <span onClick={handleGeolocate} style={{ color: '#2dd4bf', cursor: 'pointer', textTransform: 'none' }}>📍 Locate Me</span>
            </div>
            <input 
              type="text" 
              value={startCity} 
              onChange={(e) => setStartCity(e.target.value)} 
              className="modern-input"
              placeholder="Where are you starting?" 
              required 
            />
            
            <div className="input-label">
              <span>Destination</span>
            </div>
            <input 
              type="text" 
              value={destCity} 
              onChange={(e) => setDestCity(e.target.value)} 
              className="modern-input"
              placeholder="Where to?" 
              required 
            />

            {error && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '16px', borderRadius: '12px', fontSize: '14px', marginBottom: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? 'Analyzing Route...' : 'Discover Route'}
            </button>
          </form>
        </div>

        {/* Scrollable area for results */}
        <div className="panel-scroll-area">
          {tripDetails && (
            <div className="story-card" style={{ borderLeft: 'none', background: 'rgba(45, 212, 191, 0.05)', border: '1px solid rgba(45, 212, 191, 0.2)' }}>
              <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-main)', fontSize: '18px', fontWeight: '700' }}>Trip Summary</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '15px' }}>
                <span style={{ color: 'var(--text-sub)', fontWeight: '500' }}>Total Distance</span>
                <span style={{ color: '#2dd4bf', fontWeight: '700' }}>{tripDetails.distance}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                <span style={{ color: 'var(--text-sub)', fontWeight: '500' }}>Estimated Time</span>
                <span style={{ color: '#2dd4bf', fontWeight: '700' }}>{tripDetails.time}</span>
              </div>
            </div>
          )}

          {scenicStops.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-main)', fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>✨ Experiences</h4>
              {scenicStops.map((stop, index) => (
                <div 
                  key={index} 
                  className="story-card"
                  style={{ animationDelay: `${index * 0.15}s` }} 
                >
                  <div className="story-card-title">{stop.emoji} {stop.name}</div>
                  <div className="story-card-text">{stop.story}</div>
                </div>
              ))}
            </div>
          )}

          {steps.length > 0 && (
            <div>
              <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-main)', fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Directions</h4>
              <ol className="directions-list" style={{ paddingLeft: '20px', margin: 0, color: 'var(--text-sub)', fontSize: '15px', lineHeight: '1.8' }}>
                {steps.map((step, index) => (
                  <li key={index} style={{ marginBottom: '12px', animationDelay: `${index * 0.04}s` }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}