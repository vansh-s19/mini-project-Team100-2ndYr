const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  🏗️  Deploying LandRegistry Contract");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Deployer address : ${deployer.address}`);
  console.log(`  Authority address: ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`  Deployer balance : ${hre.ethers.formatEther(balance)} ETH`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Deploy the contract
  const LandRegistry = await hre.ethers.getContractFactory("LandRegistry");
  const landRegistry = await LandRegistry.deploy(deployer.address);
  await landRegistry.waitForDeployment();

  const contractAddress = await landRegistry.getAddress();

  console.log(`  ✅ LandRegistry deployed to: ${contractAddress}\n`);

  // Save contract address and ABI for frontend
  const frontendContractsDir = path.join(
    __dirname,
    "..",
    "frontend",
    "src",
    "contracts"
  );

  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }

  // Save address
  fs.writeFileSync(
    path.join(frontendContractsDir, "contract-address.json"),
    JSON.stringify({ LandRegistry: contractAddress }, null, 2)
  );

  // Copy ABI
  const artifact = await hre.artifacts.readArtifact("LandRegistry");
  fs.writeFileSync(
    path.join(frontendContractsDir, "LandRegistry.json"),
    JSON.stringify(artifact, null, 2)
  );

  console.log("  📁 Contract address saved to frontend/src/contracts/");
  console.log("  📁 ABI copied to frontend/src/contracts/");
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  🎉 Deployment Complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
