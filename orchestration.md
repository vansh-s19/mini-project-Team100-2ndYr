# LandChain Orchestration & Startup Guide

Follow these steps to spin up all necessary services for the LandChain full-stack application. You will need to run these commands from the project root directory.

### 1. Install Dependencies
If you haven't already, install all Node.js dependencies for the root, backend, and frontend.
```powershell
npm run install:all
```

### 2. Start Services
To run the full stack, you should open **three separate terminals**, all situated in the project's root directory.

#### Terminal 1: Local Blockchain
Start the Hardhat local testing network. You must keep this terminal open and running.
```powershell
npm run node
```
*(Wait a few seconds for the node to fully initialize and display the list of test accounts).*

#### Terminal 2: Deployment & Backend
Once the blockchain is running, you need to compile and deploy the Solidity smart contracts to the local node, and then launch the backend server.
```powershell
# 1. Compile the smart contracts
npm run compile

# 2. Deploy them to the active local node
npm run deploy

# 3. Start the Express API server
npm run backend
```
*Your backend will run on `http://localhost:5000`. Leave this terminal open.*

#### Terminal 3: React Frontend
Finally, start the Vite development server for the React web application.
```powershell
npm run frontend
```
*Your frontend will open automatically or be available at `http://localhost:3000`. Leave this terminal open.*

---

### Command Cheat Sheet
| Action | Command |
| ------ | ------- |
| Install Dependencies | `npm run install:all` |
| Start Blockchain Node | `npm run node` |
| Compile Contracts | `npm run compile` |
| Deploy Contracts | `npm run deploy` |
| Start Server API | `npm run backend` |
| Start Web App | `npm run frontend` |
