const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/user.model");

const router = express.Router();

// ───────────────────────── Auth Helper & Middleware ─────────────────────────
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "SUPER_SECRET_KEY",
    { expiresIn: "7d" }
  );
};

// Database connection watchdog
const checkDB = (req, res, next) => {
  if (require("mongoose").connection.readyState !== 1) {
    return res.status(503).json({
      error: "Database Connection Error",
      message: "The server is currently unable to reach the database. Please check if your IP is whitelisted in MongoDB Atlas.",
      suggestion: "Make sure you have added 0.0.0.0/0 to your MongoDB Network Access."
    });
  }
  next();
};

router.use(checkDB);

// ───────────────────────── Email/Password Auth ─────────────────────────

// @route   POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    user = await User.create({
      name,
      email,
      password,
      role: role === "authority" ? "authority" : "user"
    });
    const token = generateToken(user);

    const userToReturn = user.toObject();
    delete userToReturn.password;

    res.status(201).json({
      success: true,
      token,
      user: userToReturn,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user);

    const userToReturn = user.toObject();
    delete userToReturn.password;

    res.json({
      success: true,
      token,
      user: userToReturn,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/auth/me
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token, authorization denied" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SUPER_SECRET_KEY");
    const user = await User.findById(decoded.id).select("-password");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    res.status(401).json({ error: "Token is not valid" });
  }
});

// @route   PUT /api/auth/profile
router.put("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token, authorization denied" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SUPER_SECRET_KEY");

    const allowedUpdates = [
      "name", "phone", "pan", "aadhar", "address",
      "city", "state", "pincode", "occupation"
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      decoded.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    res.status(401).json({ error: "Token is not valid" });
  }
});

// ───────────────────────── Google OAuth ─────────────────────────

// @route   GET /api/auth/google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// @route   GET /api/auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication, generate token and redirect to frontend
    const token = generateToken(req.user);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    // In a real app, you might use a cookie or a secure redirect with the token
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }
);

// ───────────────────────── Wallet Auth (Optional Start) ─────────────────────────
router.post("/wallet-login", async (req, res) => {
  try {
    const { walletAddress } = req.body;
    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (!user) {
      user = await User.create({
        name: `User ${walletAddress.substring(0, 6)}`,
        walletAddress: walletAddress.toLowerCase(),
      });
    }

    const token = generateToken(user);
    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
