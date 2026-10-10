from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import time

app = Flask(__name__)
CORS(app) 

def get_coordinates(city_name):
    url = f"https://nominatim.openstreetmap.org/search?q={city_name}&format=json&limit=1"
    headers = {'User-Agent': 'LocalLensHackathonProject/1.0'}
    
    response = requests.get(url, headers=headers).json()
    if len(response) > 0:
        return float(response[0]['lon']), float(response[0]['lat'])
    return None, None

@app.route('/api/route', methods=['GET'])
def get_route():
    start_city = request.args.get('start', 'Kolkata')
    dest_city = request.args.get('dest', 'Mandarmani')
    
    start_lon, start_lat = get_coordinates(start_city)
    time.sleep(1) 
    dest_lon, dest_lat = get_coordinates(dest_city)
    
    if not start_lon or not dest_lon:
        return jsonify({"status": "error", "message": "Could not find one of the cities."}), 400
        
    osrm_url = f"http://router.project-osrm.org/route/v1/driving/{start_lon},{start_lat};{dest_lon},{dest_lat}?overview=full&geometries=geojson"
    
    try:
        response = requests.get(osrm_url)
        data = response.json()
        
        if data.get('code') != 'Ok':
             return jsonify({"status": "error", "message": "No driving roads found between these locations."}), 400
             
        route_data = data['routes'][0]
        coordinates = route_data['geometry']['coordinates']
        leaflet_coords = [[lat, lon] for lon, lat in coordinates]
        
        # --- NEW: Extracting and calculating Distance & Time ---
        distance_km = round(route_data['distance'] / 1000, 1) # Convert meters to km
        duration_min = int(route_data['duration'] / 60) # Convert seconds to minutes
        
        # Format the time beautifully (e.g., "2 hr 15 min" instead of "135 min")
        if duration_min >= 60:
            hours = duration_min // 60
            mins = duration_min % 60
            time_str = f"{hours} hr {mins} min"
        else:
            time_str = f"{duration_min} min"
        
        # Send the new data to React
        return jsonify({
            "status": "success", 
            "path": leaflet_coords,
            "distance": f"{distance_km} km",
            "time": time_str
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": "Server error while calculating route."}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)