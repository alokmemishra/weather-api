const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');

router.get('/weather/:city', async (req, res) => {
  try {
    const city = req.params.city;
    const weatherData = await weatherService.getWeather(city);
    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
