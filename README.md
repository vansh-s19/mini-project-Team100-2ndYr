# 🏠 LandChain — Blockchain-Based Real Estate Property Registry
admin@landchain.gov.in
LandChainAdmin2026
A decentralized property registry and transfer platform built on Ethereum. Features AI-powered OCR document extraction, IPFS document storage, and tamper-proof blockchain records.

## ⚡ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Smart Contract** | Solidity 0.8.19 |
| **Blockchain** | Hardhat (local) |
| **Frontend** | Next.js 16 (Turbopack) |
| **Backend** | Node.js + Express |
| **OCR** | Tesseract.js |
| **Storage** | IPFS (Pinata) |
| **Wallet** | MetaMask + ethers.js v6 |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask browser extension

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Start Local Blockchain
```bash
npm run node
```
Keep this terminal running.

### 3. Deploy Smart Contract
In a new terminal:
```bash
npm run compile
npm run deploy
```

### 4. Start Backend Server
```bash
npm run backend
```
*Note: Runs on port 5001 to avoid conflicts.*

### 5. Start Frontend
```bash
npm run frontend
```

Open http://localhost:3000

### 6. Configure MetaMask
1. Add network: **Hardhat Local** (RPC: `http://127.0.0.1:8545`, Chain ID: `31337`)
2. Import test account using a private key from the Hardhat node output

## 📋 Demo Flow

1. **Connect wallet** via MetaMask
2. **Upload** a land registry document → OCR extracts property details
3. **Register** property on blockchain (stored with IPFS document)
4. **Authority verifies** the property (use the deployer account = authority)
5. **Transfer** property ownership to another address
6. **Public verification** shows updated owner and full history

## 📁 Project Structure

```
├── contracts/           # Solidity smart contracts
│   └── LandRegistry.sol
├── scripts/             # Deployment scripts
│   └── deploy.js
├── backend/             # Express API server (Port 5001)
│   ├── server.js
│   └── routes/
├── frontend/            # Next.js application (Port 3000)
│   ├── app/
│   ├── components/
│   └── lib/
├── hardhat.config.js
└── package.json
```

## 🔑 IPFS Configuration (Optional)

For real IPFS uploads, create `backend/.env`:
```
PINATA_JWT=your_jwt_token
PINATA_GATEWAY=your-gateway.mypinata.cloud
```

Without Pinata keys, the system runs in **mock mode** (generates demo CIDs).

## 📄 License

MIT
