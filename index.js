const express = require('express');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const { Client } = require('@stomp/stompjs');
const weatherRouter = require('./routes/weather');
const weatherService = require('./services/weatherService');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/api', weatherRouter);

// Connect to MongoDB
mongoose.connect('mongodb://localhost/weather-api', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Set up WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
  console.log('Client connected to WebSocket');

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// STOMP client to broadcast updates
const stompClient = new Client({
  brokerURL: 'ws://localhost:8080',
  onConnect: () => {
    console.log('Connected to STOMP broker');
  },
});

stompClient.activate();

// Periodically fetch weather and broadcast updates
setInterval(async () => {
  const cities = ['London', 'New York', 'Tokyo'];
  for (const city of cities) {
    const weatherData = await weatherService.getWeather(city);
    stompClient.publish({
      destination: '/topic/weather',
      body: JSON.stringify({ city, weather: weatherData }),
    });
  }
}, 10 * 60 * 1000); // Update every 10 minutes

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
