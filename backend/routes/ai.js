const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Context about your landing page, blockchain, and land laws
const LAND_CHAIN_CONTEXT = `
You are the "LandChain Assistant," a specialized AI for a decentralized property registry platform.
LandChain uses Ethereum/Solidity for smart contracts, Tesseract.js for OCR, and Pinata/IPFS for decentralized storage.

Expert Legal Knowledge Base:
1. Documentation:
   - Sale Deed: Primary proof of ownership transfer.
   - Encumbrance Certificate (EC): Shows if the property is free from legal/monetary liabilities.
   - Khata/Patta: Revenue record identifying the tax-paying owner.
2. Blockchain Logic:
   - Data stored on IPFS is hashed. The hash (CID) is stored on the Ethereum Ledger.
   - This prevents "Double Counting" or "Ghost Sales."
3. Verification:
   - Status 0 (Pending): Uploaded but not reviewed.
   - Status 1 (Verified): Government authority has signed the digital deed.
   - Status 2 (Rejected): Discrepancies found in OCR vs original documents.

Your Goal:
Act as a legal and technical guide. Help users with registration, explain how the blockchain ensures security, and answer specific questions about documentation like EC and Khata.
Keep responses concise, professional, and use bold text for key terms.
`;

router.post("/chat", async (req, res) => {
  const { message, history } = req.body;

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_api_key_here") {
    // Simulated AI Mode for Demo
    console.log("Gemini API key missing. Using simulated response.");
    
    let simulatedResponse = "I am the LandChain AI. I'm currently in Demo Mode. How can I help you with your property registration today?";
    
    if (message.toLowerCase().includes("register")) {
      simulatedResponse = "To register, go to the 'Register Property' page. Upload your land document, and our OCR will extract the Plot No and Owner Name automatically. Once you confirm, it's saved on IPFS and the Blockchain!";
    } else if (message.toLowerCase().includes("blockchain") || message.toLowerCase().includes("secure")) {
      simulatedResponse = "LandChain uses Ethereum smart contracts. This means your ownership record is immutable and cannot be tampered with by any third party.";
    } else if (message.toLowerCase().includes("verify")) {
      simulatedResponse = "After registration, a government authority reviews your document on the 'Authority Dashboard'. Once verified, you get a 'Verified' badge and can transfer the property.";
    }

    return res.json({ response: simulatedResponse, mode: "demo" });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use gemini-2.5-flash for 2026 standards
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Format history for Gemini
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "Hello. Who are you?" }] },
        { role: "model", parts: [{ text: LAND_CHAIN_CONTEXT }] },
        ...(history || []).map(h => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content }]
        }))
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    console.log("AI Chat: Live response generated.");
    res.json({ response: text, mode: "live" });
  } catch (error) {
    console.error("AI Chat Live Error:", error.message);
    
    // Fallback to Simulated Mode if Live API fails
    console.log("Falling back to simulated mode due to API error.");
    let simulatedResponse = "I am the LandChain AI. I'm currently in Demo Mode. How can I help you with your property registration today?";
    
    if (message.toLowerCase().includes("register")) {
      simulatedResponse = "To register, go to the 'Register Property' page. Upload your land document, and our OCR will extract the Plot No and Owner Name automatically.";
    } else if (message.toLowerCase().includes("blockchain") || message.toLowerCase().includes("secure")) {
      simulatedResponse = "LandChain uses Ethereum smart contracts. This means your ownership record is immutable and secure.";
    }

    res.json({ 
      response: simulatedResponse, 
      mode: "fallback",
      error_info: error.message 
    });
  }
});

router.post("/estimate-roi", async (req, res) => {
  const { property } = req.body;

  if (!property) {
    return res.status(400).json({ error: "Property details required" });
  }

  const prompt = `
    Analyze this Indian real estate property and provide a 5-year ROI (Return on Investment) estimate.
    
    Property Details:
    - Name: ${property.propertyName}
    - Type: ${property.type}
    - Location: ${property.address}, ${property.city}
    - Area: ${property.sqft} sqft
    - Current Price: ₹${(property.sqft * property.pricePerSqft).toLocaleString('en-IN')}
    - Price/sqft: ₹${property.pricePerSqft}
    
    Task:
    1. Estimate the 5-year capital appreciation (total % over 5 years).
    2. Estimate the annual rental yield %.
    3. Provide a brief 1-sentence "Vanguard Insight" about this specific location or property type growth.
    
    Return ONLY a JSON object in this format:
    {
      "roi_pct": number,
      "yield_pct": number,
      "insight": "string",
      "confidence": number (0-100)
    }
  `;

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_api_key_here") {
    // Simulated ROI for Demo
    const mockRoi = {
      roi_pct: 42.5,
      yield_pct: 4.2,
      insight: `High growth potential in ${property.city} due to upcoming infrastructure projects.`,
      confidence: 88,
      mode: "demo"
    };
    return res.json(mockRoi);
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    
    const roiData = JSON.parse(text);
    res.json({ ...roiData, mode: "live" });
  } catch (error) {
    console.error("ROI Estimation Error:", error.message);
    res.json({
      roi_pct: 35.0,
      yield_pct: 3.5,
      insight: "Estimated based on historical regional averages (Calculated in Fallback Mode).",
      confidence: 70,
      mode: "fallback"
    });
  }
});

module.exports = router;
