const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const Property = require("../models/property.model");

const router = express.Router();

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB max per upload request

// Helpers
async function uploadToPinata(filePath, fileName) {
  const jwt = process.env.PINATA_JWT;
  const gateway = process.env.PINATA_GATEWAY || "gateway.pinata.cloud";

  if (!jwt) throw new Error("PINATA_JWT not configured");

  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));

  const metadata = JSON.stringify({
    name: fileName,
    keyvalues: { app: "blockchain-real-estate", uploadedAt: new Date().toISOString() },
  });
  formData.append("pinataMetadata", metadata);

  const options = JSON.stringify({ cidVersion: 1 });
  formData.append("pinataOptions", options);

  const response = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    formData,
    { maxBodyLength: Infinity, headers: { Authorization: `Bearer ${jwt}`, ...formData.getHeaders() } }
  );

  return response.data.IpfsHash;
}

async function uploadJsonToPinata(jsonMetadata) {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) throw new Error("PINATA_JWT not configured");

  const response = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    {
        pinataContent: jsonMetadata,
        pinataMetadata: { name: `property-metadata-${Date.now()}.json` }
    },
    { headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" } }
  );

  return response.data.IpfsHash;
}

function generateMockCID() {
  const hash = crypto.randomBytes(32).toString("hex");
  return `QmMock${hash.substring(0, 40)}`;
}

// ───────────────────────── Routes ─────────────────────────

// 1. Search Properties (by Registry ID, Plot Number, or Owner Name)
router.get("/search", async (req, res) => {
  try {
    const rawQuery = req.query.query;
    if (!rawQuery) return res.status(400).json({ error: "Search query is required" });

    const query = rawQuery.trim();

    const properties = await Property.find({
      $or: [
        { registryId: { $regex: query, $options: "i" } },
        { plotNumber: { $regex: query, $options: "i" } },
        { ownerNames: { $regex: query, $options: "i" } },
      ],
    }).limit(10);

    res.json({ success: true, properties });
  } catch (error) {
    console.error("Search Error:", error.message);
    res.status(500).json({ error: "Search failed" });
  }
});

// 2. Sync Blockchain ID to MongoDB
router.patch("/sync-blockchain-id", async (req, res) => {
  try {
    const { registryId, blockchainId } = req.body;
    if (!registryId || blockchainId === undefined) {
      return res.status(400).json({ error: "registryId and blockchainId are required" });
    }

    const property = await Property.findOneAndUpdate(
      { registryId },
      { $set: { blockchainId: parseInt(blockchainId) } },
      { new: true }
    );

    if (!property) return res.status(404).json({ error: "Property not found in database" });

    res.json({ success: true, property });
  } catch (error) {
    console.error("Sync Error:", error.message);
    res.status(500).json({ error: "Sync failed" });
  }
});

// 3. Geocode
router.post("/geocode", async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) return res.status(400).json({ error: "Address is required" });

    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: { q: address, format: "json", limit: 1 },
      headers: { "User-Agent": "LandChain/1.0" }
    });

    if (response.data && response.data.length > 0) {
      return res.json({ lat: response.data[0].lat, lng: response.data[0].lon });
    }
    return res.status(404).json({ error: "Location not found" });
  } catch (error) {
    console.error("Geocoding Error:", error.message);
    res.status(500).json({ error: "Geocoding failed" });
  }
});

/**
 * @route POST /api/property/ensure-record
 * @desc Create a DB record for a blockchain property if it doesn't exist
 */
router.post("/ensure-record", async (req, res) => {
  try {
    const { registryId, ownerAddress, ownerNames, area, address } = req.body;
    
    let property = await Property.findOne({ registryId });
    
    if (!property) {
      console.log(`Creating missing DB record for Registry ID: ${registryId}`);
      property = new Property({
        registryId,
        ownerAddress,
        ownerNames,
        area,
        address,
        district: address.split(",")[0].trim() || "Unknown", // Fallback for market filter
        propertyStatus: "Ready to Move",
        propertyType: "Apartment"
      });
      await property.save();
    }
    
    res.json({ success: true, dbId: property._id });
  } catch (error) {
    console.error("Ensure Record Error:", error.message);
    res.status(500).json({ error: "Failed to sync property record" });
  }
});

/**
 * @route GET /api/property/owner/:address
 * @desc Get all properties registered in DB for an owner
 */
router.get("/owner/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const properties = await Property.find({ ownerAddress: new RegExp(`^${address}$`, "i") });
    res.json({ success: true, properties });
  } catch (error) {
    console.error("Fetch Owner Properties Error:", error.message);
    res.status(500).json({ error: "Failed to fetch owner properties" });
  }
});

// 2. Register Property (Metadata & Files)
router.post("/register-property", upload.fields([
  { name: "saleDeed", maxCount: 1 },
  { name: "ec", maxCount: 1 },
  { name: "khata", maxCount: 1 },
  { name: "images", maxCount: 10 }
]), async (req, res) => {
  try {
    const {
      registryId, ownerAddress, ownerNames, plotNumber, address, lat, lng,
      state, district, propertyType, residentialSubType, bhk, area, unit,
      propertyStatus, ownershipType, furnishedStatus
    } = req.body;

    const files = req.files || {};
    let metadataDocuments = { saleDeed: null, ec: null, khata: null };
    let metadataImages = [];

    const isPinata = !!process.env.PINATA_JWT;

    // Helper to upload a single file
    const processUpload = async (fileArray) => {
      if (!fileArray || fileArray.length === 0) return null;
      const file = fileArray[0];
      if (isPinata) return await uploadToPinata(file.path, file.originalname);
      return generateMockCID();
    };

    // Upload Documents
    metadataDocuments.saleDeed = await processUpload(files.saleDeed);
    metadataDocuments.ec = await processUpload(files.ec);
    metadataDocuments.khata = await processUpload(files.khata);

    // Upload Images
    if (files.images) {
      for (const img of files.images) {
         if (isPinata) {
            metadataImages.push(await uploadToPinata(img.path, img.originalname));
         } else {
            metadataImages.push(generateMockCID());
         }
      }
    }

    // Build Metadata JSON
    const metadata = {
      location: { address, lat, lng, state, district },
      details: { propertyType, residentialSubType, bhk, area, unit, status: propertyStatus, ownershipType, furnishedStatus },
      documents: metadataDocuments,
      images: metadataImages
    };

    // Upload Metadata to IPFS
    let metadataCid;
    if (isPinata) {
      metadataCid = await uploadJsonToPinata(metadata);
    } else {
      metadataCid = generateMockCID();
    }

    // Save to DB (Optional fallback to preserve state)
    try {
        const newProp = new Property({
        registryId, ownerAddress, ownerNames, plotNumber, area, address, lat, lng,
        state, district, propertyType, residentialSubType, bhk, unit,
        propertyStatus, ownershipType, furnishedStatus, ipfsHash: metadataCid
        });
        await newProp.save();
    } catch(dbErr) {
        // Just log the error, don't fail the registration if db is out of sync or duplicate
        console.error("DB Save Warning (Ignored):", dbErr.message);
    }

    res.json({ success: true, metadataHash: metadataCid });
  } catch (error) {
    console.error("Register Property Error:", error.message);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});

/**
 * @route PATCH /api/property/:id/list
 * @desc Toggle property listing status on market
 */
router.patch("/:id/list", async (req, res) => {
  const { id } = req.params;
  const { isListed, listPrice, marketCategory, ownerAddress } = req.body;
  
  console.log(`Listing Request for ${id}:`, { isListed, listPrice, marketCategory, ownerAddress });

  try {
    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ error: "Property not found" });

    console.log(`Found Property owner: ${property.ownerAddress}`);

    // Simple security: Check ownership
    if (property.ownerAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
      console.warn(`Auth Failure: ${property.ownerAddress} !== ${ownerAddress}`);
      return res.status(403).json({ error: "Not authorized to list this property" });
    }

    property.isListed = isListed;
    if (isListed) {
      property.listPrice = listPrice;
      property.marketCategory = marketCategory;
    }

    await property.save();
    console.log("Property updated successfully");
    res.json({ message: `Property ${isListed ? "listed on" : "removed from"} market`, property });
  } catch (error) {
    console.error("Listing error:", error);
    res.status(500).json({ error: "Failed to update listing status" });
  }
});

module.exports = router;
