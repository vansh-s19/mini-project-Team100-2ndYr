const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

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

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

/**
 * Upload a file to Pinata IPFS.
 * Returns the CID (content identifier).
 */
async function uploadToPinata(filePath, fileName) {
  const jwt = process.env.PINATA_JWT;
  const gateway = process.env.PINATA_GATEWAY || "gateway.pinata.cloud";

  if (!jwt) {
    throw new Error("PINATA_JWT not configured");
  }

  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));

  const metadata = JSON.stringify({
    name: fileName,
    keyvalues: {
      app: "blockchain-real-estate",
      uploadedAt: new Date().toISOString(),
    },
  });
  formData.append("pinataMetadata", metadata);

  const options = JSON.stringify({ cidVersion: 1 });
  formData.append("pinataOptions", options);

  const response = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    formData,
    {
      maxBodyLength: Infinity,
      headers: {
        Authorization: `Bearer ${jwt}`,
        ...formData.getHeaders(),
      },
    }
  );

  return {
    cid: response.data.IpfsHash,
    url: `https://${gateway}/ipfs/${response.data.IpfsHash}`,
    size: response.data.PinSize,
    timestamp: response.data.Timestamp,
  };
}

/**
 * Generate a mock IPFS CID for demo purposes.
 * Used when Pinata keys are not configured.
 */
function generateMockCID() {
  const hash = crypto.randomBytes(32).toString("hex");
  return `Qm${hash.substring(0, 44)}`;
}

/**
 * POST /api/ipfs/upload
 * Upload a document to IPFS (Pinata or mock).
 */
router.post("/upload", upload.single("document"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  console.log(`📦 IPFS upload: ${req.file.originalname}`);

  try {
    let result;

    if (process.env.PINATA_JWT) {
      // Real Pinata upload
      console.log("  → Uploading to Pinata IPFS...");
      result = await uploadToPinata(req.file.path, req.file.originalname);
      console.log(`  ✅ Uploaded! CID: ${result.cid}`);
    } else {
      // Mock mode for demo
      console.log("  → Mock mode (no Pinata JWT configured)");
      const mockCid = generateMockCID();
      result = {
        cid: mockCid,
        url: `https://ipfs.io/ipfs/${mockCid}`,
        size: req.file.size,
        timestamp: new Date().toISOString(),
        mock: true,
      };
      console.log(`  ✅ Mock CID generated: ${mockCid}`);
    }

    res.json({
      success: true,
      ...result,
      fileName: req.file.originalname,
    });
  } catch (error) {
    console.error("IPFS Error:", error.message);

    // Fallback to mock if Pinata fails
    const mockCid = generateMockCID();
    res.json({
      success: true,
      cid: mockCid,
      url: `https://ipfs.io/ipfs/${mockCid}`,
      size: req.file.size,
      timestamp: new Date().toISOString(),
      mock: true,
      fallback: true,
      fileName: req.file.originalname,
    });
  }
});

module.exports = router;
