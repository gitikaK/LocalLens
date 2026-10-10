from flask import Flask, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app) 

@app.route('/api/route', methods=['GET'])
def get_route():
    # Kolkata to Mandarmani coordinates
    start_lon, start_lat = 88.3639, 22.5726 
    dest_lon, dest_lat = 87.7012, 21.6649
    
    # Free OSRM routing API (No Google keys needed)
    osrm_url = f"http://router.project-osrm.org/route/v1/driving/{start_lon},{start_lat};{dest_lon},{dest_lat}?overview=full&geometries=geojson"
    
    try:
        response = requests.get(osrm_url)
        data = response.json()
        coordinates = data['routes'][0]['geometry']['coordinates']
        
        # Flip Lon/Lat to Lat/Lon for our React map
        leaflet_coords = [[lat, lon] for lon, lat in coordinates]
        return jsonify({"status": "success", "path": leaflet_coords})
    except Exception:
        # Fallback straight line just in case the venue WiFi drops
        return jsonify({
            "status": "fallback", 
            "path": [[22.5726, 88.3639], [21.6649, 87.7012]]
        })

if __name__ == '__main__':
    app.run(debug=True, port=5000)