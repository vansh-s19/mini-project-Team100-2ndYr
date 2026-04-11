const mongoose = require("mongoose");
require("dotenv").config();

console.log("Connect to:", process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ CONNECTED SUCCESSFULLY");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ CONNECTION ERROR:", err.message);
    process.exit(1);
  });

setTimeout(() => {
  console.log("⏰ TIMED OUT");
  process.exit(1);
}, 20000);
