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

module.exports = router;
