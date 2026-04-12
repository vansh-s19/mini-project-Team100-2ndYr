const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  registryId: { type: String, required: true, unique: true },
  ownerAddress: { type: String, required: true },
  ownerNames: { type: String, required: true },
  plotNumber: { type: String },
  area: { type: String },
  address: { type: String },
  lat: { type: String },
  lng: { type: String },
  state: { type: String },
  district: { type: String },
  propertyType: { type: String },
  residentialSubType: { type: String },
  bhk: { type: String },
  unit: { type: String },
  propertyStatus: { type: String },
  ownershipType: { type: String },
  furnishedStatus: { type: String },
  ipfsHash: { type: String },
  verified: { type: Boolean, default: false },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Property = mongoose.model("Property", propertySchema);
module.exports = Property;
