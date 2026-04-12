const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const mongoose = require("mongoose");
const passport = require("./config/passport");
const ocrRoutes = require("./routes/ocr");
const ipfsRoutes = require("./routes/ipfs");
const aiRoutes = require("./routes/ai");
const marketRoutes = require("./routes/market");
const authRoutes = require("./routes/auth");
const propertyRoutes = require("./routes/property");

const app = express();
const PORT = process.env.PORT || 5000;

// ───────────────────────── Database Connection ─────────────────────────
const dbOptions = {
  serverSelectionTimeoutMS: 5000, // Fail fast if can't connect (5s)
};

mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/landchain", dbOptions)
  .then(() => console.log("🍃 MongoDB Connected Successfully"))
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
    console.error("👉 TIP: If you're using MongoDB Atlas, make sure your IP is whitelisted (0.0.0.0/0 for demo).");
  });

// Disable buffering to fail fast on queries if DB is down
mongoose.set("bufferCommands", false);

mongoose.connection.on('error', err => {
  console.error('🔥 Mongoose connection error:', err);
});

// ───────────────────────── Middleware ─────────────────────────
app.use(cors({
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Serve uploaded files statically (for preview)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/public", express.static(path.join(__dirname, "public")));

// ───────────────────────── Routes ─────────────────────────
app.use("/api/ocr", ocrRoutes);
app.use("/api/ipfs", ipfsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/property", propertyRoutes);

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

  // Handle Multer specific errors (e.g., file validation)
  if (err.name === "MulterError" || err.message.includes("Only images are allowed")) {
    return res.status(400).json({
      error: "Bad Request",
      message: err.message,
    });
  }

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
