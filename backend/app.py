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
    
    # Catch bad city names
    if not start_lon or not dest_lon:
        return jsonify({"status": "error", "message": "Could not find one of the cities."}), 400
        
    osrm_url = f"http://router.project-osrm.org/route/v1/driving/{start_lon},{start_lat};{dest_lon},{dest_lat}?overview=full&geometries=geojson"
    
    try:
        response = requests.get(osrm_url)
        data = response.json()
        
        # Catch impossible driving routes (like crossing oceans)
        if data.get('code') != 'Ok':
             return jsonify({"status": "error", "message": "No driving roads found between these locations."}), 400
             
        coordinates = data['routes'][0]['geometry']['coordinates']
        leaflet_coords = [[lat, lon] for lon, lat in coordinates]
        
        return jsonify({"status": "success", "path": leaflet_coords})
        
    except Exception as e:
        # We removed the fallback route. Now it fails honestly.
        return jsonify({"status": "error", "message": "Server error while calculating route."}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)