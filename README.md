# 🏠 LandChain — Blockchain-Based Real Estate Property Registry

**Live Demo:** [https://land-chain-topaz.vercel.app/](https://land-chain-topaz.vercel.app/)

[admin@landchain.gov.in](mailto:admin@landchain.gov.in) | LandChainAdmin2026

A decentralized property registry and transfer platform built on Ethereum. Features AI-powered OCR document extraction, IPFS document storage, tamper-proof blockchain records, ML-based price prediction, and a Gemini-powered investment assistant.

---

## ⚡ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Smart Contract** | Solidity 0.8.19 |
| **Blockchain** | Hardhat (local, chainId 31337) |
| **Frontend** | Next.js 16 (Turbopack) — deployed on Vercel |
| **Backend** | Node.js + Express (Port 5001) |
| **ML Server** | Python Flask (Port 5002) |
| **OCR** | Tesseract.js 7.0.0 |
| **Storage** | IPFS (Pinata) |
| **Wallet** | MetaMask + ethers.js v5.7.2 |
| **AI / LLM** | Google Gemini 2.5 Flash |
| **Database** | MongoDB (Mongoose 9.4.1) |
| **Auth** | JWT + Passport.js + bcryptjs |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- MetaMask browser extension

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Start Local Blockchain
```bash
npm run node
```
Keep this terminal running. The Hardhat node starts on `http://127.0.0.1:8545` (chainId: `31337`).

### 3. Deploy Smart Contract
In a new terminal:
```bash
npm run compile
npm run deploy
```
This compiles `LandRegistry.sol` and writes the contract address + ABI to `frontend/lib/contract-address.json` automatically.

### 4. Start Backend Server
```bash
npm run backend
```
Runs on **port 5001** (configured to avoid conflicts with other local services).

### 5. Start ML Server (Optional)
```bash
cd backend/models && python flask_server.py
```
Runs on **port 5002**. Required for sale price and rental prediction endpoints.

### 6. Start Frontend
```bash
npm run frontend
```
Open [http://localhost:3000](http://localhost:3000)

### 7. Configure MetaMask
1. Add network: **Hardhat Local** (RPC: `http://127.0.0.1:8545`, Chain ID: `31337`)
2. Import test account using a private key from the Hardhat node output

---

## 📋 Demo Flow

The platform implements a **7-step registration workflow**:

1. **Upload Document** — submit a land registry image (PNG/JPEG/WEBP, max 10 MB)
2. **OCR Extract** — Tesseract.js automatically parses owner name, plot number, registry ID, address, and land area
3. **Confirm Data** — review and correct extracted fields via the multi-step wizard
4. **Store on IPFS** — documents are pinned to Pinata and a metadata CID is generated
5. **Register on Blockchain** — call `registerProperty()` via MetaMask; transaction is confirmed on-chain
6. **Authority Verification** — the deployer account (government authority) reviews and calls `verifyProperty()` from the `/authority` dashboard
7. **Transfer Ownership** — verified properties can be transferred peer-to-peer via `transferProperty()`

Additionally:
- **Price Prediction** — enter property attributes to get ML-based sale price (₹/sqft) and monthly rent estimates
- **ROI Estimator** — Gemini 2.5 Flash provides 5-year ROI %, gross yield %, and qualitative investment insight
- **AI Chatbot** — domain-aware assistant for land documentation, blockchain, and investment queries
- **Public Verification** — any user can verify ownership and view full on-chain history at `/verify`

---

## 📁 Project Structure

```
├── contracts/           # Solidity smart contracts
│   └── LandRegistry.sol
├── scripts/             # Deployment scripts
│   └── deploy.js
├── backend/             # Express API server (Port 5001)
│   ├── server.js
│   ├── routes/
│   └── models/          # Flask ML server + .pkl model files
│       └── flask_server.py
├── frontend/            # Next.js application (Port 3000)
│   ├── app/
│   ├── components/
│   └── lib/
│       └── contract-address.json   # Auto-generated on deploy
├── hardhat.config.js
└── package.json
```

---

## 🔑 Environment Variables

Create `backend/.env`:

```env
MONGODB_URI=<MongoDB Atlas connection string>
JWT_SECRET=<secret for JWT signing>
GOOGLE_CLIENT_ID=<Google OAuth 2.0 client ID>
GOOGLE_CLIENT_SECRET=<Google OAuth 2.0 client secret>
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=<Google Gemini API key>
PINATA_JWT=<Pinata API JWT>
PINATA_GATEWAY=<your-gateway.mypinata.cloud>
```

Without `PINATA_JWT`, the system runs in **mock mode** (generates demo CIDs).
Without `GEMINI_API_KEY`, the AI module falls back to keyword-based mock responses.

---

## 🤖 ML Models

The Flask server (`port 5002`) exposes two prediction endpoints:

**`POST /predict`** — Sale price per sqft
```json
{ "area": 1200, "bedrooms": 2, "bathrooms": 2, "balcony": 1,
  "latitude": 28.6, "longitude": 77.2, "furnish": "Semi-Furnished",
  "property_type": "Apartment", "city": "Delhi" }
```

**`POST /predict_rent`** — Monthly rental value
```json
{ "city": "Mumbai", "locality": "Bandra", "property_type": "Apartment",
  "bhk": 3, "size_sqft": 1500 }
```

Models are trained on multi-city datasets (Delhi, Mumbai, Gurgaon) using `RandomForestRegressor` with KMeans location clustering (k=20). Evaluation: R² = 0.87 (sale), 0.84 (rent).

---

## 🌐 Live Deployment

The frontend is deployed on Vercel at:
**[https://land-chain-topaz.vercel.app/](https://land-chain-topaz.vercel.app/)**

Available pages: Home, Register, My Properties, Market, Maps, Transfer, Verify, Profile, Authority Dashboard.

> Note: The blockchain and backend components require a local Hardhat node. The live Vercel deployment showcases the UI; full end-to-end functionality requires the local setup above.

---

## 📄 License

MIT
