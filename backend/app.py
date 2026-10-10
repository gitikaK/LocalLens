from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import time

app = Flask(__name__)
CORS(app) 

def get_coordinates(city_name):
    # Free tool to turn city names into coordinates (No API key needed)
    url = f"https://nominatim.openstreetmap.org/search?q={city_name}&format=json&limit=1"
    # We must include a User-Agent or the free server will block us
    headers = {'User-Agent': 'LocalLensHackathonProject/1.0'}
    
    response = requests.get(url, headers=headers).json()
    if len(response) > 0:
        return float(response[0]['lon']), float(response[0]['lat'])
    return None, None

@app.route('/api/route', methods=['GET'])
def get_route():
    # Look for cities requested by the website. If blank, default to our MVP route.
    start_city = request.args.get('start', 'Kolkata')
    dest_city = request.args.get('dest', 'Mandarmani')
    
    # 1. Translate the words into coordinates
    start_lon, start_lat = get_coordinates(start_city)
    time.sleep(1) # We must wait 1 second between requests so the free tool doesn't ban us
    dest_lon, dest_lat = get_coordinates(dest_city)
    
    if not start_lon or not dest_lon:
        return jsonify({"status": "error", "message": "Could not find one of the cities"}), 400
        
    # 2. Ask OSRM for the driving route between those coordinates
    osrm_url = f"http://router.project-osrm.org/route/v1/driving/{start_lon},{start_lat};{dest_lon},{dest_lat}?overview=full&geometries=geojson"
    
    try:
        response = requests.get(osrm_url)
        data = response.json()
        coordinates = data['routes'][0]['geometry']['coordinates']
        
        # 3. Flip Lon/Lat to Lat/Lon for our React map
        leaflet_coords = [[lat, lon] for lon, lat in coordinates]
        return jsonify({"status": "success", "path": leaflet_coords})
    except Exception:
        return jsonify({"status": "fallback", "path": [[22.5726, 88.3639], [21.6649, 87.7012]]})

if __name__ == '__main__':
    app.run(debug=True, port=5000)