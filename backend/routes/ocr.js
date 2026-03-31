const express = require("express");
const multer = require("multer");
const { createWorker } = require("tesseract.js");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Configure multer for file uploads
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
      "image/tiff",
      "image/bmp",
      "application/pdf",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images and PDFs are allowed."));
    }
  },
});

/**
 * Parse extracted OCR text to identify structured property fields.
 * Uses multiple regex patterns to maximize field extraction.
 */
function parsePropertyFields(text) {
  const fields = {
    ownerName: "",
    plotNumber: "",
    registryId: "",
    area: "",
    address: "",
    date: "",
  };

  if (!text) return fields;

  // Normalize text - collapse newlines and extra spaces
  const normalized = text.replace(/\r\n/g, "\n").replace(/\n+/g, "\n");
  const lines = normalized.split("\n").map((l) => l.trim()).filter(Boolean);

  // ── Owner Name patterns ──
  const ownerPatterns = [
    /(?:owner|name|registered\s*to|holder|proprietor)\s*[:\-—]?\s*(.+)/i,
    /(?:shri|smt|mr|mrs|ms)\.?\s+([A-Za-z\s]+)/i,
    /(?:son|daughter|wife)\s+of\s+/i,
  ];
  for (const pattern of ownerPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      fields.ownerName = match[1].trim().substring(0, 100);
      break;
    }
  }

  // ── Plot Number patterns ──
  const plotPatterns = [
    /(?:plot|khasra|survey|parcel)\s*(?:no|number|#)?\s*[:\-—]?\s*([A-Za-z0-9\-\/]+)/i,
    /(?:plot)\s+(\d+[A-Za-z]?)/i,
  ];
  for (const pattern of plotPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      fields.plotNumber = match[1].trim();
      break;
    }
  }

  // ── Registry ID patterns ──
  const registryPatterns = [
    /(?:registry|registration|document|deed)\s*(?:id|no|number|#)?\s*[:\-—]?\s*([A-Za-z0-9\-\/]+)/i,
    /(?:reg)\s*\.?\s*(?:no|id)\s*[:\-—]?\s*([A-Za-z0-9\-\/]+)/i,
  ];
  for (const pattern of registryPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      fields.registryId = match[1].trim();
      break;
    }
  }

  // ── Area patterns ──
  const areaPatterns = [
    /(?:area|extent|measurement|size)\s*[:\-—]?\s*([\d,\.]+\s*(?:sq\.?\s*(?:ft|feet|m|meters|yards|mtr)|acres?|hectares?|bigha|biswa|gaj|marla|kanal|cent))/i,
    /(\d+[\d,\.]*\s*(?:sq\.?\s*(?:ft|feet|m|meters)|acres?|hectares?))/i,
  ];
  for (const pattern of areaPatterns) {
    const match = text.match(pattern);
    if (match) {
      fields.area = match[1] ? match[1].trim() : match[0].trim();
      break;
    }
  }

  // ── Address patterns ──
  const addressPatterns = [
    /(?:address|location|situated\s*at|property\s*at|village|district|tehsil)\s*[:\-—]?\s*(.+)/i,
  ];
  for (const pattern of addressPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      fields.address = match[1].trim().substring(0, 200);
      break;
    }
  }

  // ── Date patterns ──
  const datePatterns = [
    /(?:date|dated|registration\s*date|reg\.\s*date)\s*[:\-—]?\s*(\d{1,2}[\-\/\.]\d{1,2}[\-\/\.]\d{2,4})/i,
    /(\d{1,2}[\-\/\.]\d{1,2}[\-\/\.]\d{4})/,
    /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4})/i,
  ];
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      fields.date = match[1].trim();
      break;
    }
  }

  return fields;
}

/**
 * POST /api/ocr/extract
 * Upload an image or PDF and extract property fields via OCR.
 */
router.post("/extract", upload.single("document"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  console.log(`📄 OCR processing: ${req.file.originalname}`);

  try {
    // Initialize Tesseract worker
    const worker = await createWorker("eng");

    // Perform OCR
    const {
      data: { text, confidence },
    } = await worker.recognize(req.file.path);

    await worker.terminate();

    console.log(`✅ OCR complete. Confidence: ${confidence}%`);

    // Parse structured fields from raw text
    const fields = parsePropertyFields(text);

    res.json({
      success: true,
      rawText: text,
      confidence: Math.round(confidence),
      fields,
      fileName: req.file.originalname,
      filePath: req.file.filename,
    });
  } catch (error) {
    console.error("OCR Error:", error);
    res.status(500).json({
      error: "OCR processing failed",
      message: error.message,
    });
  }
});

module.exports = router;
