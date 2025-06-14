const axios = require('axios');
const Weather = require('../models/Weather');

class WeatherService {
  constructor() {
    this.geocodingBaseUrl = 'https://nominatim.openstreetmap.org/search';
    this.weatherBaseUrl = 'https://api.open-meteo.com/v1/forecast';
  }

  async getCoordinates(city) {
    const response = await axios.get(this.geocodingBaseUrl, {
      params: {
        q: city,
        format: 'json',
        limit: 1,
      },
      headers: {
        'User-Agent': 'WeatherAPI/1.0 (your-email@example.com)', // Replace with your email
      },
    });

    if (response.data.length === 0) {
      throw new Error('City not found');
    }

    const { lat, lon } = response.data[0];
    return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
  }

  async getWeather(city) {
    // Check for cached data (within 10 minutes)
    const cachedWeather = await Weather.findOne({ city });
    if (cachedWeather && (Date.now() - cachedWeather.lastUpdated) < 10 * 60 * 1000) {
      return cachedWeather;
    }

    // Get coordinates for the city
    const { latitude, longitude } = await this.getCoordinates(city);

    // Fetch current weather and forecast from Open-Meteo
    const weatherUrl = `${this.weatherBaseUrl}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&daily=temperature_2m_max,weather_code&timezone=auto`;
    const weatherResponse = await axios.get(weatherUrl);
    const weatherData = weatherResponse.data;

    // Map Open-Meteo weather codes to descriptions (simplified example)
    const weatherCodeMap = {
      0: 'clear sky',
      1: 'mainly clear',
      2: 'partly cloudy',
      3: 'overcast',
      61: 'light rain',
      63: 'moderate rain',
      // Add more mappings as needed
    };

    // Extract current weather
    const currentWeather = {
      temperature: weatherData.current.temperature_2m,
      humidity: weatherData.current.relative_humidity_2m,
      description: weatherCodeMap[weatherData.current.weather_code] || 'unknown',
    };

    // Extract 5-day forecast (daily data)
    const forecast = weatherData.daily.time.map((date, index) => ({
      date,
      temperature: weatherData.daily.temperature_2m_max[index],
      description: weatherCodeMap[weatherData.daily.weather_code[index]] || 'unknown',
    })).slice(0, 5); // Limit to 5 days

    // Save or update in MongoDB
    const weatherDataToSave = {
      city,
      temperature: currentWeather.temperature,
      humidity: currentWeather.humidity,
      description: currentWeather.description,
      forecast,
      lastUpdated: new Date(),
    };

    await Weather.findOneAndUpdate(
      { city },
      weatherDataToSave,
      { upsert: true, new: true }
    );

    return weatherDataToSave;
  }
}

module.exports = new WeatherService();
