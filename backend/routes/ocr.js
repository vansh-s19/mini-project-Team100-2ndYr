const express = require("express");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const router = express.Router();

/**
 * Configure multer for file uploads
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp"
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images are allowed for Tesseract OCR."));
    }
  },
});

/**
 * POST /api/ocr/extract
 * Upload an image and extract property fields via Tesseract.js Local Engine.
 * Reverted from Gemini as per user request for stability.
 */
router.post("/extract", upload.single("document"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  console.log(`📄 OCR Scan Start (Tesseract): ${req.file.originalname}`);

  try {
    const { data: { text } } = await Tesseract.recognize(req.file.path, 'eng', {
      logger: m => console.log(`  [OCR] ${m.status}: ${(m.progress * 100).toFixed(1)}%`)
    });

    console.log("✅ OCR Raw Text Extracted. Parsing fields...");

    // Basic Regex Parsing for Property Details
    const fields = {
      ownerName: "",
      plotNumber: "",
      registryId: "",
      address: "",
      area: ""
    };

    // Owner Name Pattern: "Owner: [Name]" or "Name: [Name]"
    const ownerMatch = text.match(/(?:Owner|Name)[:\s]+([A-Z\s]{3,})/i);
    if (ownerMatch) fields.ownerName = ownerMatch[1].trim();

    // Registry ID Pattern: "Registry ID: [ID]" or "ID: [ID]"
    const idMatch = text.match(/(?:Registry ID|ID)[:\s]+([A-Z0-9-]{4,})/i);
    if (idMatch) fields.registryId = idMatch[1].trim();

    // Plot/Khasra Number Pattern: "Plot No: [No]"
    const plotMatch = text.match(/(?:Plot|Khasra|Survey)[:\s]+No[:\s]*([0-9A-Z/]{2,})/i);
    if (plotMatch) fields.plotNumber = plotMatch[1].trim();

    // Area Pattern: "[Digits] sq ft"
    const areaMatch = text.match(/([0-9,]+)\s*(?:sq\s*ft|square\s*feet|sqm)/i);
    if (areaMatch) fields.area = areaMatch[0].trim();

    // Fallback: If registry ID wasn't found via prefix, look for any uppercase code with numbers
    if (!fields.registryId) {
      const fallbackId = text.match(/[A-Z]{2,}-\d{4,}/);
      if (fallbackId) fields.registryId = fallbackId[0];
    }

    res.json({
      success: true,
      fields,
      fileName: req.file.originalname,
      mode: "tesseract-local"
    });

  } catch (error) {
    console.error("🔥 OCR Engine Error:", error.message);
    res.status(500).json({
      success: false,
      error: "OCR Local Failure",
      message: error.message
    });
  } finally {
    // Clean up uploaded file
    try {
      fs.unlinkSync(req.file.path);
    } catch (e) {
      console.warn("Could not delete temp file:", e.message);
    }
  }
});

module.exports = router;
