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
 * @desc Get ALL marketplace properties: user-listed (DB) + seed data (ML server)
 */
router.get("/properties", async (req, res) => {
  try {
    let allProperties = [];

    // 1. Fetch ALL properties from MongoDB (seed data + user-listed)
    const dbProperties = await Property.find({}).limit(300);
    
    if (dbProperties && dbProperties.length > 0) {
      // Geocode any that are missing lat/lng
      for (const p of dbProperties) {
        if ((!p.lat || !p.lng) && p.address) {
          try {
            const geoResp = await axios.get("https://nominatim.openstreetmap.org/search", {
              params: { q: p.address, format: "json", limit: 1 },
              headers: { "User-Agent": "LandChain/1.0" }
            });
            if (geoResp.data && geoResp.data.length > 0) {
              p.lat = geoResp.data[0].lat;
              p.lng = geoResp.data[0].lon;
              await p.save(); // persist coordinates for next time
            }
          } catch (geoErr) {
            console.warn("Geocode failed for:", p.address);
          }
        }
      }

      const mapped = dbProperties.map((p) => ({
        id: p._id,
        ownerName: p.ownerNames || "Unknown",
        propertyName: p.plotNumber || p.ownerNames + "'s Property",
        address: p.address || "India",
        city: p.district || "Unknown",
        sqft: parseInt(p.area) || 1200,
        bhk: p.bhk || "2 BHK",
        status: p.propertyStatus || "Ready to Move",
        furnished: p.furnishedStatus || "Unfurnished",
        type: p.propertyType || "Apartment",
        pricePerSqft: p.listPrice ? (p.listPrice / (parseInt(p.area) || 1)) : (Math.floor(Math.random() * 8000) + 4000), 
        lat: parseFloat(p.lat) || null,
        lng: parseFloat(p.lng) || null,
        category: p.marketCategory || "Buying",
        source: p.isListed ? "real" : (p.registryId?.startsWith("LC-SEED") ? "mock" : "real"),
        imageUrl: p.imageUrl
      }));
      allProperties.push(...mapped);
    }

    // 2. Fetch seed/mock data from ML Server and merge
    try {
      const mlResp = await axios.get(`${ML_SERVER_URL}/properties`, { timeout: 3000 });
      if (Array.isArray(mlResp.data)) {
        allProperties.push(...mlResp.data);
      }
    } catch (mlErr) {
      console.warn("ML server unavailable, using mock fallback for seed data.");
      // Fallback mock data if ML server is down
      const mockProperties = [
        { id: 101, propertyName: "Emerald Heights", city: "Ahmedabad", address: "SG Highway, Ahmedabad", sqft: 1500, bhk: "3 BHK", pricePerSqft: 5000, lat: 23.0225, lng: 72.5714, source: "mock", status: "Ready to Move", category: "Buying", type: "Apartment", furnished: "Semi-Furnished" },
        { id: 102, propertyName: "Sapphire Villa", city: "Vadodara", address: "Alkapuri, Vadodara", sqft: 2200, bhk: "4 BHK", pricePerSqft: 6000, lat: 22.3072, lng: 73.1812, source: "mock", status: "Ready to Move", category: "Buying", type: "Villa", furnished: "Furnished" },
        { id: 103, propertyName: "DLF Cyber City Apt", city: "Gurgaon", address: "Sector 24, Gurgaon", sqft: 1800, bhk: "3 BHK", pricePerSqft: 9500, lat: 28.4949, lng: 77.0889, source: "mock", status: "Ready to Move", category: "Buying", type: "Apartment", furnished: "Semi-Furnished" },
        { id: 104, propertyName: "Brigade Gateway", city: "Bengaluru", address: "Rajajinagar, Bengaluru", sqft: 1650, bhk: "3 BHK", pricePerSqft: 8200, lat: 12.9906, lng: 77.5537, source: "mock", status: "Ready to Move", category: "Buying", type: "Apartment", furnished: "Unfurnished" },
        { id: 105, propertyName: "Lodha Bellissimo", city: "Mumbai", address: "Mahalaxmi, Mumbai", sqft: 2900, bhk: "4 BHK", pricePerSqft: 32000, lat: 18.9867, lng: 72.8118, source: "mock", status: "Ready to Move", category: "Buying", type: "Apartment", furnished: "Furnished" },
        { id: 106, propertyName: "Prestige Lakeside", city: "Hyderabad", address: "Kokapet, Hyderabad", sqft: 1900, bhk: "3 BHK", pricePerSqft: 7500, lat: 17.4065, lng: 78.3524, source: "mock", status: "Under Construction", category: "Buying", type: "Apartment", furnished: "Unfurnished" },
        { id: 107, propertyName: "Studio Nest", city: "Pune", address: "Hinjewadi, Pune", sqft: 650, bhk: "1 BHK", pricePerSqft: 6800, lat: 18.5996, lng: 73.7389, source: "mock", status: "Ready to Move", category: "Rental", type: "Apartment", furnished: "Furnished" },
        { id: 108, propertyName: "Godrej Horizon", city: "Pune", address: "Undri, Pune", sqft: 1350, bhk: "2 BHK", pricePerSqft: 5800, lat: 18.4602, lng: 73.9146, source: "mock", status: "Ready to Move", category: "Rental", type: "Apartment", furnished: "Semi-Furnished" },
        { id: 109, propertyName: "Sobha Dream Acres", city: "Bengaluru", address: "Panathur, Bengaluru", sqft: 1100, bhk: "2 BHK", pricePerSqft: 7000, lat: 12.9352, lng: 77.6910, source: "mock", status: "Ready to Move", category: "Rental", type: "Apartment", furnished: "Unfurnished" },
        { id: 110, propertyName: "DLF The Crest", city: "Gurgaon", address: "Sector 54, Gurgaon", sqft: 3200, bhk: "4 BHK", pricePerSqft: 15000, lat: 28.4445, lng: 77.0926, source: "mock", status: "Ready to Move", category: "Rental", type: "Apartment", furnished: "Furnished" },
      ];
      allProperties.push(...mockProperties);
    }

    // Filter out any without valid coords for map display
    const validProperties = allProperties.filter(p => p.lat && p.lng);

    return res.json(validProperties);
  } catch (error) {
    console.error("Market Properties Error:", error.message);
    res.status(500).json({ error: "Failed to fetch market properties" });
  }
});

module.exports = router;
