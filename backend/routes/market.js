const express = require("express");
const axios = require("axios");
const router = express.Router();

// The Flask ML server URL (Port 5000 is default for Flask)
const ML_SERVER_URL = "http://localhost:5002";

/**
 * @route POST /api/market/predict
 * @desc Get property price prediction from ML model
 */
router.post("/predict", async (req, res) => {
  try {
    const response = await axios.post(`${ML_SERVER_URL}/predict`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error("ML Predict Error:", error.message);
    res.status(500).json({ error: "Failed to fetch price prediction from ML server." });
  }
});

/**
 * @route POST /api/market/predict-rent
 * @desc Get rental price prediction from ML model
 */
router.post("/predict-rent", async (req, res) => {
  try {
    const response = await axios.post(`${ML_SERVER_URL}/predict_rent`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error("ML Rent Predict Error:", error.message);
    res.status(500).json({ error: "Failed to fetch rent prediction from ML server." });
  }
});

/**
 * @route GET /api/market/properties
 * @desc Get list of properties from the ML dataset for mapping
 */
router.get("/properties", async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVER_URL}/properties`);
    res.json(response.data);
  } catch (error) {
    console.warn("ML Server not found. Using mock properties fallback.");
    
    // Premium Mock Data Fallback
    const mockProperties = [
      { id: 101, name: "Emerald Heights", city: "Ahmedabad", area: 1500, bedrooms: 3, price: 7500000, lat: 23.0225, lng: 72.5714 },
      { id: 102, name: "Sapphire Villa", city: "Vadodara", area: 2200, bedrooms: 4, price: 12000000, lat: 22.3072, lng: 73.1812 },
      { id: 103, name: "Ruby Enclave", city: "Surat", area: 1200, bedrooms: 2, price: 5500000, lat: 21.1702, lng: 72.8311 },
      { id: 104, name: "Topaz Tower", city: "Rajkot", area: 1800, bedrooms: 3, price: 8500000, lat: 22.3039, lng: 70.8022 },
      { id: 105, name: "Diamond Estate", city: "Gandhinagar", area: 3000, bedrooms: 5, price: 18000000, lat: 23.2156, lng: 72.6369 }
    ];
    
    res.json(mockProperties);
  }
});

module.exports = router;
