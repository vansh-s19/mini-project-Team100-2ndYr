# System Architecture

LandChain uses a modern decentralized full-stack approach.

## Tech Stack
* **Frontend**: React, Vite, TailwindCSS, ethers.js v5
* **Backend**: Node.js, Express.js
* **Smart Contracts**: Solidity 0.8.19
* **Blockchain Environment**: Hardhat (local node)
* **Storage**: IPFS via Pinata
* **OCR Processing**: Tesseract.js

## Components Workflow
1. Client uploads document via Frontend.
2. Backend receives file, runs Tesseract OCR, and returns parsed fields.
3. User confirms, and Backend uploads file to Pinata IPFS, returning the CID.
4. Frontend interacts with MetaMask via ethers.js to call `registerProperty(ID, CID, ...)` on the Smart Contract.
5. The blockchain records the state and metadata.

## Directory Structure
```text
project-root
├── contracts/           # Solidity smart contracts
├── scripts/             # Deployment scripts
├── backend/             # Express API server
│   ├── server.js
│   └── routes/
│       ├── ocr.js       # Tesseract OCR processing
│       └── ipfs.js      # IPFS/Pinata uploads
├── frontend/            # React application
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── pages/       # 6 application pages
│       ├── context/     # Web3 wallet context
│       └── contracts/   # ABI & contract address
├── hardhat.config.js
└── package.json
```
