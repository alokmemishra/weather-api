const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
  city: { type: String, required: true },
  temperature: { type: Number },
  humidity: { type: Number },
  description: { type: String },
  forecast: [
    {
      date: { type: String },
      temperature: { type: Number },
      description: { type: String },
    },
  ],
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Weather', weatherSchema);
