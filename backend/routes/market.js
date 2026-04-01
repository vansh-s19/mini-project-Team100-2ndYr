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
    console.error("ML Properties Error:", error.message);
    res.status(500).json({ error: "Failed to fetch properties from ML server." });
  }
});

module.exports = router;
