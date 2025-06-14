# Weather Information API

A simple RESTful API that retrieves and returns weather data for specific cities using the Open-Meteo API. The project integrates with third-party weather services, caches data in MongoDB, and provides real-time updates via WebSocket with STOMP.

## Tech Stack
- **Backend Framework**: Express.js
- **Runtime**: Node.js
- **Database**: MongoDB
- **Real-Time Streaming**: WebSocket with STOMP
- **External API**: Open-Meteo (weather data) and Nominatim (geocoding)

## Prerequisites
- **Node.js**: Version 14 or higher
- **MongoDB**: Local installation or a MongoDB Atlas account
- **Git**: For cloning the repository

## Installation
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/alokmemishra/weather-api.git
   cd weather-api
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up MongoDB**:
   - If using a local MongoDB instance, ensure it's running:
     ```bash
     brew services start mongodb-community
     ```
   - Alternatively, set up a MongoDB Atlas cluster and update the connection string in `index.js`.

4. **Update Nominatim User-Agent**:
   In `services/weatherService.js`, update the `User-Agent` header for Nominatim requests:
   ```javascript
   'User-Agent': 'WeatherAPI/1.0 (your-email@example.com)'
   ```
   Replace `your-email@example.com` with your email to comply with Nominatim's usage policy.

5. **Run the Application**:
   ```bash
   node index.js
   ```
   The server will start on `http://localhost:3000`, and the WebSocket server will run on `ws://localhost:8080`.

## API Usage
The API provides an endpoint to fetch weather data for a specific city.

- **Endpoint**: `GET /api/weather/:city`
- **Example Request**:
  ```bash
  curl http://localhost:3000/api/weather/London
  ```
- **Example Response**:
  ```json
  {
    "city": "London",
    "temperature": 14.5,
    "humidity": 78,
    "description": "partly cloudy",
    "forecast": [
      {
        "date": "2025-06-14",
        "temperature": 16.2,
        "description": "overcast"
      },
      // More forecast entries...
    ],
    "lastUpdated": "2025-06-14T15:22:00.000Z"
  }
  ```

## Real-Time Updates with WebSocket
The API broadcasts weather updates for selected cities (London, New York, Tokyo) every 10 minutes via WebSocket using STOMP.

- **WebSocket URL**: `ws://localhost:8080`
- **STOMP Topic**: `/topic/weather`
- **Example Client (JavaScript)**:
  ```javascript
  const Stomp = require('@stomp/stompjs');
  const client = new Stomp.Client({
    brokerURL: 'ws://localhost:8080',
    onConnect: () => {
      client.subscribe('/topic/weather', message => {
        console.log('Weather Update:', JSON.parse(message.body));
      });
    },
  });
  client.activate();
  ```

## Contributing
1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature`.
3. Make changes and commit: `git commit -m "Add your feature"`.
4. Push to your branch: `git push origin feature/your-feature`.
5. Create a pull request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
