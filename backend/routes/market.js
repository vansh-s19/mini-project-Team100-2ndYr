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

const Property = require("../models/property.model");

/**
 * @route GET /api/market/properties
 * @desc Get list of properties from MongoDB with ML server as fallback
 */
router.get("/properties", async (req, res) => {
  try {
    // Priority: Fetch from live MongoDB Database
    const dbProperties = await Property.find().limit(150);
    
    if (dbProperties && dbProperties.length > 0) {
      // Map DB fields to frontend format
      const mapped = dbProperties.map((p, i) => ({
        ownerName: p.ownerNames,
        propertyName: p.plotNumber,
        address: p.address,
        city: p.district,
        sqft: parseInt(p.area) || 1200,
        bhk: p.bhk,
        status: p.propertyStatus,
        furnished: p.furnishedStatus,
        type: p.propertyType,
        pricePerSqft: 5000, // Derived or mocked for market viz
        lat: parseFloat(p.lat),
        lng: parseFloat(p.lng),
        category: i % 2 === 0 ? "Buying" : "Rental", // Alternating for viz
        source: "real",
        imageUrl: p.imageUrl
      }));
      return res.json(mapped);
    }

    // Secondary: Fetch from ML Server
    const response = await axios.get(`${ML_SERVER_URL}/properties`);
    res.json(response.data);
  } catch (error) {
    console.warn("DB/ML fetch failed. Using emergency mock fallback.");
    
    const mockProperties = [
      { id: 101, propertyName: "Emerald Heights", city: "Ahmedabad", sqft: 1500, bhk: "3 BHK", pricePerSqft: 5000, lat: 23.0225, lng: 72.5714, source: "mock", status: "Ready to Move" },
      { id: 102, propertyName: "Sapphire Villa", city: "Vadodara", sqft: 2200, bhk: "4 BHK", pricePerSqft: 6000, lat: 22.3072, lng: 73.1812, source: "mock", status: "Ready to Move" }
    ];
    
    res.json(mockProperties);
  }
});

module.exports = router;
