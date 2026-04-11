const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple users with no email (if just oauth)
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: 6,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  avatar: {
    type: String,
  },
  role: {
    type: String,
    enum: ["user", "authority"],
    default: "user",
  },
  walletAddress: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
  },
  // Profile & KYC Details
  phone: { type: String, trim: true },
  pan: { type: String, trim: true },
  aadhar: { type: String, trim: true },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  occupation: { type: String },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
