const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const ocrRoutes = require("./routes/ocr");
const ipfsRoutes = require("./routes/ipfs");
const aiRoutes = require("./routes/ai");
const marketRoutes = require("./routes/market");

const app = express();
const PORT = process.env.PORT || 5000;

// ───────────────────────── Middleware ─────────────────────────
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically (for preview)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ───────────────────────── Routes ─────────────────────────
app.use("/api/ocr", ocrRoutes);
app.use("/api/ipfs", ipfsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/market", marketRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      ocr: "active",
      ipfs: process.env.PINATA_JWT ? "pinata" : "mock",
      ai: "active"
    },
  });
});

// ───────────────────────── Error Handling ─────────────────────────
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// ───────────────────────── Start Server ─────────────────────────
app.listen(PORT, () => {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  🏠 Real Estate Backend Server`);
  console.log(`  📡 Running on http://localhost:${PORT}`);
  console.log(`  📄 OCR Engine : Tesseract.js (Local)`);
  console.log(`  📦 IPFS       : ${process.env.PINATA_JWT ? "Pinata" : "Mock Mode"}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});
