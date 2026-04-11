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
    "lib"
  );

  // Also save to the new Next.js frontend
  const newFrontendLibDir = path.join(
    __dirname,
    "..",
    "new_frontend",
    "LandChain-main",
    "lib"
  );

  const outputDirs = [frontendContractsDir, newFrontendLibDir];

  for (const dir of outputDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Save address
    fs.writeFileSync(
      path.join(dir, "contract-address.json"),
      JSON.stringify({ LandRegistry: contractAddress }, null, 2)
    );

    // Copy ABI
    const artifact = await hre.artifacts.readArtifact("LandRegistry");
    fs.writeFileSync(
      path.join(dir, "LandRegistry.json"),
      JSON.stringify(artifact, null, 2)
    );
  }

  console.log("  📁 Contract address saved to frontend/src/contracts/");
  console.log("  📁 Contract address saved to new_frontend/LandChain-main/lib/");
  console.log("  📁 ABI copied to both frontends");
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  🎉 Deployment Complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
