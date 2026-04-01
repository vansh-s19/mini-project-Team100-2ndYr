const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listAllModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    console.log("🔍 Scanning for available Gemini models...");
    // The SDK for Node doesn't have a direct listModels, we usually use the REST API or try common names
    const models = [
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-1.0-pro",
      "gemini-pro",
      "gemini-pro-vision"
    ];
    
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        const result = await model.generateContent("Hi");
        const text = await result.response.text();
        console.log(`✅ Model '${m}' is ACTIVE (Response: ${text.trim()})`);
      } catch (e) {
        console.log(`❌ Model '${m}' is INACTIVE: ${e.message.split('\n')[0]}`);
      }
    }
  } catch (err) {
    console.error("General Failure:", err);
  }
}

listAllModels();
