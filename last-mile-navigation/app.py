import os
from flask import Flask, render_template, request, jsonify
import googlemaps
import polyline
from math import radians, sin, cos, sqrt, atan2
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Get API key from environment variable
GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY')
if not GOOGLE_MAPS_API_KEY:
    raise ValueError("GOOGLE_MAPS_API_KEY environment variable is not set")

# Initialize Google Maps client
gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)


def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points on Earth.
    Returns distance in meters.
    
    Args:
        lat1, lon1: Coordinates of first point
        lat2, lon2: Coordinates of second point
    
    Returns:
        Distance in meters
    """
    # Earth radius in meters
    R = 6371000
    
    # Convert to radians
    lat1_rad = radians(lat1)
    lat2_rad = radians(lat2)
    delta_lat = radians(lat2 - lat1)
    delta_lon = radians(lon2 - lon1)
    
    # Haversine formula
    a = sin(delta_lat / 2) ** 2 + cos(lat1_rad) * cos(lat2_rad) * sin(delta_lon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    distance = R * c
    
    return distance


def find_optimal_dropoff_point(gmaps_client, route_polyline, destination_lat, destination_lng, cutoff_distance, destination_address):
    """
    Find the optimal drop-off point within the cutoff radius where driving time exceeds walking time.
    
    ENHANCED ALGORITHMIC LOGIC:
    1. Decode the polyline into a list of coordinate points
    2. Filter points that are within the cutoff_distance radius from destination
    3. For each candidate point within radius:
       a. Get driving time from point to destination (with current traffic)
       b. Get walking time from point to destination
       c. Calculate time difference (driving_time - walking_time)
    4. Select the point with maximum positive time difference (where driving is slowest vs walking)
    5. If no point has driving > walking, fall back to point closest to cutoff_distance
    
    Args:
        gmaps_client: Google Maps client instance
        route_polyline: Encoded polyline string from Google Directions API
        destination_lat: Destination latitude
        destination_lng: Destination longitude
        cutoff_distance: Maximum radius in meters from destination to search
        destination_address: Destination address string
    
    Returns:
        dict: Optimal drop-off point with coordinates, distance, and optimization reason
    """
    # Decode polyline into list of (lat, lng) tuples
    coordinates = polyline.decode(route_polyline)
    
    # Find all candidate points within the cutoff radius
    candidates = []
    for i in range(len(coordinates) - 1, -1, -1):
        point_lat, point_lng = coordinates[i]
        distance = haversine_distance(point_lat, point_lng, destination_lat, destination_lng)
        
        # Only consider points within the cutoff radius
        if distance <= cutoff_distance and distance >= 100:  # Minimum 100m from destination
            candidates.append({
                'index': i,
                'lat': point_lat,
                'lng': point_lng,
                'distance': distance
            })
    
    if not candidates:
        # No points found within radius, return point at cutoff distance
        for i in range(len(coordinates) - 1, -1, -1):
            point_lat, point_lng = coordinates[i]
            distance = haversine_distance(point_lat, point_lng, destination_lat, destination_lng)
            if distance >= cutoff_distance:
                return {
                    'lat': point_lat,
                    'lng': point_lng,
                    'actual_distance': distance,
                    'optimization': 'fallback',
                    'reason': 'No candidates within radius'
                }
    
    # Sample candidates for time comparison
    # Increase sampling to ensure we test points across the full distance range
    # Group candidates by distance buckets to ensure coverage
    distance_buckets = {}
    for candidate in candidates:
        bucket = int(candidate['distance'] // 50) * 50  # 50m buckets
        if bucket not in distance_buckets:
            distance_buckets[bucket] = []
        distance_buckets[bucket].append(candidate)
    
    # Sample points from each bucket to ensure coverage across distance range
    sampled_candidates = []
    for bucket in sorted(distance_buckets.keys(), reverse=True):  # Start from furthest
        bucket_candidates = distance_buckets[bucket]
        # Take 2-3 samples from each bucket
        samples_per_bucket = min(3, len(bucket_candidates))
        step = max(1, len(bucket_candidates) // samples_per_bucket)
        sampled_candidates.extend(bucket_candidates[::step][:samples_per_bucket])
    
    # Limit total samples to avoid too many API calls (max 20)
    sampled_candidates = sampled_candidates[:20]
    
    print(f"[DEBUG] Total candidates: {len(candidates)}, Sampled: {len(sampled_candidates)}")
    print(f"[DEBUG] Distance range: {candidates[-1]['distance']:.0f}m to {candidates[0]['distance']:.0f}m")
    
    best_candidate = None
    max_time_advantage = -float('inf')
    evaluation_results = []  # For debugging
    
    # Evaluate each candidate point
    for idx, candidate in enumerate(sampled_candidates):
        try:
            point_coords = f"{candidate['lat']},{candidate['lng']}"
            
            # Get driving time with traffic
            driving_result = gmaps_client.directions(
                point_coords,
                destination_address,
                mode="driving",
                departure_time="now"  # Use current traffic conditions
            )
            
            # Get walking time
            walking_result = gmaps_client.directions(
                point_coords,
                destination_address,
                mode="walking"
            )
            
            if driving_result and walking_result:
                # Extract durations in seconds
                driving_duration = driving_result[0]['legs'][0]['duration']['value']
                walking_duration = walking_result[0]['legs'][0]['duration']['value']
                
                # Calculate time advantage of walking over driving
                time_advantage = driving_duration - walking_duration
                
                # Store for debugging
                evaluation_results.append({
                    'distance': candidate['distance'],
                    'driving_time': driving_duration // 60,
                    'walking_time': walking_duration // 60,
                    'advantage': time_advantage // 60
                })
                
                print(f"[DEBUG] Point {idx+1}/{len(sampled_candidates)}: {candidate['distance']:.0f}m - "
                      f"Drive: {driving_duration//60}min, Walk: {walking_duration//60}min, "
                      f"Advantage: {time_advantage//60}min")
                
                # Prioritize points where driving takes longer than walking
                if time_advantage > max_time_advantage:
                    max_time_advantage = time_advantage
                    best_candidate = {
                        'lat': candidate['lat'],
                        'lng': candidate['lng'],
                        'actual_distance': candidate['distance'],
                        'driving_duration': driving_duration,
                        'walking_duration': walking_duration,
                        'time_advantage': time_advantage,
                        'optimization': 'time_optimized' if time_advantage > 0 else 'distance_based',
                        'reason': f'Walking saves {abs(time_advantage)//60} min vs driving' if time_advantage > 0 
                                 else f'Driving is {abs(time_advantage)//60} min faster'
                    }
        except Exception as e:
            # Log API call failures
            print(f"[DEBUG] API call failed for point at {candidate['distance']:.0f}m: {str(e)}")
            continue
    
    # Print summary
    if evaluation_results:
        print(f"[DEBUG] Best candidate: {best_candidate['actual_distance']:.0f}m with "
              f"{best_candidate['time_advantage']//60}min advantage")
    
    # If we found an optimized point, return it
    if best_candidate:
        return best_candidate
    
    
    # No point found where walking is faster than driving
    # User preference: suggest driving all the way
    print(f"[DEBUG] No point found with positive time advantage - suggesting drive-only")
    return None


@app.route('/')
def index():
    """Render the main page"""
    return render_template('index.html', api_key=GOOGLE_MAPS_API_KEY)


@app.route('/calculate-route', methods=['POST'])
def calculate_route():
    """
    Calculate both the full driving route and the hybrid route.
    
    Expected JSON input:
    {
        "origin": "Address or coordinates",
        "destination": "Address or coordinates",
        "cutoff_distance": 500  // in meters
    }
    
    Returns JSON with:
    - full_drive_route: Complete driving directions
    - hybrid_route: Driving leg + walking leg
    - dropoff_point: Coordinates where user stops driving
    """
    try:
        data = request.json
        origin = data.get('origin')
        destination = data.get('destination')
        cutoff_distance = float(data.get('cutoff_distance', 500))
        
        # Validate input
        if not origin or not destination:
            return jsonify({'error': 'Origin and destination are required'}), 400
        
        # Step 1: Get full driving route
        directions_result = gmaps.directions(
            origin,
            destination,
            mode="driving"
        )
        
        if not directions_result:
            return jsonify({'error': 'No route found'}), 404
        
        # Extract the main route
        route = directions_result[0]
        legs = route['legs'][0]
        
        # Get destination coordinates
        dest_location = legs['end_location']
        destination_lat = dest_location['lat']
        destination_lng = dest_location['lng']
        
        # Step 2: Extract and decode polyline
        route_polyline = route['overview_polyline']['points']
        
        # Step 3-5: Find optimal drop-off point within radius
        # New algorithm searches for best point where driving time > walking time
        dropoff_point = find_optimal_dropoff_point(
            gmaps,
            route_polyline,
            destination_lat,
            destination_lng,
            cutoff_distance,
            destination
        )
        
        if not dropoff_point:
            # No optimal drop-off point found - recommend driving all the way
            return jsonify({
                'recommendation': 'drive_only',
                'full_drive_route': {
                    'polyline': route_polyline,
                    'distance': legs['distance']['text'],
                    'duration': legs['duration']['text']
                },
                'message': 'No optimal drop-off point found. Driving all the way is recommended as it saves time compared to any walking option within your specified radius.'
            })
        
        # Step 6: Calculate walking route from drop-off point to destination
        walking_directions = gmaps.directions(
            f"{dropoff_point['lat']},{dropoff_point['lng']}",
            destination,
            mode="walking"
        )
        
        # Prepare response
        response = {
            'recommendation': 'hybrid',
            'full_drive_route': {
                'polyline': route_polyline,
                'distance': legs['distance']['text'],
                'duration': legs['duration']['text']
            },
            'hybrid_route': {
                'driving_leg': {
                    # For driving leg, we use the portion from origin to drop-off point
                    'origin': origin,
                    'dropoff': dropoff_point,
                    'polyline': route_polyline  # Frontend will draw up to drop-off point
                },
                'walking_leg': {
                    'polyline': walking_directions[0]['overview_polyline']['points'] if walking_directions else None,
                    'distance': walking_directions[0]['legs'][0]['distance']['text'] if walking_directions else 'N/A',
                    'duration': walking_directions[0]['legs'][0]['duration']['text'] if walking_directions else 'N/A'
                }
            },
            'dropoff_point': {
                'lat': dropoff_point['lat'],
                'lng': dropoff_point['lng'],
                'distance_from_destination': f"{dropoff_point['actual_distance']:.0f} meters",
                'optimization_type': dropoff_point.get('optimization', 'unknown'),
                'optimization_reason': dropoff_point.get('reason', 'N/A'),
                'time_saved': f"{dropoff_point.get('time_advantage', 0)//60} minutes" if dropoff_point.get('time_advantage') else 'N/A'
            }
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
