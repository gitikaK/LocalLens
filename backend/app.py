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

def fetch_real_places(lat, lon, radius=10000):
    # Widen radius to 10km (10000m) to ensure we hit actual places on highways
    overpass_url = "https://overpass-api.de/api/interpreter"
    overpass_query = f"""
    [out:json][timeout:10];
    (
      node["amenity"="cafe"](around:{radius},{lat},{lon});
      node["amenity"="restaurant"](around:{radius},{lat},{lon});
      node["tourism"="viewpoint"](around:{radius},{lat},{lon});
    );
    out 3;
    """
    # Overpass actively blocks requests without a custom User-Agent
    headers = {'User-Agent': 'LocalLensHackathon_Gitika/1.0'}
    
    try:
        # Bumped timeout to 10 seconds to allow the database to search
        res = requests.post(overpass_url, data={'data': overpass_query}, headers=headers, timeout=10)
        res.raise_for_status() # Will trigger the except block if the server rejects us
        data = res.json()
        
        places = []
        for el in data.get('elements', []):
            tags = el.get('tags', {})
            name = tags.get('name')
            if name: 
                atype = tags.get('amenity', tags.get('tourism', 'local spot'))
                emoji = "☕" if atype == 'cafe' else "🥘" if atype == 'restaurant' else "📸" if atype == 'viewpoint' else "📍"
                places.append({
                    "name": name,
                    "location": [el['lat'], el['lon']],
                    "emoji": emoji,
                    "story": f"A real, verified {atype} discovered dynamically along your route."
                })
        return places
    except Exception as e:
        print(f"Dynamic API missed at {lat}, {lon}: {e}")
        return []

@app.route('/api/route', methods=['GET'])
def get_route():
    start_city = request.args.get('start', 'Kolkata')
    dest_city = request.args.get('dest', 'Digha')
    
    start_lon, start_lat = get_coordinates(start_city)
    time.sleep(1) 
    dest_lon, dest_lat = get_coordinates(dest_city)
    
    if not start_lon or not dest_lon:
        return jsonify({"status": "error", "message": "Could not find one of the cities."}), 400
        
    osrm_url = f"http://router.project-osrm.org/route/v1/driving/{start_lon},{start_lat};{dest_lon},{dest_lat}?overview=full&geometries=geojson&steps=true"
    
    try:
        response = requests.get(osrm_url)
        data = response.json()
        
        if data.get('code') != 'Ok':
             return jsonify({"status": "error", "message": "No driving roads found."}), 400
             
        route_data = data['routes'][0]
        coordinates = route_data['geometry']['coordinates']
        leaflet_coords = [[lat, lon] for lon, lat in coordinates]
        
        distance_km = round(route_data['distance'] / 1000, 1)
        duration_min = int(route_data['duration'] / 60)
        time_str = f"{duration_min // 60} hr {duration_min % 60} min" if duration_min >= 60 else f"{duration_min} min"

        instructions = []
        for step in route_data['legs'][0].get('steps', []):
            action = step.get('maneuver', {}).get('type', 'continue')
            road_name = step.get('name', '')
            dist = int(step.get('distance', 0))
            if action not in ['depart', 'arrive']:
                instructions.append(f"{action.capitalize()} {f'onto {road_name}' if road_name else 'forward'} ({dist}m)")
        
        # --- THE DYNAMIC PLACE FETCHER ---
        stops = []
        if len(leaflet_coords) > 30:
            # Algorithm: Sample the route at 25%, 50%, and 75% completion
            checkpoints = [
                leaflet_coords[len(leaflet_coords) // 4],
                leaflet_coords[len(leaflet_coords) // 2],
                leaflet_coords[(len(leaflet_coords) * 3) // 4]
            ]
            
            # Query the real world at those checkpoints
            for point in checkpoints:
                real_spots = fetch_real_places(point[0], point[1])
                if real_spots:
                    stops.extend(real_spots)
                    
        # Filter duplicates and limit to 4 so the UI stays clean
        unique_stops = list({stop['name']: stop for stop in stops}.values())[:4] 

        return jsonify({
            "status": "success", 
            "path": leaflet_coords,
            "distance": f"{distance_km} km",
            "time": time_str,
            "steps": instructions,
            "scenic_stops": unique_stops 
        })
        
    except Exception as e:
        print(f"Routing Error: {e}")
        return jsonify({"status": "error", "message": "Server error while calculating route."}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)