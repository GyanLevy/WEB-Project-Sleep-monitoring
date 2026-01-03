# Last-Mile Walking Navigation Prototype

A Flask-based web application that calculates hybrid driving and walking routes using Google Maps API. The app allows users to drive most of the way to their destination and walk the final distance.

## Features

- **Full Drive Route**: Standard driving directions from origin to destination
- **Hybrid Route**: Drive to a drop-off point, then walk the remaining distance
- **Visual Map Display**:
  - Blue line: Driving route
  - Green dotted line: Walking route
  - Red marker: Drop-off point
- **Customizable Cutoff Distance**: Specify how far from the destination you want to start walking

## How It Works

### Algorithmic Logic

1. Fetch the standard driving route from Origin to Destination using Google Directions API
2. Extract the route's polyline (encoded string representing the path geometry)
3. Decode the polyline into a list of coordinate points (Lat, Lng)
4. **Iterate backwards** through these points, starting from the Destination towards the Origin
5. Calculate the distance between each point and the Destination using the Haversine formula
6. Stop at the first point where the distance is greater than or equal to the user's "Cutoff Distance"
7. Mark this coordinate as the "Drop-off Point"
8. Calculate a new walking route from this Drop-off Point to the Destination

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- Google Cloud Platform account
- Google Maps API key with the following APIs enabled:
  - Directions API
  - Maps JavaScript API

### Installation

1. Clone or download this project

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Set up your API key:
   - Copy `.env.example` to `.env`
   - Add your Google Maps API key to the `.env` file:
   ```
   GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

### Running the Application

1. Set the environment variable (Windows PowerShell):

```powershell
$env:GOOGLE_MAPS_API_KEY="your_actual_api_key_here"
```

Or on Windows CMD:

```cmd
set GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

Or use a `.env` file with python-dotenv (recommended):

```python
# Add to app.py
from dotenv import load_dotenv
load_dotenv()
```

2. Run the Flask application:

```bash
python app.py
```

3. Open your browser and navigate to:

```
http://localhost:5000
```

## Usage

1. Enter your **Origin** address
2. Enter your **Destination** address
3. Set the **Cutoff Distance** in meters (default: 500m)
4. Click **Calculate Routes**
5. View both routes on the map:
   - The full driving route
   - The hybrid route with driving and walking segments
6. Check the route information panel for distances and durations

## Project Structure

```
last-mile-navigation/
├── app.py                  # Flask backend with route calculation logic
├── templates/
│   └── index.html          # Frontend with Google Maps integration
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variable template
└── README.md              # This file
```

## Technical Details

### Backend (app.py)

- **Flask Framework**: Handles HTTP requests and serves the frontend
- **Google Maps Client**: Interfaces with Google Directions API
- **Haversine Formula**: Calculates accurate distances between coordinates
- **Polyline Decoding**: Converts encoded route strings to coordinate arrays
- **Backwards Iteration**: Core algorithm to find optimal drop-off point

### Frontend (index.html)

- **Google Maps JavaScript API**: Renders interactive map
- **Polyline Visualization**: Displays routes with different colors and styles
- **Responsive Design**: Clean UI with gradient backgrounds and smooth animations
- **AJAX Communication**: Asynchronous route calculation without page reload

## API Endpoints

### `GET /`

Renders the main application page

### `POST /calculate-route`

Calculates both routes based on user input

**Request Body:**

```json
{
  "origin": "New York, NY",
  "destination": "Brooklyn, NY",
  "cutoff_distance": 500
}
```

**Response:**

```json
{
  "full_drive_route": {
    "polyline": "encoded_polyline_string",
    "distance": "5.2 km",
    "duration": "15 mins"
  },
  "hybrid_route": {
    "driving_leg": { ... },
    "walking_leg": {
      "polyline": "encoded_polyline_string",
      "distance": "500 m",
      "duration": "6 mins"
    }
  },
  "dropoff_point": {
    "lat": 40.7128,
    "lng": -74.0060,
    "distance_from_destination": "500 meters"
  }
}
```

## Notes

- API key must have appropriate quotas for Directions API calls
- Walking routes may differ slightly from actual walking paths
- Cutoff distance should be reasonable (50m - 5000m recommended)
- The app uses Haversine distance (great circle distance) for accuracy

## License

This is a prototype for educational purposes.
